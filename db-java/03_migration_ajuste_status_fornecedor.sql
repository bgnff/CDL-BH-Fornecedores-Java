-- ============================================================
-- Migration: Ajuste do ENUM de Status de Fornecedores
-- Fundação CDL-BH
-- ============================================================
USE cdl_bh_fornecedores_java;

-- Garante que a coluna status aceite 'ATIVO' e 'INATIVO'
ALTER TABLE fornecedores MODIFY COLUMN status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO';

-- Atualiza fornecedores com status em minúsculo ou nulo para o padrão
UPDATE fornecedores SET status = 'ATIVO' WHERE LOWER(status) = 'ativo' OR status IS NULL;
UPDATE fornecedores SET status = 'INATIVO' WHERE LOWER(status) = 'inativo';

-- Verificação do resultado
SELECT id, nome, status FROM fornecedores LIMIT 10;
