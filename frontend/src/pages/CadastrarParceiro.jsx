import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parceirosAPI } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Star, Handshake, Building2, User } from 'lucide-react';
import { toast } from 'sonner';

const PROJETOS_LIST = [
  'Projeto Afeto',
  'Afeto Empreendedorismo',
  'Alimentando Vidas',
  'Brincadeira é Coisa Séria',
  'Brinquedoteca Itinerante',
  'Despertar Empreendedor',
  'Liderança Jovem',
  'Natal de Todo Mundo',
  'Programa Educação e Trabalho (PET)',
  'Protagonizar em Cena',
  'Sorridente',
  'Ver é Bom Demais',
  'Outro'
];

const TIPOS_PARCERIA = [
  'Empresa Mantenedora',
  'Patrocinador Social',
  'Instituição Educacional',
  'Apoio Institucional & Gestão',
  'Benfeitor Pessoa Física',
  'Poder Público',
  'Outro'
];

export default function CadastrarParceiro() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState('PJ'); // 'PJ' | 'PF'

  const [form, setForm] = useState({
    nome: '',
    empresa_pf: '',
    documento: '',
    tipo_parceria: 'Empresa Mantenedora',
    responsavel: '',
    cargo_responsavel: '',
    projeto: 'Programa Educação e Trabalho (PET)',
    telefone: '',
    email: '',
    status: 'Ativo',
    contribuicao: '',
    favorito: false
  });

  const formatCNPJ = (val) => {
    return val
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatCPF = (val) => {
    return val
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatTelefone = (val) => {
    return val
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleTipoChange = (tipo) => {
    setTipoPessoa(tipo);
    setForm((prev) => ({
      ...prev,
      documento: '',
      empresa_pf: tipo === 'PF' ? '' : prev.empresa_pf,
      tipo_parceria: tipo === 'PF' ? 'Benfeitor Pessoa Física' : 'Empresa Mantenedora'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'documento') {
      const formatted = tipoPessoa === 'PF' ? formatCPF(value) : formatCNPJ(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === 'telefone') {
      setForm((prev) => ({ ...prev, [name]: formatTelefone(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      toast.error('Informe o nome da instituição ou do parceiro.');
      return;
    }

    if (tipoPessoa === 'PJ' && !form.empresa_pf.trim()) {
      toast.error('Informe a Razão Social da empresa.');
      return;
    }

    const docLimpo = form.documento.replace(/\D/g, '');
    if (tipoPessoa === 'PF' && docLimpo && docLimpo.length !== 11) {
      toast.error('CPF inválido. Deve conter 11 dígitos.');
      return;
    }
    if (tipoPessoa === 'PJ' && docLimpo && docLimpo.length !== 14) {
      toast.error('CNPJ inválido. Deve conter 14 dígitos.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tipo_pessoa: tipoPessoa,
        empresa_pf: tipoPessoa === 'PF' ? (form.nome || 'Pessoa Física') : form.empresa_pf,
        cnpj: tipoPessoa === 'PJ' ? form.documento : null,
        cpf: tipoPessoa === 'PF' ? form.documento : null,
      };

      await parceirosAPI.create(payload);
      toast.success('Parceiro institucional cadastrado com sucesso!');
      navigate('/parceiros');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar parceiro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Topo / Voltar */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/parceiros">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a lista
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cadastrar Parceiro Institucional
            </h1>
            <p className="text-sm text-muted-foreground">
              Cadastre empresas mantenedoras, instituições de apoio, patrocinadores ou benfeitores
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação e Tipo Pessoa */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Identificação do Parceiro
                </CardTitle>
                <CardDescription>
                  Defina o enquadramento (PJ ou PF) e dados de identificação
                </CardDescription>
              </div>

              {/* Toggle de Favorito */}
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, favorito: !prev.favorito }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  form.favorito
                    ? 'bg-amber-500/10 border-amber-400 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'bg-muted/40 border-border text-muted-foreground hover:border-amber-300'
                }`}
              >
                <Star className={`w-4 h-4 ${form.favorito ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} />
                {form.favorito ? '⭐ Parceiro Favorito' : 'Marcar como Favorito'}
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Seletor PJ / PF */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo de Parceiro
              </Label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => handleTipoChange('PJ')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                    tipoPessoa === 'PJ'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-card text-foreground border-border hover:bg-muted/50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Pessoa Jurídica (PJ)
                </button>

                <button
                  type="button"
                  onClick={() => handleTipoChange('PF')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                    tipoPessoa === 'PF'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-card text-foreground border-border hover:bg-muted/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Pessoa Física (PF)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Se PJ: Razão Social */}
              {tipoPessoa === 'PJ' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <Label htmlFor="empresa_pf" className="text-sm font-medium">
                    Razão Social <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="empresa_pf"
                    name="empresa_pf"
                    placeholder="Ex: Banco Inter S.A."
                    value={form.empresa_pf}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Nome Fantasia ou Nome Completo */}
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm font-medium">
                  {tipoPessoa === 'PF' ? 'Nome Completo do Benfeitor' : 'Nome Fantasia / Sigla'}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder={tipoPessoa === 'PF' ? 'Ex: Dra. Heloísa Drummond' : 'Ex: Banco Inter'}
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CNPJ ou CPF */}
              <div className="space-y-1.5">
                <Label htmlFor="documento" className="text-sm font-medium">
                  {tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}
                </Label>
                <Input
                  id="documento"
                  name="documento"
                  placeholder={tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={form.documento}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status da Parceria
                </Label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Prospecção">Em Prospecção</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modalidade da Parceria */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Handshake className="w-5 h-5 text-emerald-600" />
              Modalidade e Projeto Social
            </CardTitle>
            <CardDescription>
              Vínculo com as ações de responsabilidade social da Fundação CDL-BH
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipo_parceria" className="text-sm font-medium">
                  Tipo de Parceria
                </Label>
                <select
                  id="tipo_parceria"
                  name="tipo_parceria"
                  value={form.tipo_parceria}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {TIPOS_PARCERIA.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="projeto" className="text-sm font-medium">
                  Projeto Social Apoiado
                </Label>
                <select
                  id="projeto"
                  name="projeto"
                  value={form.projeto}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PROJETOS_LIST.map((proj) => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Representante e Contato */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Contato do Responsável</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="responsavel" className="text-sm font-medium">Pessoa de Contato / Ponto Focal</Label>
                <Input
                  id="responsavel"
                  name="responsavel"
                  placeholder="Ex: Camila Rocha"
                  value={form.responsavel}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cargo_responsavel" className="text-sm font-medium">Cargo / Área</Label>
                <Input
                  id="cargo_responsavel"
                  name="cargo_responsavel"
                  placeholder="Ex: Gerente de ESG / Relações Institucionais"
                  value={form.cargo_responsavel}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefone" className="text-sm font-medium">Telefone / Celular</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(31) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">E-mail Institucional</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="parcerias@empresa.com.br"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contribuicao" className="text-sm font-medium">Escopo da Parceria e Contrapartidas</Label>
              <textarea
                id="contribuicao"
                name="contribuicao"
                rows={3}
                placeholder="Ex: Aporte financeiro anual de R$ 50.000, cessão de espaço para eventos, mentoria de voluntários..."
                value={form.contribuicao}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" type="button">
            <Link to="/parceiros">Cancelar</Link>
          </Button>

          <Button type="submit" disabled={submitting} className="gap-2 min-w-[160px] bg-emerald-600 hover:bg-emerald-700 text-white">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Parceiro
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
