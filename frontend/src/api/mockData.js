/**
 * Dados simulados para o Modo de Teste Local
 * Fundação CDL-BH
 */

export const PROJETOS_INICIAIS = [
  { id: 1, nome: 'Projeto Afeto', descricao: 'Acolhimento e suporte socioemocional a famílias vulneráveis de BH.' },
  { id: 2, nome: 'Afeto Empreendedorismo', descricao: 'Capacitação empreendedora e fomento à geração de renda comunitária.' },
  { id: 3, nome: 'Alimentando Vidas', descricao: 'Segurança alimentar, arrecadação e doação de cestas básicas e alimentos.' },
  { id: 4, nome: 'Brincadeira é Coisa Séria', descricao: 'Oficinas socioeducativas e recreativas para infância e juventude.' },
  { id: 5, nome: 'Brinquedoteca Itinerante', descricao: 'Espaço móvel de ludicidade e leitura em escolas e vilas da capital.' },
  { id: 6, nome: 'Despertar Empreendedor', descricao: 'Formação para jovens no mundo dos negócios e comércio local.' },
  { id: 7, nome: 'Liderança Jovem', descricao: 'Desenvolvimento de habilidades de liderança e cidadania para adolescentes.' },
  { id: 8, nome: 'Natal de Todo Mundo', descricao: 'Campanha de fim de ano com arrecadação de brinquedos e alimentos natalinos.' },
  { id: 9, nome: 'Programa Educação e Trabalho (PET)', descricao: 'Inclusão produtiva de jovens aprendizes no mercado de trabalho mineiro.' },
  { id: 10, nome: 'Protagonizar em Cena', descricao: 'Incentivo cultural e oficinas teatrais comunitárias.' },
  { id: 11, nome: 'Sorridente', descricao: 'Assistência à saúde bucal e atendimento odontológico preventivo.' },
  { id: 12, nome: 'Ver é Bom Demais', descricao: 'Triagem oftalmológica e doação de óculos de grau para estudantes.' },
  { id: 13, nome: 'Outro', descricao: 'Demandas e iniciativas especiais da Fundação CDL-BH.' },
];

export const PROJETOS_PADRAO = PROJETOS_INICIAIS.map(p => p.nome);

export const FORNECEDORES_INICIAIS = [
  {
    id: 1,
    nome: 'Maria Silva',
    empresa_pf: 'Distribuidora Silva LTDA',
    cnpj: '12.345.678/0001-90',
    email: 'maria@silva.com',
    telefone: '(31) 99999-1111',
    palavra_chave: 'fraldas, higiene, doações',
    projeto: 'Projeto Afeto',
    observacao: 'Fornecedora parceira desde 2022. Sempre entrega pontualmente.',
    permissao_para: ['Fornecer materiais', 'Doação de produtos'],
    status: 'ativo',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    nome: 'João Costa',
    empresa_pf: 'JC Transportes & Cargas ME',
    cnpj: '98.765.432/0001-10',
    email: 'joao@jctransportes.com',
    telefone: '(31) 98888-2222',
    palavra_chave: 'transporte, logística, van, frete',
    projeto: 'Sorridente',
    observacao: 'Disponibiliza van adaptada para ações sociais da fundação.',
    permissao_para: ['Transporte e logística'],
    status: 'ativo',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    nome: 'Ana Pereira',
    empresa_pf: 'Papelaria & Bazar Pereira',
    cnpj: '11.222.333/0001-44',
    email: 'ana@papelaria.com',
    telefone: '(31) 97777-3333',
    palavra_chave: 'material escolar, cadernos, lápis, mochilas',
    projeto: 'Programa Educação e Trabalho (PET)',
    observacao: 'Concede desconto especial de 15% para a fundação.',
    permissao_para: ['Fornecer materiais', 'Doação de produtos'],
    status: 'ativo',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    nome: 'Carlos Eduardo Santos',
    empresa_pf: 'InfoTech Soluções Digitais',
    cnpj: '22.333.444/0001-55',
    email: 'carlos@infotech.com.br',
    telefone: '(31) 96666-4444',
    palavra_chave: 'computadores, manutenção, informática, redes',
    projeto: 'Afeto Empreendedorismo',
    observacao: 'Responsável pela manutenção dos laboratórios de informática.',
    permissao_para: ['Prestar serviço', 'Consultoria'],
    status: 'ativo',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    nome: 'Roberto Magalhães',
    empresa_pf: 'Supermercado Central de Alimentos',
    cnpj: '33.444.555/0001-66',
    email: 'contato@supercentral.com.br',
    telefone: '(31) 95555-5555',
    palavra_chave: 'cestas básicas, alimentos, perecíveis',
    projeto: 'Alimentando Vidas',
    observacao: 'Contrato temporariamente pausado para renegociação anual.',
    permissao_para: ['Alimentação', 'Doação de produtos'],
    status: 'inativo',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Gera datas dinâmicas para simular documentos vigentes, vencendo e vencidos
const now = new Date();
const dateInDays = (dias) => {
  const d = new Date(now);
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
};

export const DOCUMENTOS_INICIAIS = [
  {
    id: 1,
    fornecedor_id: 1,
    nome: 'Contrato Anual de Fornecimento de Higiene',
    tipo: 'Contrato',
    data_vencimento: dateInDays(14), // Vence em 14 dias (aparece no alerta do dashboard!)
    arquivo_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    observacao: 'Renovação obrigatória para continuar os atendimentos às famílias.',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    fornecedor_id: 1,
    nome: 'Certidão Negativa de Débitos Federais (CND)',
    tipo: 'Certidão',
    data_vencimento: dateInDays(120), // Vigente por 4 meses
    arquivo_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    observacao: 'Emitida pela Receita Federal, tudo regular.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    fornecedor_id: 2,
    nome: 'Alvará Municipal de Transporte de Passageiros',
    tipo: 'Alvará',
    data_vencimento: dateInDays(-5), // Vencido há 5 dias (alerta crítico!)
    arquivo_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    observacao: 'Notificar fornecedor para envio do comprovante de renovação.',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    fornecedor_id: 3,
    nome: 'Nota Fiscal Eletrônica #008412',
    tipo: 'Nota Fiscal',
    data_vencimento: null,
    arquivo_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    observacao: 'Ref. kits escolares distribuídos aos alunos do PET.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
