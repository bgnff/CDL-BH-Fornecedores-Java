-- ============================================================
-- Migration Supabase (PostgreSQL): Prestadores e Parceiros
-- Fundação CDL-BH
-- ============================================================

-- 1. TABELA DE PRESTADORES DE SERVIÇOS
CREATE TABLE IF NOT EXISTS public.prestadores (
  id              BIGSERIAL PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  empresa_pf      VARCHAR(200),
  tipo_pessoa     VARCHAR(10) NOT NULL DEFAULT 'PJ' CHECK (tipo_pessoa IN ('PJ', 'PF')),
  documento       VARCHAR(25),
  servico         VARCHAR(150) NOT NULL,
  especialidade   VARCHAR(150),
  telefone        VARCHAR(30),
  email           VARCHAR(200),
  projeto         VARCHAR(150),
  projeto_id      BIGINT REFERENCES public.projetos(id) ON DELETE SET NULL ON UPDATE CASCADE,
  cidade          VARCHAR(100) DEFAULT 'Belo Horizonte',
  status          VARCHAR(30) NOT NULL DEFAULT 'Ativo',
  observacoes     TEXT,
  favorito        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.prestadores IS 'Prestadores de serviços, assessorias e consultores da Fundação CDL-BH';

-- Trigger para updated_at em prestadores
DROP TRIGGER IF EXISTS trg_prestadores_updated_at ON public.prestadores;
CREATE TRIGGER trg_prestadores_updated_at
BEFORE UPDATE ON public.prestadores
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índices para prestadores
CREATE INDEX IF NOT EXISTS idx_prestadores_status ON public.prestadores(status);
CREATE INDEX IF NOT EXISTS idx_prestadores_favorito ON public.prestadores(favorito);
CREATE INDEX IF NOT EXISTS idx_prestadores_tipo_pessoa ON public.prestadores(tipo_pessoa);
CREATE INDEX IF NOT EXISTS idx_prestadores_created ON public.prestadores(created_at DESC);

-- RLS e Políticas para prestadores
ALTER TABLE public.prestadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de prestadores" ON public.prestadores;
CREATE POLICY "Permitir leitura de prestadores" ON public.prestadores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir escrita de prestadores" ON public.prestadores;
CREATE POLICY "Permitir escrita de prestadores" ON public.prestadores FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.prestadores TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.prestadores_id_seq TO postgres, anon, authenticated, service_role;


-- 2. TABELA DE PARCEIROS INSTITUCIONAIS
CREATE TABLE IF NOT EXISTS public.parceiros (
  id                  BIGSERIAL PRIMARY KEY,
  nome                VARCHAR(200) NOT NULL,
  empresa_pf          VARCHAR(200),
  tipo_pessoa         VARCHAR(10) NOT NULL DEFAULT 'PJ' CHECK (tipo_pessoa IN ('PJ', 'PF')),
  documento           VARCHAR(25),
  tipo_parceria       VARCHAR(100) NOT NULL DEFAULT 'Empresa Mantenedora',
  responsavel         VARCHAR(150),
  cargo_responsavel   VARCHAR(150),
  telefone            VARCHAR(30),
  email               VARCHAR(200),
  projeto             VARCHAR(150),
  projeto_id          BIGINT REFERENCES public.projetos(id) ON DELETE SET NULL ON UPDATE CASCADE,
  status              VARCHAR(30) NOT NULL DEFAULT 'Ativo',
  contribuicao        TEXT,
  favorito            BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

COMMENT ON TABLE public.parceiros IS 'Parceiros institucionais, mantenedores e apoiadores da Fundação CDL-BH';

-- Trigger para updated_at em parceiros
DROP TRIGGER IF EXISTS trg_parceiros_updated_at ON public.parceiros;
CREATE TRIGGER trg_parceiros_updated_at
BEFORE UPDATE ON public.parceiros
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Índices para parceiros
CREATE INDEX IF NOT EXISTS idx_parceiros_status ON public.parceiros(status);
CREATE INDEX IF NOT EXISTS idx_parceiros_favorito ON public.parceiros(favorito);
CREATE INDEX IF NOT EXISTS idx_parceiros_tipo ON public.parceiros(tipo_parceria);
CREATE INDEX IF NOT EXISTS idx_parceiros_created ON public.parceiros(created_at DESC);

-- RLS e Políticas para parceiros
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura de parceiros" ON public.parceiros;
CREATE POLICY "Permitir leitura de parceiros" ON public.parceiros FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permitir escrita de parceiros" ON public.parceiros;
CREATE POLICY "Permitir escrita de parceiros" ON public.parceiros FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON TABLE public.parceiros TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.parceiros_id_seq TO postgres, anon, authenticated, service_role;
