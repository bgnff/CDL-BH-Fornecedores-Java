import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projetosAPI } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X, Search, CheckCircle2, Building2, User, Star } from 'lucide-react';
import { toast } from 'sonner';

const PROJETOS_FALLBACK = [
  'Projeto Afeto',
  'Afeto Empreendedorismo',
  'Alimentando Vidas',
  'Brincadeira é Coisa Séria',
  'Brinquedoteca Itinerante',
  'Despertar Empreendedor',
  'Liderança Jovem',
  'Natal de Todo Mundo',
  'Programa Educação e Trabalho (PET)',
  'Protagonizar en Cena',
  'Sorridente',
  'Ver é Bom Demais',
  'Outro'
];

const PERMISSOES = [
  'Fornecer materiais',
  'Prestar serviço',
  'Doação de produtos',
  'Consultoria',
  'Transporte e logística',
  'Alimentação',
  'Outro'
];

function validarCNPJ(cnpj) {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (slice) => {
    let soma = 0;
    let pos = slice.length - 7;
    for (let i = slice.length; i >= 1; i--) {
      soma += parseInt(slice.charAt(slice.length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return soma % 11 < 2 ? 0 : 11 - (soma % 11);
  };

  const base = digits.slice(0, 12);
  const d1 = calc(base);
  const d2 = calc(base + d1);
  return digits === base + String(d1) + String(d2);
}

function validarCPF(cpf) {
  const digits = (cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(digits.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let d1 = resto >= 10 ? 0 : resto;
  if (d1 !== parseInt(digits.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(digits.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let d2 = resto >= 10 ? 0 : resto;
  return d2 === parseInt(digits.charAt(10));
}

function formatPhone(value) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatCnpj(value) {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

function formatCpf(value) {
  const d = (value || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export default function FornecedorForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    nome: '',
    empresa_pf: '',
    tipo_pessoa: 'PJ',
    favorito: false,
    cnpj: '',
    email: '',
    telefone: '',
    palavra_chave: '',
    projeto: '__none__',
    observacao: '',
    permissao_para: [],
    status: 'ativo'
  });
  const [errors, setErrors] = useState({});
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState('');

  const { data: projetosData = [] } = useQuery({
    queryKey: ['projetos'],
    queryFn: () => projetosAPI.list(),
  });

  const listaProjetos = projetosData.length > 0
    ? projetosData.map((p) => p.nome)
    : PROJETOS_FALLBACK;

  const handleConsultarCnpj = async () => {
    const rawCnpj = (form.cnpj || '').replace(/\D/g, '');
    if (rawCnpj.length !== 14) {
      toast.error('Digite os 14 números do CNPJ antes de consultar.');
      return;
    }

    setLoadingCnpj(true);
    setCnpjFeedback('');
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('CNPJ não encontrado na base oficial da Receita Federal.');
        }
        throw new Error('Erro ao consultar BrasilAPI. Verifique sua conexão e tente novamente.');
      }
      const data = await res.json();

      const razaoSocial = data.razao_social || '';
      const nomeFantasia = data.nome_fantasia || '';
      const telefone = data.ddd_telefone_1 ? formatPhone(data.ddd_telefone_1) : '';
      const email = data.email ? data.email.toLowerCase() : '';
      const cnae = data.cnae_fiscal_descricao || '';
      const situacao = data.descricao_situacao_cadastral || 'ATIVA';

      setForm((prev) => ({
        ...prev,
        empresa_pf: razaoSocial || nomeFantasia || prev.empresa_pf,
        nome: prev.nome ? prev.nome : (nomeFantasia || razaoSocial),
        telefone: telefone || prev.telefone,
        email: email || prev.email,
        palavra_chave: prev.palavra_chave ? prev.palavra_chave : cnae,
        observacao: prev.observacao
          ? prev.observacao
          : (data.municipio && data.uf
              ? `Endereço: ${data.logradouro || ''}, ${data.numero || 'S/N'} - ${data.bairro || ''}, ${data.municipio}/${data.uf} (CEP: ${data.cep || ''})`
              : prev.observacao),
      }));

      setCnpjFeedback(`Dados preenchidos! Situação: ${situacao}`);
      toast.success(`CNPJ localizado: ${razaoSocial || nomeFantasia} (${situacao})`);
    } catch (err) {
      console.error('Erro na consulta CNPJ:', err);
      toast.error(err.message || 'Falha ao buscar dados do CNPJ.');
    } finally {
      setLoadingCnpj(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      const isInitialPF = initialData.tipo_pessoa === 'PF' || 
        (initialData.cnpj && initialData.cnpj.replace(/\D/g, '').length === 11);
      
      setForm({
        nome: initialData.nome || '',
        empresa_pf: initialData.empresa_pf || '',
        tipo_pessoa: isInitialPF ? 'PF' : 'PJ',
        favorito: Boolean(initialData.favorito),
        cnpj: initialData.cnpj || '',
        email: initialData.email || '',
        telefone: initialData.telefone || '',
        palavra_chave: initialData.palavra_chave || '',
        projeto: initialData.projeto || '__none__',
        observacao: initialData.observacao || '',
        permissao_para: initialData.permissao_para || [],
        status: initialData.status || 'ativo'
      });
    }
  }, [initialData]);

  const validate = () => {
    const e = {};
    const isPF = form.tipo_pessoa === 'PF';

    if (!form.nome.trim()) {
      e.nome = isPF ? 'Nome completo é obrigatório' : 'Nome do contato é obrigatório';
    }

    if (!isPF && !form.empresa_pf.trim()) {
      e.empresa_pf = 'Empresa/Razão Social é obrigatória';
    }

    if (form.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'E-mail inválido';
    }

    if (form.telefone && form.telefone.trim()) {
      const digits = form.telefone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) e.telefone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    if (form.cnpj && form.cnpj.trim()) {
      const digits = form.cnpj.replace(/\D/g, '');
      if (isPF) {
        if (digits.length === 11 && !validarCPF(form.cnpj)) {
          e.cnpj = 'CPF inválido — dígitos verificadores não conferem';
        } else if (digits.length > 0 && digits.length !== 11) {
          e.cnpj = 'CPF deve ter 11 dígitos';
        }
      } else {
        if (digits.length === 14 && !validarCNPJ(form.cnpj)) {
          e.cnpj = 'CNPJ inválido — dígitos verificadores não conferem';
        } else if (digits.length > 0 && digits.length !== 14) {
          e.cnpj = 'CNPJ deve ter 14 dígitos';
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const togglePerm = (perm) => {
    setForm(p => ({
      ...p,
      permissao_para: p.permissao_para.includes(perm)
        ? p.permissao_para.filter(x => x !== perm)
        : [...p.permissao_para, perm]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isPF = form.tipo_pessoa === 'PF';

    const payload = {
      ...form,
      nome: form.nome.trim(),
      empresa_pf: isPF ? (form.nome.trim() || 'Pessoa Física') : form.empresa_pf.trim(),
      tipo_pessoa: form.tipo_pessoa,
      favorito: Boolean(form.favorito),
      cnpj: form.cnpj?.trim() || null,
      email: form.email?.trim() || null,
      telefone: form.telefone?.trim() || null,
      palavra_chave: form.palavra_chave?.trim() || null,
      observacao: form.observacao?.trim() || null,
      projeto: form.projeto === '__none__' || !form.projeto?.trim() ? null : form.projeto.trim(),
    };

    onSubmit(payload);
  };

  const isPF = form.tipo_pessoa === 'PF';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Seleção PJ / PF e Opção de Favorito */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/40 border border-border">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo de Cadastro
              </Label>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                  <input
                    type="radio"
                    name="tipo_pessoa"
                    value="PJ"
                    checked={!isPF}
                    onChange={() => {
                      set('tipo_pessoa', 'PJ');
                      setCnpjFeedback('');
                      set('cnpj', '');
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Pessoa Jurídica (PJ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                  <input
                    type="radio"
                    name="tipo_pessoa"
                    value="PF"
                    checked={isPF}
                    onChange={() => {
                      set('tipo_pessoa', 'PF');
                      setCnpjFeedback('');
                      set('cnpj', '');
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Pessoa Física (PF)</span>
                </label>
              </div>
            </div>

            {/* Opção de Favoritar */}
            <div className="pt-2 sm:pt-0 sm:border-l sm:border-border sm:pl-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(form.favorito)}
                  onChange={e => set('favorito', e.target.checked)}
                  className="sr-only"
                />
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-medium transition-all ${
                  form.favorito 
                    ? 'bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-300 shadow-xs' 
                    : 'bg-background border-border text-muted-foreground hover:bg-accent'
                }`}>
                  <Star className={`w-4 h-4 transition-transform ${form.favorito ? 'fill-amber-400 text-amber-500 scale-110' : 'text-muted-foreground'}`} />
                  <span>{form.favorito ? '⭐ Fornecedor Favorito' : 'Marcar como Favorito'}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Campos de Nome e Empresa (se PJ) */}
          {!isPF ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Contato / Representante <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Nome do contato ou representante"
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
              </div>
              <div className="space-y-2">
                <Label>Empresa / Razão Social <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Nome da empresa ou razão social"
                  value={form.empresa_pf}
                  onChange={e => set('empresa_pf', e.target.value)}
                  className={errors.empresa_pf ? 'border-destructive' : ''}
                />
                {errors.empresa_pf && <p className="text-xs text-destructive">{errors.empresa_pf}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Nome Completo <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Nome completo da pessoa física"
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                className={errors.nome ? 'border-destructive' : ''}
              />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder={isPF ? "email@exemplo.com.br" : "contato@empresa.com.br"}
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp</Label>
              <Input
                placeholder="(31) 99999-9999"
                value={form.telefone}
                onChange={e => set('telefone', formatPhone(e.target.value))}
                className={errors.telefone ? 'border-destructive' : ''}
              />
              {errors.telefone && <p className="text-xs text-destructive">{errors.telefone}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Palavras-Chave (Segmentos / Produtos)</Label>
              <Input
                placeholder="Ex.: fraldas, higiene, papelaria, van"
                value={form.palavra_chave}
                onChange={e => set('palavra_chave', e.target.value)}
              />
            </div>

            {/* Campo CNPJ (para PJ) ou CPF (para PF) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{isPF ? 'CPF' : 'CNPJ'}</Label>
                {!isPF && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 px-2 font-medium"
                    onClick={handleConsultarCnpj}
                    disabled={loadingCnpj || (form.cnpj || '').replace(/\D/g, '').length !== 14}
                    title="Consultar dados da empresa na Receita Federal via BrasilAPI"
                  >
                    {loadingCnpj ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                    {loadingCnpj ? 'Consultando...' : 'Buscar na Receita'}
                  </Button>
                )}
              </div>
              <Input
                placeholder={isPF ? "000.000.000-00" : "00.000.000/0000-00"}
                value={form.cnpj}
                onChange={e => {
                  const formatted = isPF ? formatCpf(e.target.value) : formatCnpj(e.target.value);
                  set('cnpj', formatted);
                  if (cnpjFeedback) setCnpjFeedback('');
                }}
                className={errors.cnpj ? 'border-destructive' : ''}
              />
              {!isPF && cnpjFeedback && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {cnpjFeedback}
                </p>
              )}
              {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj}</p>}
            </div>

            <div className="space-y-2">
              <Label>Projeto Vinculado</Label>
              <Select value={form.projeto || '__none__'} onValueChange={v => set('projeto', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum projeto vinculado</SelectItem>
                  {listaProjetos.map(p => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Permissões e Atuação</Label>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PERMISSOES.map(perm => (
                <label
                  key={perm}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent/60 transition-colors cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={form.permissao_para.includes(perm)}
                    onCheckedChange={() => togglePerm(perm)}
                  />
                  <span>{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações Internas</Label>
            <Textarea
              placeholder="Histórico de parcerias, condições especiais, acordos firmados..."
              value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {initialData ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
