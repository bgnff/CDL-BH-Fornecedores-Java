USE cdl_bh_fornecedores_java;

DELETE FROM usuarios;

INSERT INTO usuarios (nome, email, senha_hash, role, created_at, updated_at) VALUES 
('Usuário Teste', 'teste@cdlbh.org.br', '$2a$10$IPZO.LWKF01uaNdCC9nfgO3tk/NcxY2pwqGO3HDVQPUPwQdv5FeWK', 'ADMIN', NOW(), NOW()),
('Administrador CDL BH', 'admin@cdlbh.org.br', '$2a$10$IPZO.LWKF01uaNdCC9nfgO3tk/NcxY2pwqGO3HDVQPUPwQdv5FeWK', 'ADMIN', NOW(), NOW());

SELECT id, email, nome, role FROM usuarios;
