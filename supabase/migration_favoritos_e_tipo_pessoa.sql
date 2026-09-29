-- ============================================================
-- Migration Supabase (PostgreSQL): Favoritos e Tipo Pessoa (PJ/PF)
-- Fundação CDL-BH
-- ============================================================

-- 1. Adicionar colunas 'favorito' e 'tipo_pessoa' na tabela fornecedores
ALTER TABLE public.fornecedores 
  ADD COLUMN IF NOT EXISTS favorito BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_pessoa VARCHAR(10) NOT NULL DEFAULT 'PJ' CHECK (tipo_pessoa IN ('PJ', 'PF'));

-- 2. Adicionar coluna 'favorito' na tabela beneficiarios
ALTER TABLE public.beneficiarios 
  ADD COLUMN IF NOT EXISTS favorito BOOLEAN NOT NULL DEFAULT false;

-- 3. Índices para performance em filtros de favoritos
CREATE INDEX IF NOT EXISTS idx_fornecedores_favorito ON public.fornecedores(favorito);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_favorito ON public.beneficiarios(favorito);
