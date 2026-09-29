import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { prestadoresAPI } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Star, Briefcase, Building2, User } from 'lucide-react';
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

export default function CadastrarPrestador() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState('PJ'); // 'PJ' | 'PF'

  const [form, setForm] = useState({
    nome: '',
    empresa_pf: '',
    documento: '',
    servico: '',
    especialidade: '',
    projeto: 'Programa Educação e Trabalho (PET)',
    telefone: '',
    email: '',
    cidade: 'Belo Horizonte',
    status: 'Ativo',
    observacoes: '',
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
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleTipoChange = (tipo) => {
    setTipoPessoa(tipo);
    setForm((prev) => ({
      ...prev,
      documento: '',
      empresa_pf: tipo === 'PF' ? '' : prev.empresa_pf
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
      toast.error(tipoPessoa === 'PF' ? 'Informe o nome completo do prestador.' : 'Informe o nome do contato responsável.');
      return;
    }

    if (tipoPessoa === 'PJ' && !form.empresa_pf.trim()) {
      toast.error('Informe a Razão Social da empresa.');
      return;
    }

    if (!form.servico.trim()) {
      toast.error('Informe o serviço ou área técnica de atuação.');
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

      await prestadoresAPI.create(payload);
      toast.success('Prestador de serviços cadastrado com sucesso!');
      navigate('/prestadores');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar prestador de serviços.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Topo / Voltar */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/prestadores">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a lista
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cadastrar Prestador de Serviços
            </h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do prestador técnico, assessoria ou consultoria parceira
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
                  <User className="w-5 h-5 text-primary" />
                  Identificação e Natureza
                </CardTitle>
                <CardDescription>
                  Defina se o prestador atuará como Pessoa Jurídica (PJ) ou Pessoa Física (PF)
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
                {form.favorito ? '⭐ Prestador Favorito' : 'Marcar como Favorito'}
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Seletor PJ / PF */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo de Prestador
              </Label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => handleTipoChange('PJ')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                    tipoPessoa === 'PJ'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
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
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
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
                    Razão Social / Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="empresa_pf"
                    name="empresa_pf"
                    placeholder="Ex: Rezende & Associados Consultoria LTDA"
                    value={form.empresa_pf}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Nome ou Contato */}
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm font-medium">
                  {tipoPessoa === 'PF' ? 'Nome Completo' : 'Contato Responsável'}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder={tipoPessoa === 'PF' ? 'Ex: Rodrigo Soares Almeida' : 'Ex: Dra. Luciana Rezende'}
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
                  Status Operacional
                </Label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Em Negociação">Em Negociação</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serviços e Projeto Vinculado */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Atuação Técnica e Projeto
            </CardTitle>
            <CardDescription>
              Especifique a área de atuação e o projeto social apoiado
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="servico" className="text-sm font-medium">
                  Serviço Prestado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="servico"
                  name="servico"
                  placeholder="Ex: Assessoria Jurídica, Instrutor de Robótica, Manutenção Predial"
                  value={form.servico}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="especialidade" className="text-sm font-medium">
                  Especialidade / Detalhamento
                </Label>
                <Input
                  id="especialidade"
                  name="especialidade"
                  placeholder="Ex: Terceiro Setor, Climatização, Odontopediatria"
                  value={form.especialidade}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="projeto" className="text-sm font-medium">
                  Projeto Social Vinculado
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

        {/* Contato e Observações */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Contato e Localização</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="telefone" className="text-sm font-medium">Telefone / WhatsApp</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(31) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@prestador.com.br"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cidade" className="text-sm font-medium">Cidade / Polo</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  placeholder="Belo Horizonte / Contagem"
                  value={form.cidade}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observacoes" className="text-sm font-medium">Observações e Escopo Contratual</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                placeholder="Detalhes adicionais sobre o contrato, vigência ou periodicidade da prestação..."
                value={form.observacoes}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" type="button">
            <Link to="/prestadores">Cancelar</Link>
          </Button>

          <Button type="submit" disabled={submitting} className="gap-2 min-w-[160px]">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Prestador
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
