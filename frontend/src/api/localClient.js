const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() { return localStorage.getItem('cdlbh_token'); }
function setToken(t) { localStorage.setItem('cdlbh_token', t); }
function removeToken() { localStorage.removeItem('cdlbh_token'); }

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
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
    const data = await request('POST', '/auth/login', { email, password });
    setToken(data.access_token);
    return data;
  },
  async me() { return request('GET', '/auth/me'); },
  logout(redirectUrl = '/login') { removeToken(); window.location.href = redirectUrl; },
  isAuthenticated() { return !!getToken(); },
};

export const fornecedoresAPI = {
  list()           { return request('GET', '/fornecedores'); },
  get(id)          { return request('GET', `/fornecedores/${id}`); },
  create(data)     { return request('POST', '/fornecedores', data); },
  update(id, data) { return request('PUT', `/fornecedores/${id}`, data); },
  delete(id)       { return request('DELETE', `/fornecedores/${id}`); },
};

export const backupAPI = {
  generate()            { return request('POST', '/backup/generate'); },
  list()                { return request('GET', '/backup/list'); },
  // download direto com Authorization header via fetch + blob
  async download(filename) {
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