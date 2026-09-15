-- ============================================================
-- Schema PostgreSQL / Supabase: Sistema de Gestão de Fornecedores
-- Fundação CDL-BH
-- ============================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Função genérica para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::TEXT, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELA: projetos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projetos (
  id          BIGSERIAL PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL UNIQUE,
  descricao   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.projetos IS 'Projetos sociais e iniciativas da Fundação CDL-BH';

DROP TRIGGER IF EXISTS trg_projetos_updated_at ON public.projetos;
CREATE TRIGGER trg_projetos_updated_at
BEFORE UPDATE ON public.projetos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TABELA: fornecedores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id             BIGSERIAL PRIMARY KEY,
  nome           VARCHAR(200) NOT NULL,
  empresa_pf     VARCHAR(200) NOT NULL,
  cnpj           VARCHAR(20) UNIQUE,
  email          VARCHAR(200),
  telefone       VARCHAR(30),
  palavra_chave  VARCHAR(300),
  projeto_id     BIGINT REFERENCES public.projetos(id) ON DELETE SET NULL ON UPDATE CASCADE,
  observacao     TEXT,
  permissao_para JSONB DEFAULT '[]'::jsonb,
  status         VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'ATIVO', 'INATIVO')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.fornecedores IS 'Fornecedores e parceiros cadastrados da Fundação CDL-BH';

DROP TRIGGER IF EXISTS trg_fornecedores_updated_at ON public.fornecedores;
CREATE TRIGGER trg_fornecedores_updated_at
BEFORE UPDATE ON public.fornecedores
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON public.fornecedores(status);
CREATE INDEX IF NOT EXISTS idx_fornecedores_projeto ON public.fornecedores(projeto_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON public.fornecedores(cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_created ON public.fornecedores(created_at DESC);

-- Índice de busca textual completa (PostgreSQL Fulltext / gin index)
CREATE INDEX IF NOT EXISTS idx_fornecedores_search ON public.fornecedores 
USING gin(to_tsvector('portuguese', coalesce(nome, '') || ' ' || coalesce(empresa_pf, '') || ' ' || coalesce(palavra_chave, '')));

-- ============================================================
-- TABELA: documentos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documentos (
  id              BIGSERIAL PRIMARY KEY,
  fornecedor_id   BIGINT NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE ON UPDATE CASCADE,
  nome            VARCHAR(200) NOT NULL,
  tipo            VARCHAR(50) NOT NULL DEFAULT 'Outro' CHECK (tipo IN ('Contrato', 'Certidão', 'Nota Fiscal', 'Nota_Fiscal', 'Alvará', 'Outro')),
  data_vencimento DATE,
  arquivo_url     VARCHAR(500),
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.documentos IS 'Documentos, certidões e contratos vinculados aos fornecedores';

DROP TRIGGER IF EXISTS trg_documentos_updated_at ON public.documentos;
CREATE TRIGGER trg_documentos_updated_at
BEFORE UPDATE ON public.documentos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_documentos_fornecedor ON public.documentos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_documentos_vencimento ON public.documentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON public.documentos(tipo);

-- ============================================================
-- TABELA: logs (Auditoria)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.logs (
  id           BIGSERIAL PRIMARY KEY,
  usuario_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usuario_nome VARCHAR(150),
  acao         VARCHAR(50) NOT NULL,
  tabela       VARCHAR(50) NOT NULL,
  registro_id  BIGINT,
  detalhes     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.logs IS 'Registro de auditoria para ações CREATE, UPDATE e DELETE';

CREATE INDEX IF NOT EXISTS idx_logs_usuario ON public.logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_tabela ON public.logs(tabela);
CREATE INDEX IF NOT EXISTS idx_logs_created ON public.logs(created_at DESC);

-- ============================================================
-- TABELA: backup_metadata (Metadados de backup)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.backup_metadata (
  id              BIGSERIAL PRIMARY KEY,
  tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('FULL', 'INCREMENTAL')),
  arquivo         VARCHAR(255) NOT NULL,
  binlog_file     VARCHAR(100),
  binlog_position BIGINT,
  executado_em    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

CREATE INDEX IF NOT EXISTS idx_backup_tipo ON public.backup_metadata(tipo);
CREATE INDEX IF NOT EXISTS idx_backup_executado ON public.backup_metadata(executado_em DESC);

-- ============================================================
-- STORAGE BUCKET: documentos-fornecedores
-- ============================================================
-- Cria o bucket no Supabase Storage caso não exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-fornecedores', 'documentos-fornecedores', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_metadata ENABLE ROW LEVEL SECURITY;

-- Políticas para projetos (leitura pública / anon e autenticados)
DROP POLICY IF EXISTS "Permitir leitura de projetos" ON public.projetos;
CREATE POLICY "Permitir leitura de projetos" ON public.projetos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escrita de projetos" ON public.projetos;
CREATE POLICY "Permitir escrita de projetos" ON public.projetos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para fornecedores
DROP POLICY IF EXISTS "Permitir leitura de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir leitura de fornecedores" ON public.fornecedores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir inserção de fornecedores" ON public.fornecedores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir atualização de fornecedores" ON public.fornecedores FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir exclusão de fornecedores" ON public.fornecedores FOR DELETE USING (true);

-- Políticas para documentos
DROP POLICY IF EXISTS "Permitir leitura de documentos" ON public.documentos;
CREATE POLICY "Permitir leitura de documentos" ON public.documentos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de documentos" ON public.documentos;
CREATE POLICY "Permitir inserção de documentos" ON public.documentos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de documentos" ON public.documentos;
CREATE POLICY "Permitir atualização de documentos" ON public.documentos FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de documentos" ON public.documentos;
CREATE POLICY "Permitir exclusão de documentos" ON public.documentos FOR DELETE USING (true);

-- Políticas para logs
DROP POLICY IF EXISTS "Permitir leitura de logs" ON public.logs;
CREATE POLICY "Permitir leitura de logs" ON public.logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserção de logs" ON public.logs;
CREATE POLICY "Permitir inserção de logs" ON public.logs FOR INSERT WITH CHECK (true);

-- Políticas para backup_metadata
DROP POLICY IF EXISTS "Permitir leitura de backups" ON public.backup_metadata;
CREATE POLICY "Permitir leitura de backups" ON public.backup_metadata FOR SELECT USING (true);

-- Políticas para Storage (bucket documentos-fornecedores)
DROP POLICY IF EXISTS "Permitir acesso público a arquivos de documentos" ON storage.objects;
CREATE POLICY "Permitir acesso público a arquivos de documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos-fornecedores');

DROP POLICY IF EXISTS "Permitir upload de arquivos de documentos" ON storage.objects;
CREATE POLICY "Permitir upload de arquivos de documentos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documentos-fornecedores');

DROP POLICY IF EXISTS "Permitir deleção de arquivos de documentos" ON storage.objects;
CREATE POLICY "Permitir deleção de arquivos de documentos"
ON storage.objects FOR DELETE
USING (bucket_id = 'documentos-fornecedores');

-- ============================================================
-- PERMISSÕES DE ACESSO AOS ROLES DO SUPABASE (anon e authenticated)
-- Essencial para evitar o erro 42501 (permission denied for table)
-- ============================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ============================================================
-- CARGA INICIAL: Projetos Sociais da Fundação CDL-BH
-- ============================================================
INSERT INTO public.projetos (nome, descricao) VALUES
  ('Projeto Afeto', 'Iniciativa social da Fundação CDL-BH voltada ao acolhimento e desenvolvimento'),
  ('Afeto Empreendedorismo', 'Capacitação empreendedora comunitária'),
  ('Alimentando Vidas', 'Apoio e segurança alimentar para famílias em situação de vulnerabilidade'),
  ('Brincadeira é Coisa Séria', 'Ações recreativas, culturais e pedagógicas'),
  ('Brinquedoteca Itinerante', 'Espaço lúdico móvel para comunidades de Belo Horizonte'),
  ('Despertar Empreendedor', 'Formação básica de negócios e protagonismo'),
  ('Liderança Jovem', 'Desenvolvimento de jovens líderes para o futuro profissional'),
  ('Natal de Todo Mundo', 'Campanha solidária natalina da Fundação CDL-BH'),
  ('Programa Educação e Trabalho (PET)', 'Inclusão produtiva e primeiro emprego para jovens'),
  ('Protagonizar en Cena', 'Oficinas culturais e teatro comunitário'),
  ('Sorridente', 'Ações de saúde bucal e prevenção odontológica'),
  ('Ver é Bom Demais', 'Triagem oftalmológica e doação de óculos de grau'),
  ('Outro', 'Outros projetos e parcerias institucionais')
ON CONFLICT (nome) DO NOTHING;
