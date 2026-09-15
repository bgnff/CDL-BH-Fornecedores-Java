import { FORNECEDORES_INICIAIS, DOCUMENTOS_INICIAIS, PROJETOS_INICIAIS } from './mockData';

const KEY_FORNECEDORES = 'cdlbh_mock_fornecedores';
const KEY_DOCUMENTOS = 'cdlbh_mock_documentos';
const KEY_BACKUPS = 'cdlbh_mock_backups';
const KEY_PROJETOS = 'cdlbh_mock_projetos';
const KEY_LOGS = 'cdlbh_mock_logs';

const LOGS_INICIAIS = [
  {
    id: 101,
    usuario_nome: 'Administrador (Modo Teste)',
    acao: 'CREATE',
    tabela: 'fornecedores',
    registro_id: 1,
    detalhes: { nome: 'João da Silva', empresa_pf: 'Silva Logística Ltda', projeto: 'Alimentando Vidas' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 102,
    usuario_nome: 'Administrador (Modo Teste)',
    acao: 'CREATE',
    tabela: 'projetos',
    registro_id: 1,
    detalhes: { nome: 'Inovação Social CDL' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 103,
    usuario_nome: 'Administrador (Modo Teste)',
    acao: 'UPDATE',
    tabela: 'fornecedores',
    registro_id: 2,
    detalhes: { nome: 'Papelaria Central', alteracoes: { status: { de: 'inativo', para: 'ativo' } } },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 104,
    usuario_nome: 'Administrador (Modo Teste)',
    acao: 'CREATE',
    tabela: 'documentos',
    registro_id: 1,
    detalhes: { nome: 'Contrato de Prestação de Serviços 2026', tipo: 'Contrato' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

function getStorage(key, initialValue) {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function resetMockData() {
  localStorage.setItem(KEY_PROJETOS, JSON.stringify(PROJETOS_INICIAIS));
  localStorage.setItem(KEY_FORNECEDORES, JSON.stringify(FORNECEDORES_INICIAIS));
  localStorage.setItem(KEY_DOCUMENTOS, JSON.stringify(DOCUMENTOS_INICIAIS));
  localStorage.setItem(KEY_LOGS, JSON.stringify(LOGS_INICIAIS));
  localStorage.setItem(KEY_BACKUPS, JSON.stringify([
    { filename: 'backup_local_demo_2026.sql', size: '2.4 MB', date: new Date().toISOString() }
  ]));
}

export const mockAuth = {
  async login(email, password) {
    const user = {
      id: 1,
      email: email || 'admin@cdlbh.org.br',
      full_name: email === 'user@cdlbh.org.br' ? 'Colaborador CDL-BH (User)' : 'Administrador (Modo Teste)',
      role: email === 'user@cdlbh.org.br' ? 'user' : 'admin',
    };
    localStorage.setItem('cdlbh_token', 'mock-jwt-token-cdlbh');
    localStorage.setItem('cdlbh_user', JSON.stringify(user));
    localStorage.setItem('cdlbh_mock_mode', 'true');
    return { access_token: 'mock-jwt-token-cdlbh', user };
  },

  async me() {
    const cached = localStorage.getItem('cdlbh_user');
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    return {
      id: 1,
      email: 'admin@cdlbh.org.br',
      full_name: 'Administrador (Modo Teste)',
      role: 'admin',
    };
  },

  logout() {
    localStorage.removeItem('cdlbh_token');
    localStorage.removeItem('cdlbh_user');
    localStorage.removeItem('cdlbh_mock_mode');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('cdlbh_token'));
  },
};

export const mockFornecedores = {
  async list() {
    const list = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async get(id) {
    const list = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    const found = list.find(f => String(f.id) === String(id));
    if (!found) throw new Error('Fornecedor não encontrado.');
    return found;
  },

  async create(dados) {
    const list = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    const novo = {
      ...dados,
      id: Date.now(),
      status: (dados.status || 'ativo').toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(novo);
    setStorage(KEY_FORNECEDORES, list);
    return novo;
  },

  async update(id, dados) {
    const list = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    const index = list.findIndex(f => String(f.id) === String(id));
    if (index === -1) throw new Error('Fornecedor não encontrado.');

    const atualizado = {
      ...list[index],
      ...dados,
      status: (dados.status || list[index].status || 'ativo').toLowerCase(),
      updated_at: new Date().toISOString(),
    };
    list[index] = atualizado;
    setStorage(KEY_FORNECEDORES, list);
    return atualizado;
  },

  async delete(id) {
    let list = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    list = list.filter(f => String(f.id) !== String(id));
    setStorage(KEY_FORNECEDORES, list);

    // Remove também os documentos vinculados
    let docs = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    docs = docs.filter(d => String(d.fornecedor_id) !== String(id));
    setStorage(KEY_DOCUMENTOS, docs);

    return { success: true };
  },
};

export const mockDocumentos = {
  async list() {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async listByFornecedor(fornecedorId) {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    return list
      .filter(d => String(d.fornecedor_id) === String(fornecedorId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async get(id) {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    const found = list.find(d => String(d.id) === String(id));
    if (!found) throw new Error('Documento não encontrado.');
    return found;
  },

  async create(dados) {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    const novo = {
      ...dados,
      id: Date.now(),
      tipo: dados.tipo || 'Outro',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(novo);
    setStorage(KEY_DOCUMENTOS, list);
    return novo;
  },

  async update(id, dados) {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    const index = list.findIndex(d => String(d.id) === String(id));
    if (index === -1) throw new Error('Documento não encontrado.');

    const atualizado = {
      ...list[index],
      ...dados,
      updated_at: new Date().toISOString(),
    };
    list[index] = atualizado;
    setStorage(KEY_DOCUMENTOS, list);
    return atualizado;
  },

  async delete(id) {
    let list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    list = list.filter(d => String(d.id) !== String(id));
    setStorage(KEY_DOCUMENTOS, list);
    return { success: true };
  },

  async vencendo(dias = 30) {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    const hoje = new Date();
    return list.filter(d => {
      if (!d.data_vencimento) return false;
      const diff = (new Date(d.data_vencimento) - hoje) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= dias;
    }).sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));
  },

  async vencidos() {
    const list = getStorage(KEY_DOCUMENTOS, DOCUMENTOS_INICIAIS);
    const hoje = new Date();
    return list.filter(d => {
      if (!d.data_vencimento) return false;
      return new Date(d.data_vencimento) < hoje;
    }).sort((a, b) => new Date(b.data_vencimento) - new Date(a.data_vencimento));
  },

  async uploadFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      reader.readAsDataURL(file);
    });
  }
};

export const mockBackup = {
  async generate() {
    const backups = getStorage(KEY_BACKUPS, [
      { filename: 'backup_local_demo_2026.sql', size: '2.4 MB', date: new Date().toISOString() }
    ]);
    const novo = {
      filename: `backup_local_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`,
      size: '2.5 MB',
      date: new Date().toISOString(),
    };
    backups.unshift(novo);
    setStorage(KEY_BACKUPS, backups);
    return { success: true, filename: novo.filename };
  },

  async list() {
    return getStorage(KEY_BACKUPS, [
      { filename: 'backup_local_demo_2026.sql', size: '2.4 MB', date: new Date().toISOString() }
    ]);
  },

  async download(filename) {
    const content = `-- Backup Simulado Fundação CDL-BH\n-- Gerado em: ${new Date().toISOString()}\n-- Arquivo: ${filename}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const mockProjetos = {
  async list() {
    const projetos = getStorage(KEY_PROJETOS, PROJETOS_INICIAIS);
    const fornecedores = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    return projetos.map(p => {
      const count = fornecedores.filter(f => f.projeto === p.nome).length;
      return {
        ...p,
        fornecedores_count: count,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      };
    }).sort((a, b) => a.nome.localeCompare(b.nome));
  },

  async get(id) {
    const projetos = getStorage(KEY_PROJETOS, PROJETOS_INICIAIS);
    const proj = projetos.find(p => p.id === Number(id));
    if (!proj) throw new Error('Projeto não encontrado.');
    const fornecedores = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    const count = fornecedores.filter(f => f.projeto === proj.nome).length;
    return { ...proj, fornecedores_count: count };
  },

  async create(data) {
    const projetos = getStorage(KEY_PROJETOS, PROJETOS_INICIAIS);
    const nomeLimpo = (data.nome || '').trim();
    if (!nomeLimpo) throw new Error('Nome do projeto é obrigatório.');
    if (projetos.some(p => p.nome.toLowerCase() === nomeLimpo.toLowerCase())) {
      throw new Error('Já existe um projeto cadastrado com este nome.');
    }
    const maxId = projetos.reduce((max, p) => Math.max(max, p.id || 0), 0);
    const novo = {
      id: maxId + 1,
      nome: nomeLimpo,
      descricao: (data.descricao || '').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    projetos.push(novo);
    setStorage(KEY_PROJETOS, projetos);
    return { ...novo, fornecedores_count: 0 };
  },

  async update(id, data) {
    const projetos = getStorage(KEY_PROJETOS, PROJETOS_INICIAIS);
    const index = projetos.findIndex(p => p.id === Number(id));
    if (index === -1) throw new Error('Projeto não encontrado.');
    const nomeLimpo = (data.nome || '').trim();
    if (!nomeLimpo) throw new Error('Nome do projeto é obrigatório.');
    if (projetos.some(p => p.id !== Number(id) && p.nome.toLowerCase() === nomeLimpo.toLowerCase())) {
      throw new Error('Já existe outro projeto cadastrado com este nome.');
    }
    const oldName = projetos[index].nome;
    const atualizado = {
      ...projetos[index],
      nome: nomeLimpo,
      descricao: data.descricao !== undefined ? (data.descricao || '').trim() : projetos[index].descricao,
      updated_at: new Date().toISOString(),
    };
    projetos[index] = atualizado;
    setStorage(KEY_PROJETOS, projetos);

    // Atualiza nome nos fornecedores vinculados se mudou
    if (oldName !== nomeLimpo) {
      const fornecedores = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
      const alterados = fornecedores.map(f => f.projeto === oldName ? { ...f, projeto: nomeLimpo } : f);
      setStorage(KEY_FORNECEDORES, alterados);
    }

    const fornecedores = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    const count = fornecedores.filter(f => f.projeto === nomeLimpo).length;
    return { ...atualizado, fornecedores_count: count };
  },

  async delete(id) {
    const projetos = getStorage(KEY_PROJETOS, PROJETOS_INICIAIS);
    const proj = projetos.find(p => p.id === Number(id));
    if (!proj) throw new Error('Projeto não encontrado.');
    const filtrados = projetos.filter(p => p.id !== Number(id));
    setStorage(KEY_PROJETOS, filtrados);

    // Desvincula fornecedores
    const fornecedores = getStorage(KEY_FORNECEDORES, FORNECEDORES_INICIAIS);
    const alterados = fornecedores.map(f => f.projeto === proj.nome ? { ...f, projeto: null } : f);
    setStorage(KEY_FORNECEDORES, alterados);
    return { success: true };
  }
};

export const mockLogs = {
  async list() {
    await delay(100);
    return getStorage(KEY_LOGS, LOGS_INICIAIS);
  },
  async registrar(acao, tabela, registroId, detalhes) {
    const logs = getStorage(KEY_LOGS, LOGS_INICIAIS);
    const user = JSON.parse(localStorage.getItem('cdlbh_user') || '{}');
    const newLog = {
      id: Date.now(),
      usuario_nome: user.full_name || 'Administrador (Modo Teste)',
      acao,
      tabela,
      registro_id: Number(registroId),
      detalhes: detalhes || {},
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStorage(KEY_LOGS, logs);
    return newLog;
  }
};

