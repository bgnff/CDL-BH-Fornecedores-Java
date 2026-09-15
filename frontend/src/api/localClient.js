import { 
  isSupabaseConfigured, 
  supabaseAuth, 
  supabaseFornecedores, 
  supabaseDocumentos,
  supabaseProjetos,
  supabaseLogs,
  uploadDocumentoStorage 
} from './supabaseClient';

import { 
  mockAuth, 
  mockFornecedores, 
  mockDocumentos, 
  mockProjetos,
  mockLogs,
  mockBackup,
  resetMockData 
} from './mockClient';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function isMockMode() {
  return localStorage.getItem('cdlbh_mock_mode') === 'true' || import.meta.env.VITE_USE_MOCK === 'true';
}

export function activateMockMode() {
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
  
  const res = await fetch(`${BASE_URL}${path}`, { 
    method, 
    headers, 
    body: body ? JSON.stringify(body) : undefined 
  });

  if (res.status === 401) { 
    removeToken(); 
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'Não autorizado');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Erro na requisição');
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
    setToken(data.access_token);
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

  logout(redirectUrl = '/login') {
    if (isMockMode()) {
      return mockAuth.logout();
    }
    if (isSupabaseConfigured()) {
      return supabaseAuth.logout();
    }
    removeToken();
    window.location.href = redirectUrl;
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