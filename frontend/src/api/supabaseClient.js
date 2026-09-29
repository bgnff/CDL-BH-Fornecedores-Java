import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('seu-projeto') && !supabaseUrl.includes('sua-instancia'));
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

  async signUp(email, password, fullName) {
    if (!supabase) throw new Error('Supabase não configurado');

    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'user',
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;
    return data;
  },

  async resendConfirmation(email) {
    if (!supabase) throw new Error('Supabase não configurado');

    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        localStorage.removeItem('cdlbh_token');
        localStorage.removeItem('cdlbh_user');
        if (callback) callback('SIGNED_OUT', null, null);
      } else if (session?.user) {
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
          role: session.user.user_metadata?.role || 'admin',
        };
        localStorage.setItem('cdlbh_token', session.access_token);
        localStorage.setItem('cdlbh_user', JSON.stringify(userObj));
        if (callback) callback(event, userObj, session);
      }
    });
    return () => subscription.unsubscribe();
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

  async logout() {
    localStorage.removeItem('cdlbh_token');
    localStorage.removeItem('cdlbh_user');
    localStorage.removeItem('cdlbh_mock_mode');

    // Remove qualquer token de sessão salvo pelo Supabase no localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Erro ao limpar tokens Supabase:', e);
    }

    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.warn('Erro ao deslogar do Supabase:', e);
      }
    }
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
      favorito: dados.favorito !== undefined ? Boolean(dados.favorito) : false,
      tipo_pessoa: dados.tipo_pessoa || 'PJ',
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
      favorito: dados.favorito !== undefined ? Boolean(dados.favorito) : undefined,
      tipo_pessoa: dados.tipo_pessoa || undefined,
    };
    if (payload.favorito === undefined) delete payload.favorito;
    if (payload.tipo_pessoa === undefined) delete payload.tipo_pessoa;

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

export const supabaseBeneficiarios = {
  async list() {
    if (!supabase) return [];
    let data, error;
    try {
      const res = await supabase
        .from('beneficiarios')
        .select('*, projetos(nome)')
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
    } catch (e) {
      error = e;
    }

    // Se falhar (por exemplo relação projetos não encontrada no cache), tenta select simples
    if (error) {
      const resSimple = await supabase
        .from('beneficiarios')
        .select('*')
        .order('created_at', { ascending: false });
      if (!resSimple.error) {
        data = resSimple.data;
        error = null;
      }
    }

    if (error) throw error;
    return (data || []).map(b => ({
      ...b,
      projeto_social: b.projetos?.nome || b.projeto_social || b.projeto || 'Sem projeto',
      favorito: Boolean(b.favorito),
    }));
  },

  async get(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('beneficiarios')
      .select('*, projetos(nome)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      projeto_social: data.projetos?.nome || data.projeto_social || data.projeto || 'Sem projeto',
      favorito: Boolean(data.favorito),
    };
  },

  async create(dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('beneficiarios')
      .insert([{
        nome: dados.nome,
        cpf: dados.cpf || null,
        data_nascimento: dados.data_nascimento || null,
        telefone: dados.telefone || null,
        email: dados.email || null,
        bairro: dados.bairro || null,
        status: dados.status || 'Ativo',
        observacao: dados.observacao || dados.observacoes || null,
        favorito: Boolean(dados.favorito),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const updatePayload = { ...dados };
    delete updatePayload.id;
    delete updatePayload.projetos;

    const { data, error } = await supabase
      .from('beneficiarios')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { error } = await supabase
      .from('beneficiarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

export const supabasePrestadores = {
  async list() {
    if (!supabase) return [];
    let data, error;
    try {
      const res = await supabase
        .from('prestadores')
        .select('*, projetos(nome)')
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
    } catch (e) {
      error = e;
    }

    if (error) {
      const resSimple = await supabase
        .from('prestadores')
        .select('*')
        .order('created_at', { ascending: false });
      if (!resSimple.error) {
        data = resSimple.data;
        error = null;
      }
    }

    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      projeto: p.projetos?.nome || p.projeto || 'Sem projeto',
      favorito: Boolean(p.favorito),
    }));
  },

  async get(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('prestadores')
      .select('*, projetos(nome)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      projeto: data.projetos?.nome || data.projeto || 'Sem projeto',
      favorito: Boolean(data.favorito),
    };
  },

  async create(dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('prestadores')
      .insert([{
        nome: dados.nome,
        empresa_pf: dados.empresa_pf || dados.nome,
        tipo_pessoa: dados.tipo_pessoa || 'PJ',
        documento: dados.documento || dados.cnpj || dados.cpf || null,
        servico: dados.servico || null,
        especialidade: dados.especialidade || null,
        telefone: dados.telefone || null,
        email: dados.email || null,
        projeto: dados.projeto || null,
        cidade: dados.cidade || null,
        status: dados.status || 'Ativo',
        observacoes: dados.observacoes || null,
        favorito: Boolean(dados.favorito),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const updatePayload = { ...dados };
    delete updatePayload.id;
    delete updatePayload.projetos;

    const { data, error } = await supabase
      .from('prestadores')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { error } = await supabase
      .from('prestadores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

export const supabaseParceiros = {
  async list() {
    if (!supabase) return [];
    let data, error;
    try {
      const res = await supabase
        .from('parceiros')
        .select('*, projetos(nome)')
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
    } catch (e) {
      error = e;
    }

    if (error) {
      const resSimple = await supabase
        .from('parceiros')
        .select('*')
        .order('created_at', { ascending: false });
      if (!resSimple.error) {
        data = resSimple.data;
        error = null;
      }
    }

    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      projeto: p.projetos?.nome || p.projeto || 'Sem projeto',
      favorito: Boolean(p.favorito),
    }));
  },

  async get(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('parceiros')
      .select('*, projetos(nome)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      projeto: data.projetos?.nome || data.projeto || 'Sem projeto',
      favorito: Boolean(data.favorito),
    };
  },

  async create(dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { data, error } = await supabase
      .from('parceiros')
      .insert([{
        nome: dados.nome,
        empresa_pf: dados.empresa_pf || dados.nome,
        tipo_pessoa: dados.tipo_pessoa || 'PJ',
        documento: dados.documento || dados.cnpj || dados.cpf || null,
        tipo_parceria: dados.tipo_parceria || 'Empresa Mantenedora',
        responsavel: dados.responsavel || null,
        cargo_responsavel: dados.cargo_responsavel || null,
        telefone: dados.telefone || null,
        email: dados.email || null,
        projeto: dados.projeto || null,
        status: dados.status || 'Ativo',
        contribuicao: dados.contribuicao || null,
        favorito: Boolean(dados.favorito),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, dados) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const updatePayload = { ...dados };
    delete updatePayload.id;
    delete updatePayload.projetos;

    const { data, error } = await supabase
      .from('parceiros')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase não inicializado');
    const { error } = await supabase
      .from('parceiros')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};



