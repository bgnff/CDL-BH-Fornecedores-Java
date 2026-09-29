-- ============================================================
-- Seed: Carga Inicial de Beneficiários de Exemplo
-- Projetos Sociais da Fundação CDL-BH
-- ============================================================
USE cdl_bh_fornecedores_java;

-- Garante que existam beneficiários de demonstração vinculados aos projetos
INSERT INTO beneficiarios (nome, cpf, data_nascimento, telefone, email, projeto_id, bairro, status, observacao) VALUES
(
  'Lucas Gabriel dos Santos', 
  '123.456.789-01', 
  '2007-04-15', 
  '(31) 98765-4321', 
  'lucas.santos@email.com', 
  (SELECT id FROM projetos WHERE nome = 'Programa Educação e Trabalho (PET)' LIMIT 1), 
  'Vila Esperança - BH', 
  'Ativo', 
  'Jovem aprendiz matriculado no curso profissionalizante de logística.'
),
(
  'Camila Fernandes Costa', 
  '987.654.321-99', 
  '2010-09-22', 
  '(31) 99123-4567', 
  'familia.fernandes@email.com', 
  (SELECT id FROM projetos WHERE nome = 'Ver é Bom Demais' LIMIT 1), 
  'Barreiro - BH', 
  'Ativo', 
  'Triagem oftalmológica concluída. Aguardando entrega de óculos corretivos.'
),
(
  'Dona Maria Aparecida de Jesus', 
  '555.666.777-88', 
  '1965-02-10', 
  '(31) 98222-3344', 
  NULL, 
  (SELECT id FROM projetos WHERE nome = 'Alimentando Vidas' LIMIT 1), 
  'Aglomerado da Serra - BH', 
  'Ativo', 
  'Família com 4 dependentes atendida com cesta básica mensal.'
)
ON DUPLICATE KEY UPDATE id = id;

-- Verificação dos beneficiários cadastrados
SELECT id, nome, status, bairro, created_at FROM beneficiarios;
