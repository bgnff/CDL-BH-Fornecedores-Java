-- ============================================================
-- Seeds: Dados iniciais para Supabase (Fundação CDL-BH)
-- ============================================================

-- Inserir projetos sociais da Fundação CDL-BH
INSERT INTO public.projetos (nome, descricao) VALUES
('Projeto Afeto', 'Projeto de assistência a famílias em vulnerabilidade'),
('Afeto Empreendedorismo', 'Projeto de apoio ao empreendedorismo'),
('Alimentando Vidas', 'Projeto de combate à fome'),
('Brincadeira é Coisa Séria', 'Projeto de incentivo à brincadeira infantil'),
('Brinquedoteca Itinerante', 'Projeto de brinquedoteca móvel'),
('Despertar Empreendedor', 'Projeto de despertar empreendedor jovem'),
('Liderança Jovem', 'Projeto de formação de lideranças'),
('Natal de Todo Mundo', 'Projeto de campanha natalina'),
('Programa Educação e Trabalho (PET)', 'Projeto de educação para o trabalho'),
('Protagonizar en Cena', 'Projeto de teatro e protagonismo'),
('Sorridente', 'Projeto de saúde bucal'),
('Ver é Bom Demais', 'Projeto de saúde ocular'),
('Outro', 'Outros projetos não listados')
ON CONFLICT (nome) DO UPDATE SET descricao = EXCLUDED.descricao;

-- Inserir fornecedores de exemplo vinculados aos projetos
INSERT INTO public.fornecedores (nome, empresa_pf, cnpj, email, telefone, palavra_chave, projeto_id, observacao, permissao_para, status)
SELECT 
  'Maria Silva', 
  'Distribuidora Silva LTDA', 
  '12.345.678/0001-90', 
  'maria@silva.com', 
  '(31) 99999-1111', 
  'fraldas, higiene', 
  p.id, 
  'Fornecedora parceira desde 2022.', 
  '["Fornecer materiais", "Doação de produtos"]'::jsonb, 
  'ativo'
FROM public.projetos p WHERE p.nome = 'Projeto Afeto'
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO public.fornecedores (nome, empresa_pf, cnpj, email, telefone, palavra_chave, projeto_id, observacao, permissao_para, status)
SELECT 
  'João Costa', 
  'JC Transportes ME', 
  '98.765.432/0001-10', 
  'joao@jctransportes.com', 
  '(31) 98888-2222', 
  'transporte, logística', 
  p.id, 
  'Logística para ações sociais', 
  '["Transporte e logística"]'::jsonb, 
  'ativo'
FROM public.projetos p WHERE p.nome = 'Sorridente'
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO public.fornecedores (nome, empresa_pf, cnpj, email, telefone, palavra_chave, projeto_id, observacao, permissao_para, status)
SELECT 
  'Ana Pereira', 
  'Papelaria Pereira', 
  '11.222.333/0001-44', 
  'ana@papelaria.com', 
  '(31) 97777-3333', 
  'material escolar', 
  p.id, 
  'Desconto de 15% para a fundação.', 
  '["Fornecer materiais", "Doação de produtos"]'::jsonb, 
  'ativo'
FROM public.projetos p WHERE p.nome = 'Programa Educação e Trabalho (PET)'
ON CONFLICT (cnpj) DO NOTHING;

-- Inserir beneficiários de exemplo vinculados aos projetos
INSERT INTO public.beneficiarios (nome, cpf, data_nascimento, telefone, email, projeto_id, bairro, status, observacao)
SELECT 
  'Lucas Gabriel dos Santos', 
  '123.456.789-01', 
  '2007-04-15'::date, 
  '(31) 98765-4321', 
  'lucas.santos@email.com', 
  p.id, 
  'Vila Esperança - BH', 
  'Ativo', 
  'Jovem aprendiz matriculado no curso profissionalizante de logística.'
FROM public.projetos p WHERE p.nome = 'Programa Educação e Trabalho (PET)'
LIMIT 1;

INSERT INTO public.beneficiarios (nome, cpf, data_nascimento, telefone, email, projeto_id, bairro, status, observacao)
SELECT 
  'Camila Fernandes Costa', 
  '987.654.321-99', 
  '2010-09-22'::date, 
  '(31) 99123-4567', 
  'familia.fernandes@email.com', 
  p.id, 
  'Barreiro - BH', 
  'Ativo', 
  'Triagem oftalmológica concluída. Aguardando entrega de óculos corretivos.'
FROM public.projetos p WHERE p.nome = 'Ver é Bom Demais'
LIMIT 1;

INSERT INTO public.beneficiarios (nome, cpf, data_nascimento, telefone, email, projeto_id, bairro, status, observacao)
SELECT 
  'Dona Maria Aparecida de Jesus', 
  '555.666.777-88', 
  '1965-02-10'::date, 
  '(31) 98222-3344', 
  NULL, 
  p.id, 
  'Aglomerado da Serra - BH', 
  'Ativo', 
  'Família com 4 dependentes atendida com cesta básica mensal.'
FROM public.projetos p WHERE p.nome = 'Alimentando Vidas'
LIMIT 1;
