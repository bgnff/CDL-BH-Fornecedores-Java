import { 
  isSupabaseConfigured, 
  supabaseAuth, 
  supabaseFornecedores, 
  supabaseDocumentos,
  supabaseProjetos,
  supabaseLogs,
  supabaseBeneficiarios,
  supabasePrestadores,
  supabaseParceiros,
  uploadDocumentoStorage 
} from './supabaseClient';

import { 
  mockAuth, 
  mockFornecedores, 
  mockDocumentos, 
  mockProjetos,
  mockLogs,
  mockBackup,
  mockBeneficiarios,
  mockPrestadores,
  mockParceiros,
  resetMockData 
} from './mockClient';

export const isBrowserLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.') ||
  window.location.hostname.endsWith('.local')
);
const BASE_URL = import.meta.env.VITE_API_URL || (isBrowserLocalhost ? 'http://localhost:8080/api' : '/api');

export function isMockMode() {
  if (!isBrowserLocalhost) return false;
  return localStorage.getItem('cdlbh_mock_mode') === 'true' || import.meta.env.VITE_USE_MOCK === 'true';
}

export function activateMockMode() {
  if (!isBrowserLocalhost) return;
  localStorage.setItem('cdlbh_mock_mode', 'true');
}

export function deactivateMockMode() {
  localStorage.removeItem('cdlbh_mock_mode');
}

export { resetMockData };

function getToken() { return localStorage.getItem('cdlbh_token'); }
function setToken(t) { localStorage.setItem('cdlbh_token', t); }
function removeToken() { 
  localStorage.removeItem('cdlbh_token'); 
  localStorage.removeItem('cdlbh_user'); 
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { 
      method, 
      headers, 
      body: body ? JSON.stringify(body) : undefined 
    });
  } catch (netErr) {
    throw new Error('Falha de conexão com o servidor. Verifique se o backend está ativo.');
  }

  if (res.status === 401) { 
    removeToken(); 
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Sessão expirada ou credenciais inválidas.');
  }

  if (res.status === 204) {
    return { success: true };
  }

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    const text = await res.text().catch(() => '');
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Erro na requisição (código ${res.status})`);
  }
  return data;
}

export const auth = {
  async login(email, password) {
    if (isMockMode()) {
      return mockAuth.login(email, password);
    }
    if (isSupabaseConfigured()) {
      return supabaseAuth.login(email, password);
    }
    const data = await request('POST', '/auth/login', { email, password });
    const token = data.access_token || data.token;
    if (token) {
      setToken(token);
      data.access_token = token;
      data.token = token;
    }
    if (data.user) {
      localStorage.setItem('cdlbh_user', JSON.stringify(data.user));
    }
    return data;
  },

  async signUp(email, password, fullName) {
    if (isMockMode()) {
      throw new Error('Cadastro de novos usuários não disponível no modo de teste local.');
    }
    if (isSupabaseConfigured()) {
      return supabaseAuth.signUp(email, password, fullName);
    }
    throw new Error('Cadastro disponível apenas via Supabase.');
  },

  async resendConfirmation(email) {
    if (isMockMode()) {
      throw new Error('Reenvio de confirmação não aplicável ao modo de teste.');
    }
    if (isSupabaseConfigured()) {
      return supabaseAuth.resendConfirmation(email);
    }
    throw new Error('Reenvio disponível apenas via Supabase.');
  },

  async me() {
    if (isMockMode()) {
      return mockAuth.me();
    }
    if (isSupabaseConfigured()) {
      return supabaseAuth.me();
    }
    return request('GET', '/auth/me');
  },

  async logout(redirectUrl = '/login') {
    if (isMockMode()) {
      await mockAuth.logout();
      return;
    }
    if (isSupabaseConfigured()) {
      await supabaseAuth.logout();
      return;
    }
    removeToken();
  },

  isAuthenticated() {
    return !!getToken();
  },
};

export const fornecedoresAPI = {
  list() {
    if (isMockMode()) return mockFornecedores.list();
    if (isSupabaseConfigured()) return supabaseFornecedores.list();
    return request('GET', '/fornecedores');
  },
  get(id) {
    if (isMockMode()) return mockFornecedores.get(id);
    if (isSupabaseConfigured()) return supabaseFornecedores.get(id);
    return request('GET', `/fornecedores/${id}`);
  },
  create(data) {
    if (isMockMode()) return mockFornecedores.create(data);
    if (isSupabaseConfigured()) return supabaseFornecedores.create(data);
    return request('POST', '/fornecedores', data);
  },
  update(id, data) {
    if (isMockMode()) return mockFornecedores.update(id, data);
    if (isSupabaseConfigured()) return supabaseFornecedores.update(id, data);
    return request('PUT', `/fornecedores/${id}`, data);
  },
  delete(id) {
    if (isMockMode()) return mockFornecedores.delete(id);
    if (isSupabaseConfigured()) return supabaseFornecedores.delete(id);
    return request('DELETE', `/fornecedores/${id}`);
  },
};

export const documentosAPI = {
  list() {
    if (isMockMode()) return mockDocumentos.list();
    if (isSupabaseConfigured()) return supabaseDocumentos.list();
    return request('GET', '/documentos');
  },
  listByFornecedor(fornecedorId) {
    if (isMockMode()) return mockDocumentos.listByFornecedor(fornecedorId);
    if (isSupabaseConfigured()) return supabaseDocumentos.listByFornecedor(fornecedorId);
    return request('GET', `/documentos/fornecedor/${fornecedorId}`);
  },
  get(id) {
    if (isMockMode()) return mockDocumentos.get(id);
    if (isSupabaseConfigured()) return supabaseDocumentos.get(id);
    return request('GET', `/documentos/${id}`);
  },
  create(data) {
    if (isMockMode()) return mockDocumentos.create(data);
    if (isSupabaseConfigured()) return supabaseDocumentos.create(data);
    const query = data.fornecedor_id ? `?fornecedorId=${data.fornecedor_id}` : '';
    return request('POST', `/documentos${query}`, data);
  },
  update(id, data) {
    if (isMockMode()) return mockDocumentos.update(id, data);
    if (isSupabaseConfigured()) return supabaseDocumentos.update(id, data);
    return request('PUT', `/documentos/${id}`, data);
  },
  delete(id) {
    if (isMockMode()) return mockDocumentos.delete(id);
    if (isSupabaseConfigured()) return supabaseDocumentos.delete(id);
    return request('DELETE', `/documentos/${id}`);
  },
  vencendo(dias = 30) {
    if (isMockMode()) return mockDocumentos.vencendo(dias);
    if (isSupabaseConfigured()) return supabaseDocumentos.vencendo(dias);
    return request('GET', `/documentos/vencendo?dias=${dias}`);
  },
  vencidos() {
    if (isMockMode()) return mockDocumentos.vencidos();
    if (isSupabaseConfigured()) return supabaseDocumentos.vencidos();
    return request('GET', '/documentos/vencidos');
  },
  async uploadFile(file) {
    if (isMockMode()) {
      return mockDocumentos.uploadFile(file);
    }
    if (isSupabaseConfigured()) {
      return uploadDocumentoStorage(file);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export const backupAPI = {
  generate() {
    if (isMockMode()) return mockBackup.generate();
    return request('POST', '/backup/generate');
  },
  list() {
    if (isMockMode()) return mockBackup.list();
    return request('GET', '/backup/list');
  },
  async download(filename) {
    if (isMockMode()) return mockBackup.download(filename);
    const token = getToken();
    const res = await fetch(`${BASE_URL}/backup/download/${filename}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao baixar backup');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};

export const projetosAPI = {
  list() {
    if (isMockMode()) return mockProjetos.list();
    if (isSupabaseConfigured()) return supabaseProjetos.list();
    return request('GET', '/projetos');
  },
  get(id) {
    if (isMockMode()) return mockProjetos.get(id);
    if (isSupabaseConfigured()) return supabaseProjetos.get(id);
    return request('GET', `/projetos/${id}`);
  },
  create(data) {
    if (isMockMode()) return mockProjetos.create(data);
    if (isSupabaseConfigured()) return supabaseProjetos.create(data);
    return request('POST', '/projetos', data);
  },
  update(id, data) {
    if (isMockMode()) return mockProjetos.update(id, data);
    if (isSupabaseConfigured()) return supabaseProjetos.update(id, data);
    return request('PUT', `/projetos/${id}`, data);
  },
  delete(id) {
    if (isMockMode()) return mockProjetos.delete(id);
    if (isSupabaseConfigured()) return supabaseProjetos.delete(id);
    return request('DELETE', `/projetos/${id}`);
  },
};

export const logsAPI = {
  list() {
    if (isMockMode()) return mockLogs.list();
    if (isSupabaseConfigured()) return supabaseLogs.list();
    return request('GET', '/logs');
  },
};

export const beneficiariosAPI = {
  async list() {
    if (isMockMode()) return mockBeneficiarios.list();
    if (isSupabaseConfigured()) {
      try {
        return await supabaseBeneficiarios.list();
      } catch (err) {
        console.warn('Beneficiários: tabela não encontrada ou erro no Supabase. Usando dados locais como fallback:', err);
        return mockBeneficiarios.list();
      }
    }
    return mockBeneficiarios.list();
  },
  async get(id) {
    if (isMockMode()) return mockBeneficiarios.get(id);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseBeneficiarios.get(id);
      } catch (err) {
        return mockBeneficiarios.get(id);
      }
    }
    return mockBeneficiarios.get(id);
  },
  async create(data) {
    if (isMockMode()) return mockBeneficiarios.create(data);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseBeneficiarios.create(data);
      } catch (err) {
        console.warn('Erro ao salvar beneficiário no Supabase, salvando localmente:', err);
        return mockBeneficiarios.create(data);
      }
    }
    return mockBeneficiarios.create(data);
  },
  async update(id, data) {
    if (isMockMode()) return mockBeneficiarios.update(id, data);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseBeneficiarios.update(id, data);
      } catch (err) {
        console.warn('Erro ao atualizar beneficiário no Supabase, atualizando localmente:', err);
        return mockBeneficiarios.update(id, data);
      }
    }
    return mockBeneficiarios.update(id, data);
  },
  async delete(id) {
    if (isMockMode()) return mockBeneficiarios.delete(id);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseBeneficiarios.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir beneficiário no Supabase, excluindo localmente:', err);
        return mockBeneficiarios.delete(id);
      }
    }
    return mockBeneficiarios.delete(id);
  },
};

export const prestadoresAPI = {
  async list() {
    if (isMockMode()) return mockPrestadores.list();
    if (isSupabaseConfigured()) {
      try {
        return await supabasePrestadores.list();
      } catch (err) {
        console.warn('Prestadores: fallback para mock:', err);
        return mockPrestadores.list();
      }
    }
    return mockPrestadores.list();
  },
  async get(id) {
    if (isMockMode()) return mockPrestadores.get(id);
    if (isSupabaseConfigured()) {
      try {
        return await supabasePrestadores.get(id);
      } catch (err) {
        return mockPrestadores.get(id);
      }
    }
    return mockPrestadores.get(id);
  },
  async create(data) {
    if (isMockMode()) return mockPrestadores.create(data);
    if (isSupabaseConfigured()) {
      try {
        return await supabasePrestadores.create(data);
      } catch (err) {
        console.warn('Erro ao salvar prestador no Supabase, salvando localmente:', err);
        return mockPrestadores.create(data);
      }
    }
    return mockPrestadores.create(data);
  },
  async update(id, data) {
    if (isMockMode()) return mockPrestadores.update(id, data);
    if (isSupabaseConfigured()) {
      try {
        return await supabasePrestadores.update(id, data);
      } catch (err) {
        console.warn('Erro ao atualizar prestador no Supabase, atualizando localmente:', err);
        return mockPrestadores.update(id, data);
      }
    }
    return mockPrestadores.update(id, data);
  },
  async delete(id) {
    if (isMockMode()) return mockPrestadores.delete(id);
    if (isSupabaseConfigured()) {
      try {
        return await supabasePrestadores.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir prestador no Supabase, excluindo localmente:', err);
        return mockPrestadores.delete(id);
      }
    }
    return mockPrestadores.delete(id);
  },
};

export const parceirosAPI = {
  async list() {
    if (isMockMode()) return mockParceiros.list();
    if (isSupabaseConfigured()) {
      try {
        return await supabaseParceiros.list();
      } catch (err) {
        console.warn('Parceiros: fallback para mock:', err);
        return mockParceiros.list();
      }
    }
    return mockParceiros.list();
  },
  async get(id) {
    if (isMockMode()) return mockParceiros.get(id);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseParceiros.get(id);
      } catch (err) {
        return mockParceiros.get(id);
      }
    }
    return mockParceiros.get(id);
  },
  async create(data) {
    if (isMockMode()) return mockParceiros.create(data);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseParceiros.create(data);
      } catch (err) {
        console.warn('Erro ao salvar parceiro no Supabase, salvando localmente:', err);
        return mockParceiros.create(data);
      }
    }
    return mockParceiros.create(data);
  },
  async update(id, data) {
    if (isMockMode()) return mockParceiros.update(id, data);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseParceiros.update(id, data);
      } catch (err) {
        console.warn('Erro ao atualizar parceiro no Supabase, atualizando localmente:', err);
        return mockParceiros.update(id, data);
      }
    }
    return mockParceiros.update(id, data);
  },
  async delete(id) {
    if (isMockMode()) return mockParceiros.delete(id);
    if (isSupabaseConfigured()) {
      try {
        return await supabaseParceiros.delete(id);
      } catch (err) {
        console.warn('Erro ao excluir parceiro no Supabase, excluindo localmente:', err);
        return mockParceiros.delete(id);
      }
    }
    return mockParceiros.delete(id);
  },
};