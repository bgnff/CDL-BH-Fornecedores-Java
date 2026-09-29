-- ============================================================
-- Migration: Favoritos e Tipo de Pessoa (PJ/PF) (MYSQL)
-- Fundação CDL-BH
-- ATENÇÃO: Script exclusivo para MySQL.
-- ============================================================
USE cdl_bh_fornecedores_java;

-- 1. Adiciona 'favorito' e 'tipo_pessoa' em fornecedores
ALTER TABLE fornecedores 
  ADD COLUMN favorito TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN tipo_pessoa ENUM('PJ', 'PF') NOT NULL DEFAULT 'PJ';

-- 2. Adiciona 'favorito' na tabela de beneficiarios
ALTER TABLE beneficiarios 
  ADD COLUMN favorito TINYINT(1) NOT NULL DEFAULT 0;

-- 3. Índices para performance
ALTER TABLE fornecedores ADD INDEX idx_fornecedores_favorito (favorito);
ALTER TABLE beneficiarios ADD INDEX idx_beneficiarios_favorito (favorito);
