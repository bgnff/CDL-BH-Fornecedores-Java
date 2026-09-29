-- ============================================================
-- Migration Supabase (PostgreSQL): Tabela de Beneficiários
-- Fundação CDL-BH
-- ============================================================

-- 1. Criar a tabela de beneficiários caso não exista
CREATE TABLE IF NOT EXISTS public.beneficiarios (
  id              BIGSERIAL PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  cpf             VARCHAR(20),
  data_nascimento DATE,
  telefone        VARCHAR(30),
  email           VARCHAR(200),
  projeto_id      BIGINT REFERENCES public.projetos(id) ON DELETE SET NULL ON UPDATE CASCADE,
  bairro          VARCHAR(150),
  status          VARCHAR(30) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Em Acompanhamento', 'Concluído', 'Inativo')),
  favorito        BOOLEAN NOT NULL DEFAULT false,
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.beneficiarios IS 'Pessoas atendidas pelos projetos sociais da Fundação CDL-BH';

-- 2. Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trg_beneficiarios_updated_at ON public.beneficiarios;
CREATE TRIGGER trg_beneficiarios_updated_at
BEFORE UPDATE ON public.beneficiarios
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_beneficiarios_projeto ON public.beneficiarios(projeto_id);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_status ON public.beneficiarios(status);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_favorito ON public.beneficiarios(favorito);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_cpf ON public.beneficiarios(cpf);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_created ON public.beneficiarios(created_at DESC);

-- 4. Habilitar Row Level Security (RLS) e Políticas
ALTER TABLE public.beneficiarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de beneficiarios" ON public.beneficiarios;
CREATE POLICY "Permitir leitura de beneficiarios" ON public.beneficiarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escrita de beneficiarios" ON public.beneficiarios;
CREATE POLICY "Permitir escrita de beneficiarios" ON public.beneficiarios FOR ALL USING (true) WITH CHECK (true);

-- 5. Conceder permissões de acesso aos papéis do Supabase
GRANT ALL ON TABLE public.beneficiarios TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.beneficiarios_id_seq TO postgres, anon, authenticated, service_role;
