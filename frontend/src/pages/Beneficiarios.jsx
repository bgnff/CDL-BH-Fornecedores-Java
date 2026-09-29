import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { beneficiariosAPI } from '@/api/localClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AceternityLoader } from '@/components/ui/AceternityLoader';
import {
  HeartHandshake,
  UserPlus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Eye,
  Calendar,
  Building2,
  RefreshCw,
  ExternalLink,
  Activity,
  Star
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
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

export default function Beneficiarios() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [apenasFavoritos, setApenasFavoritos] = useState(false);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchBeneficiarios = async () => {
    setLoading(true);
    try {
      const data = await beneficiariosAPI.list();
      setBeneficiarios(data || []);
    } catch (err) {
      toast.error('Erro ao carregar lista de beneficiários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiarios();
  }, []);

  const handleToggleFavorito = async (b) => {
    const novoFavorito = !b.favorito;
    try {
      await beneficiariosAPI.update(b.id, { ...b, favorito: novoFavorito });
      setBeneficiarios((prev) =>
        prev.map((item) =>
          item.id === b.id ? { ...item, favorito: novoFavorito } : item
        )
      );
      if (novoFavorito) {
        toast.success(`⭐ "${b.nome}" adicionado aos favoritos!`);
      } else {
        toast.info(`"${b.nome}" removido dos favoritos.`);
      }
    } catch (err) {
      toast.error('Erro ao atualizar status de favorito.');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores possuem permissão para excluir beneficiários.');
      return;
    }
    try {
      await beneficiariosAPI.delete(id);
      toast.success('Beneficiário removido com sucesso!');
      setDeleteConfirmId(null);
      fetchBeneficiarios();
    } catch (err) {
      toast.error('Não foi possível remover o beneficiário.');
    }
  };

  // Filtros e ordenação
  const filtered = beneficiarios
    .filter((b) => {
      if (apenasFavoritos && !b.favorito) return false;

      const matchesSearch =
        !search ||
        b.nome?.toLowerCase().includes(search.toLowerCase()) ||
        b.cpf?.includes(search) ||
        b.bairro?.toLowerCase().includes(search.toLowerCase());

      const matchesProjeto =
        filtroProjeto === 'TODOS' || b.projeto_social === filtroProjeto;

      const matchesStatus =
        filtroStatus === 'TODOS' || b.status === filtroStatus;

      return matchesSearch && matchesProjeto && matchesStatus;
    })
    .sort((a, b) => {
      if (Boolean(b.favorito) !== Boolean(a.favorito)) {
        return b.favorito ? 1 : -1;
      }
      return 0;
    });

  // Métricas
  const totalBeneficiarios = beneficiarios.length;
  const ativos = beneficiarios.filter((b) => b.status === 'Ativo').length;
  const emAcompanhamento = beneficiarios.filter((b) => b.status === 'Em Acompanhamento').length;
  const concluidos = beneficiarios.filter((b) => b.status === 'Concluído').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ativo':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            Ativo
          </span>
        );
      case 'Concluído':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            Concluído
          </span>
        );
      case 'Em Acompanhamento':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Em Acompanhamento
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Cabeçalho padrão do sistema */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Beneficiários
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestão e acompanhamento das pessoas atendidas pelos projetos da Fundação CDL BH
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBeneficiarios}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Link to="/beneficiarios/cadastrar">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <UserPlus className="h-4 w-4" />
              Novo Beneficiário
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas (mesmo padrão do Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total de Atendidos</p>
              <h3 className="text-2xl font-bold mt-1">{totalBeneficiarios}</h3>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Beneficiários Ativos</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{ativos}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Em Acompanhamento</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">{emAcompanhamento}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Projetos Concluídos</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{concluidos}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={filtroProjeto}
              onChange={(e) => setFiltroProjeto(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="TODOS">Todos os Projetos</option>
              {PROJETOS_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Em Acompanhamento">Em Acompanhamento</option>
              <option value="Concluído">Concluído</option>
            </select>

            <Button
              type="button"
              variant={apenasFavoritos ? "default" : "outline"}
              size="sm"
              onClick={() => setApenasFavoritos(!apenasFavoritos)}
              className={`h-9 px-3 text-xs gap-1.5 transition-all cursor-pointer ${
                apenasFavoritos
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "text-muted-foreground hover:text-amber-500 hover:border-amber-300"
              }`}
              title={apenasFavoritos ? "Mostrando apenas favoritos" : "Filtrar por favoritos"}
            >
              <Star className={`w-3.5 h-3.5 ${apenasFavoritos ? "fill-white text-white" : "text-amber-400"}`} />
              <span>Favoritos</span>
            </Button>

            {(search || filtroProjeto !== 'TODOS' || filtroStatus !== 'TODOS' || apenasFavoritos) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setFiltroProjeto('TODOS');
                  setFiltroStatus('TODOS');
                  setApenasFavoritos(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Beneficiários */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <AceternityLoader size="md" />
          <p className="text-sm font-medium text-muted-foreground">Carregando beneficiários...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 px-4">
          <CardContent className="space-y-3">
            <HeartHandshake className="w-10 h-10 mx-auto text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">Nenhum beneficiário encontrado</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Não encontramos nenhum registro com os filtros aplicados.
            </p>
            <Link to="/beneficiarios/cadastrar" className="inline-block mt-2">
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Cadastrar Beneficiário
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <Card key={b.id} className="hover:border-primary/50 transition-colors flex flex-col justify-between h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {b.nome ? b.nome.substring(0, 2).toUpperCase() : 'BF'}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold truncate hover:text-primary transition-colors">
                        {b.nome}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">
                        CPF: {b.cpf}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorito(b)}
                      className="p-1 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-950/40 transition-colors group cursor-pointer inline-flex items-center justify-center"
                      title={b.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
                    >
                      <Star
                        className={`w-4 h-4 transition-transform duration-200 group-hover:scale-125 ${
                          b.favorito
                            ? "fill-amber-400 text-amber-500"
                            : "text-muted-foreground/30 hover:text-amber-400"
                        }`}
                      />
                    </button>
                    {getStatusBadge(b.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded-md bg-muted/50 border border-border/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-primary">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{b.projeto_social}</span>
                  </div>
                  {b.data_ingresso && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Ingresso: {new Date(b.data_ingresso).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-muted-foreground">
                  {b.bairro && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{b.bairro}</span>
                    </div>
                  )}
                  {b.telefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-mono">{b.telefone}</span>
                    </div>
                  )}
                  {b.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{b.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="px-6 py-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBeneficiario(b)}
                  className="text-xs h-8 flex-1"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Detalhes
                </Button>

                {b.telefone && (
                  <a
                    href={`https://wa.me/55${b.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium rounded-md border border-input bg-background hover:bg-accent text-emerald-700 transition-colors"
                    title="Contato via WhatsApp"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirmId(b.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Excluir cadastro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedBeneficiario && (
        <Dialog open={!!selectedBeneficiario} onOpenChange={() => setSelectedBeneficiario(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedBeneficiario.nome?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    {selectedBeneficiario.nome}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Registro de Beneficiário Fundação CDL BH
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-md bg-muted/40 border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">CPF</span>
                  <span className="font-mono font-medium">{selectedBeneficiario.cpf}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Situação</span>
                  <div>{getStatusBadge(selectedBeneficiario.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Data de Nascimento</span>
                  <span className="font-medium">
                    {selectedBeneficiario.data_nascimento
                      ? new Date(selectedBeneficiario.data_nascimento).toLocaleDateString('pt-BR')
                      : 'Não informada'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Data de Ingresso</span>
                  <span className="font-medium">
                    {selectedBeneficiario.data_ingresso
                      ? new Date(selectedBeneficiario.data_ingresso).toLocaleDateString('pt-BR')
                      : 'Não informada'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-md border border-border space-y-1">
                <span className="text-[11px] font-semibold text-primary block">Projeto Social Vinculado</span>
                <p className="font-medium text-foreground text-sm">{selectedBeneficiario.projeto_social}</p>
                {selectedBeneficiario.renda_familiar && (
                  <p className="text-muted-foreground">
                    Faixa de Renda: <span className="font-medium text-foreground">{selectedBeneficiario.renda_familiar}</span>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-md border border-border space-y-1 text-muted-foreground">
                <span className="text-[11px] font-semibold text-foreground block">Contato & Endereço</span>
                <p>📍 Bairro: <span className="text-foreground">{selectedBeneficiario.bairro || 'Não informado'}</span></p>
                <p>📞 Telefone: <span className="text-foreground">{selectedBeneficiario.telefone || 'Não informado'}</span></p>
                <p>✉️ E-mail: <span className="text-foreground">{selectedBeneficiario.email || 'Não informado'}</span></p>
              </div>

              {selectedBeneficiario.observacoes && (
                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                  <span className="font-semibold block mb-0.5 text-[11px]">Observações de Atendimento:</span>
                  <p>{selectedBeneficiario.observacoes}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBeneficiario(null)}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmação de Exclusão */}
      {deleteConfirmId && isAdmin && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-destructive">
                Excluir Beneficiário
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tem certeza de que deseja excluir este cadastro? O registro da exclusão será registrado na auditoria do sistema.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-3">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
