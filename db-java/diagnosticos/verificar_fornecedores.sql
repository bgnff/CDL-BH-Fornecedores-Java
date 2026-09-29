USE cdl_bh_fornecedores_java;

-- Listagem de fornecedores e seus respectivos status e projetos
SELECT 
  f.id, 
  f.nome, 
  f.empresa_pf, 
  f.cnpj, 
  f.status, 
  p.nome AS projeto, 
  f.created_at
FROM fornecedores f
LEFT JOIN projetos p ON f.projeto_id = p.id
ORDER BY f.id ASC;
