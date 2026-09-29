-- ============================================================
-- Migration: Ajuste do ENUM de Roles de Usuários (MYSQL)
-- Fundação CDL-BH
-- ATENÇÃO: Este script é exclusivo para MySQL (MySQL Workbench / CLI).
-- NÃO executar no Supabase (o Supabase usa PostgreSQL e a pasta supabase/).
-- ============================================================
USE cdl_bh_fornecedores_java;

-- Garante que a coluna role aceite 'ADMIN' e 'USER' (compatível com Spring Security e Hibernate)
ALTER TABLE usuarios MODIFY COLUMN role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER';

-- Padroniza os registros legados para maiúsculo
UPDATE usuarios SET role = 'ADMIN' WHERE LOWER(role) = 'admin';
UPDATE usuarios SET role = 'USER' WHERE LOWER(role) = 'user';

-- Verificação do resultado
SELECT id, email, nome, role FROM usuarios;
