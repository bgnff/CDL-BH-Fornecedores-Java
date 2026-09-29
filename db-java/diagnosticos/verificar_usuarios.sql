USE cdl_bh_fornecedores_java;

-- Listagem completa de usuários do sistema
SELECT id, email, nome, role, created_at, updated_at FROM usuarios ORDER BY id ASC;
