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
