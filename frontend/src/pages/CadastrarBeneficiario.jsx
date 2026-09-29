import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { beneficiariosAPI } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Star } from 'lucide-react';
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
  'Protagonizar en Cena',
  'Sorridente',
  'Ver é Bom Demais',
  'Outro'
];

export default function CadastrarBeneficiario() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    genero: '',
    projeto_social: 'Programa Educação e Trabalho (PET)',
    data_ingresso: new Date().toISOString().split('T')[0],
    status: 'Ativo',
    telefone: '',
    email: '',
    bairro: '',
    endereco: '',
    renda_familiar: 'Até 1 salário mínimo',
    observacoes: '',
    favorito: false
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setForm((prev) => ({ ...prev, [name]: formatCPF(value) }));
    } else if (name === 'telefone') {
      setForm((prev) => ({ ...prev, [name]: formatTelefone(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      toast.error('Informe o nome completo do beneficiário.');
      return;
    }

    if (!form.cpf.trim() || form.cpf.length < 14) {
      toast.error('Informe um CPF válido no formato 000.000.000-00.');
      return;
    }

    setSubmitting(true);
    try {
      await beneficiariosAPI.create(form);
      toast.success('Beneficiário cadastrado com sucesso!');
      navigate('/beneficiarios');
    } catch (err) {
      toast.error(err.message || 'Erro ao realizar cadastro do beneficiário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Voltar e Título */}
      <div className="flex items-center gap-3">
        <Link to="/beneficiarios">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Beneficiário</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre os dados da pessoa atendida pelos projetos sociais da Fundação CDL BH
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Seção 1: Dados Pessoais */}
        <Card>
          <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">1. Identificação Pessoal</CardTitle>
              <CardDescription className="text-xs">
                Informações básicas do participante ou atendido.
              </CardDescription>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-auto">
              <input
                type="checkbox"
                checked={Boolean(form.favorito)}
                onChange={e => setForm(prev => ({ ...prev, favorito: e.target.checked }))}
                className="sr-only"
              />
              <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-medium transition-all ${
                form.favorito
                  ? 'bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'bg-background border-border text-muted-foreground hover:bg-accent'
              }`}>
                <Star className={`w-4 h-4 transition-transform ${form.favorito ? 'fill-amber-400 text-amber-500 scale-110' : 'text-muted-foreground'}`} />
                <span>{form.favorito ? '⭐ Beneficiário Favorito' : 'Marcar como Favorito'}</span>
              </div>
            </label>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Nome Completo *</Label>
              <Input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Lucas Gabriel da Silva Santos"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">CPF *</Label>
              <Input
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
                maxLength={14}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data de Nascimento</Label>
              <Input
                type="date"
                name="data_nascimento"
                value={form.data_nascimento}
                onChange={handleChange}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Gênero</Label>
              <select
                name="genero"
                value={form.genero}
                onChange={handleChange}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Renda Familiar Estimada</Label>
              <select
                name="renda_familiar"
                value={form.renda_familiar}
                onChange={handleChange}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Até 1 salário mínimo">Até 1 salário mínimo</option>
                <option value="De 1 a 2 salários mínimos">De 1 a 2 salários mínimos</option>
                <option value="De 2 a 3 salários mínimos">De 2 a 3 salários mínimos</option>
                <option value="Acima de 3 salários mínimos">Acima de 3 salários mínimos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Programa Social Vinculado */}
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">2. Vínculo ao Projeto Social</CardTitle>
            <CardDescription className="text-xs">
              Vínculo com as iniciativas da Fundação CDL BH.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-medium">Projeto da Fundação *</Label>
              <select
                name="projeto_social"
                value={form.projeto_social}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PROJETOS_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Data de Ingresso</Label>
              <Input
                type="date"
                name="data_ingresso"
                value={form.data_ingresso}
                onChange={handleChange}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Situação / Status *</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Ativo">Ativo</option>
                <option value="Em Acompanhamento">Em Acompanhamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Contato & Endereço */}
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">3. Contato e Localização</CardTitle>
            <CardDescription className="text-xs">
              Telefone, WhatsApp e bairro de residência na Grande BH.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Telefone / WhatsApp</Label>
              <Input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(31) 98765-4321"
                maxLength={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-mail</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="beneficiario@email.com"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Bairro / Comunidade</Label>
              <Input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                placeholder="Ex: Serra, Barreiro, Centro"
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Endereço Completo</Label>
              <Input
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Rua, número, complemento"
                className="text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium">Observações Gerais e Histórico</Label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={3}
                placeholder="Histórico de participação em atividades, observações de assistente social ou encaminhamentos..."
                className="w-full p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/beneficiarios">
            <Button variant="outline" type="button" disabled={submitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Cadastrar Beneficiário
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
