import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('sua-instancia'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload de arquivos para o bucket 'documentos-fornecedores' no Supabase Storage
 */
export async function uploadDocumentoStorage(file) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase não configurado para upload de arquivos.');
  }

  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${timestamp}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from('documentos-fornecedores')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Erro no upload para Supabase Storage:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('documentos-fornecedores')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

/**
 * Métodos de autenticação via Supabase
 */
export const supabaseAuth = {
  async login(email, password) {
    if (!supabase) throw new Error('Supabase não configurado');

    // Tenta autenticação nativa do Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Fallback para admin demo de emergência caso auth.users não esteja populado
      if (email === 'admin@cdlbh.org.br' && password === 'admin123') {
        const demoUser = {
          id: 1,
          email: 'admin@cdlbh.org.br',
          full_name: 'Administrador CDL-BH',
          role: 'admin',
        };
        localStorage.setItem('cdlbh_token', 'demo-token-cdlbh-admin');
        localStorage.setItem('cdlbh_user', JSON.stringify(demoUser));
        return { access_token: 'demo-token-cdlbh-admin', user: demoUser };
      }
      throw error;
    }

    const userObj = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
      role: data.user.user_metadata?.role || 'admin',
    };

    localStorage.setItem('cdlbh_token', data.session.access_token);
    localStorage.setItem('cdlbh_user', JSON.stringify(userObj));
    return { access_token: data.session.access_token, user: userObj };
  },

  async me() {
    const cached = localStorage.getItem('cdlbh_user');
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          role: user.user_metadata?.role || 'admin',
        };
      }
    }
    throw new Error('Não autenticado');
  },

  logout() {
    localStorage.removeItem('cdlbh_token');
    localStorage.removeItem('cdlbh_user');
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    window.location.href = '/login';
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('cdlbh_token'));
  },
};

/**
 * Operações de Fornecedores via Supabase
 */
export const supabaseFornecedores = {
  async list() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*, projetos(nome)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(f => ({
      ...f,
      projeto: f.projetos?.nome || f.projeto || null,
      status: (f.status || 'ativo').toLowerCase(),
    }));
  },

  async get(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*, projetos(nome)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      projeto: data.projetos?.nome || data.projeto || null,
      status: (data.status || 'ativo').toLowerCase(),
    };
  },

  async create(dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    let projetoId = null;

    if (dados.projeto) {
      const { data: proj } = await supabase
        .from('projetos')
        .select('id')
        .eq('nome', dados.projeto)
        .maybeSingle();
      if (proj) projetoId = proj.id;
    }

    const payload = {
      nome: dados.nome,
      empresa_pf: dados.empresa_pf,
      cnpj: dados.cnpj || null,
      email: dados.email || null,
      telefone: dados.telefone || null,
      palavra_chave: dados.palavra_chave || null,
      projeto_id: projetoId,
      observacao: dados.observacao || null,
      permissao_para: dados.permissao_para || [],
      status: (dados.status || 'ativo').toLowerCase(),
    };

    const { data, error } = await supabase
      .from('fornecedores')
      .insert([payload])
      .select('*, projetos(nome)')
      .single();

    if (error) throw error;
    return {
      ...data,
      projeto: data.projetos?.nome || dados.projeto || null,
    };
  },

  async update(id, dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    let projetoId = null;

    if (dados.projeto) {
      const { data: proj } = await supabase
        .from('projetos')
        .select('id')
        .eq('nome', dados.projeto)
        .maybeSingle();
      if (proj) projetoId = proj.id;
    }

    const payload = {
      nome: dados.nome,
      empresa_pf: dados.empresa_pf,
      cnpj: dados.cnpj || null,
      email: dados.email || null,
      telefone: dados.telefone || null,
      palavra_chave: dados.palavra_chave || null,
      projeto_id: projetoId,
      observacao: dados.observacao || null,
      permissao_para: dados.permissao_para || [],
      status: (dados.status || 'ativo').toLowerCase(),
    };

    const { data, error } = await supabase
      .from('fornecedores')
      .update(payload)
      .eq('id', id)
      .select('*, projetos(nome)')
      .single();

    if (error) throw error;
    return {
      ...data,
      projeto: data.projetos?.nome || dados.projeto || null,
    };
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Operações de Documentos via Supabase
 */
export const supabaseDocumentos = {
  async list() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async listByFornecedor(fornecedorId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('fornecedor_id', fornecedorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async get(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const payload = {
      fornecedor_id: dados.fornecedor_id,
      nome: dados.nome,
      tipo: dados.tipo || 'Outro',
      data_vencimento: dados.data_vencimento || null,
      arquivo_url: dados.arquivo_url || null,
      observacao: dados.observacao || null,
    };

    const { data, error } = await supabase
      .from('documentos')
      .insert([payload])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('documentos')
      .update(dados)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async vencendo(dias = 30) {
    if (!supabase) return [];
    const hoje = new Date().toISOString().split('T')[0];
    const limite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .gte('data_vencimento', hoje)
      .lte('data_vencimento', limite)
      .order('data_vencimento', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async vencidos() {
    if (!supabase) return [];
    const hoje = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .lt('data_vencimento', hoje)
      .order('data_vencimento', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

export const supabaseProjetos = {
  async list() {
    if (!supabase) return [];
    const { data: projetos, error } = await supabase
      .from('projetos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;

    // Busca fornecedores para calcular count
    const { data: fornecedores } = await supabase
      .from('fornecedores')
      .select('id, projeto, projeto_id');

    return (projetos || []).map(p => {
      const count = (fornecedores || []).filter(
        f => f.projeto_id === p.id || f.projeto === p.nome
      ).length;
      return {
        ...p,
        fornecedores_count: count,
      };
    });
  },

  async get(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { count } = await supabase
      .from('fornecedores')
      .select('*', { count: 'exact', head: true })
      .or(`projeto_id.eq.${id},projeto.eq."${data.nome}"`);

    return { ...data, fornecedores_count: count || 0 };
  },

  async create(payload) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('projetos')
      .insert([{
        nome: payload.nome.trim(),
        descricao: payload.descricao ? payload.descricao.trim() : null
      }])
      .select('*')
      .single();

    if (error) throw error;
    return { ...data, fornecedores_count: 0 };
  },

  async update(id, payload) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('projetos')
      .update({
        nome: payload.nome.trim(),
        descricao: payload.descricao ? payload.descricao.trim() : null
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

export const supabaseLogs = {
  async list() {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  }
};

