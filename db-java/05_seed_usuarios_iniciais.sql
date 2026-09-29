-- ============================================================
-- Seed: Usuários Iniciais e Credenciais de Acesso
-- Fundação CDL-BH
-- ============================================================
-- Senhas em hash BCrypt (força 10) compatíveis com Spring Security:
-- admin@cdlbh.org.br -> admin123
-- user@cdlbh.org.br  -> user123
-- ============================================================
USE cdl_bh_fornecedores_java;

INSERT INTO usuarios (nome, email, senha_hash, role, created_at, updated_at) VALUES 
('Administrador CDL BH', 'admin@cdlbh.org.br', '$2a$10$IPZO.LWKF01uaNdCC9nfgO3tk/NcxY2pwqGO3HDVQPUPwQdv5FeWK', 'ADMIN', NOW(), NOW()),
('Colaborador CDL BH', 'user@cdlbh.org.br', '$2a$10$IPZO.LWKF01uaNdCC9nfgO3tk/NcxY2pwqGO3HDVQPUPwQdv5FeWK', 'USER', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  nome = VALUES(nome),
  senha_hash = VALUES(senha_hash),
  role = VALUES(role),
  updated_at = NOW();

-- Verificação dos usuários cadastrados
SELECT id, email, nome, role, created_at FROM usuarios;
