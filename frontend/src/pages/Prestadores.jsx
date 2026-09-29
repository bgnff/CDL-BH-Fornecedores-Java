import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { prestadoresAPI } from '@/api/localClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AceternityLoader } from '@/components/ui/AceternityLoader';
import PrestadorTable from '@/components/prestadores/PrestadorTable';
import {
  Briefcase,
  UserPlus,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Eye,
  Building2,
  RefreshCw,
  ExternalLink,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles
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
  'Protagonizar em Cena',
  'Sorridente',
  'Ver é Bom Demais',
  'Outro'
];

export default function Prestadores() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [prestadores, setPrestadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [apenasFavoritos, setApenasFavoritos] = useState(false);
  const [selectedPrestador, setSelectedPrestador] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchPrestadores = async () => {
    setLoading(true);
    try {
      const data = await prestadoresAPI.list();
      setPrestadores(data || []);
    } catch (err) {
      toast.error('Erro ao carregar lista de prestadores de serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestadores();
  }, []);

  const handleToggleFavorito = async (p) => {
    const novoFavorito = !p.favorito;
    try {
      await prestadoresAPI.update(p.id, { ...p, favorito: novoFavorito });
      setPrestadores((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, favorito: novoFavorito } : item
        )
      );
      if (novoFavorito) {
        toast.success(`⭐ "${p.nome}" adicionado aos favoritos!`);
      } else {
        toast.info(`"${p.nome}" removido dos favoritos.`);
      }
    } catch (err) {
      toast.error('Erro ao atualizar status de favorito.');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores possuem permissão para excluir prestadores.');
      return;
    }
    try {
      await prestadoresAPI.delete(id);
      toast.success('Prestador de serviços removido com sucesso!');
      setDeleteConfirmId(null);
      fetchPrestadores();
    } catch (err) {
      toast.error('Não foi possível remover o prestador.');
    }
  };

  const filtered = prestadores
    .filter((p) => {
      if (apenasFavoritos && !p.favorito) return false;

      const query = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.nome?.toLowerCase().includes(query) ||
        p.empresa_pf?.toLowerCase().includes(query) ||
        p.documento?.includes(search) ||
        p.cnpj?.includes(search) ||
        p.cpf?.includes(search) ||
        p.servico?.toLowerCase().includes(query) ||
        p.especialidade?.toLowerCase().includes(query);

      const matchesProjeto =
        filtroProjeto === 'TODOS' || p.projeto === filtroProjeto;

      const matchesStatus =
        filtroStatus === 'TODOS' || p.status?.toLowerCase() === filtroStatus.toLowerCase();

      return matchesSearch && matchesProjeto && matchesStatus;
    })
    .sort((a, b) => {
      if (Boolean(b.favorito) !== Boolean(a.favorito)) {
        return Boolean(b.favorito) ? 1 : -1;
      }
      return (a.nome || '').localeCompare(b.nome || '');
    });

  const totalAtivos = prestadores.filter((p) => (p.status || 'Ativo').toLowerCase() === 'ativo').length;
  const totalFavoritos = prestadores.filter((p) => Boolean(p.favorito)).length;
  const totalPF = prestadores.filter((p) => p.tipo_pessoa === 'PF').length;
  const totalPJ = prestadores.filter((p) => p.tipo_pessoa !== 'PF').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Prestadores de Serviços
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestão de consultorias, assessorias, instrutores e prestação técnica da Fundação CDL-BH
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrestadores}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Link to="/prestadores/cadastrar">
              <UserPlus className="w-4 h-4" />
              Novo Prestador
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total de Prestadores</p>
              <h3 className="text-2xl font-bold mt-1">{prestadores.length}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Ativos</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{totalAtivos}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">⭐ Favoritos</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-500">{totalFavoritos}</h3>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">PJ / PF</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-600">{totalPJ} <span className="text-sm font-normal text-muted-foreground">/ {totalPF} PF</span></h3>
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, serviço, CNPJ/CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              type="button"
              variant={apenasFavoritos ? 'default' : 'outline'}
              size="sm"
              onClick={() => setApenasFavoritos(!apenasFavoritos)}
              className={`gap-1.5 transition-all ${
                apenasFavoritos 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm ring-1 ring-amber-400' 
                  : 'text-muted-foreground hover:text-amber-600 hover:border-amber-400'
              }`}
            >
              <Star className={`w-4 h-4 ${apenasFavoritos ? 'fill-white' : 'fill-none'}`} />
              Favoritos
            </Button>

            <select
              value={filtroProjeto}
              onChange={(e) => setFiltroProjeto(e.target.value)}
              className="text-sm bg-background border border-input rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos os Projetos</option>
              {PROJETOS_LIST.map((proj) => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="text-sm bg-background border border-input rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Em Negociação">Em Negociação</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Prestadores */}
      {loading ? (
        <div className="py-20">
          <AceternityLoader />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl p-8">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground">Nenhum prestador encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-5">
            {apenasFavoritos 
              ? 'Nenhum prestador foi marcado como favorito ainda.' 
              : 'Nenhum prestador corresponde aos filtros aplicados.'}
          </p>
          <Button asChild size="sm">
            <Link to="/prestadores/cadastrar">Cadastrar Novo Prestador</Link>
          </Button>
        </div>
      ) : (
        <PrestadorTable 
          prestadores={filtered}
          isLoading={loading}
          onViewDetails={(p) => setSelectedPrestador(p)}
          onDeleteClick={(p) => setDeleteConfirmId(p.id)}
          onToggleFavorito={(p) => handleToggleFavorito(p)}
        />
      )}

      {/* Modal de Detalhes do Prestador */}
      <Dialog open={Boolean(selectedPrestador)} onOpenChange={() => setSelectedPrestador(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedPrestador && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{selectedPrestador.tipo_pessoa || 'PJ'}</Badge>
                  <Badge variant="secondary">{selectedPrestador.status || 'Ativo'}</Badge>
                  {selectedPrestador.favorito && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-300">⭐ Favorito</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold">{selectedPrestador.nome}</DialogTitle>
                {selectedPrestador.empresa_pf && selectedPrestador.tipo_pessoa !== 'PF' && (
                  <DialogDescription>{selectedPrestador.empresa_pf}</DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-4 py-3 text-sm">
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Documento</p>
                    <p className="font-mono text-sm mt-0.5">{selectedPrestador.documento || selectedPrestador.cnpj || selectedPrestador.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Projeto Social</p>
                    <p className="font-medium text-sm mt-0.5">{selectedPrestador.projeto || 'Não vinculado'}</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Serviço Prestado</p>
                    <p className="font-semibold text-primary mt-0.5">{selectedPrestador.servico || 'Não informado'}</p>
                  </div>
                  {selectedPrestador.especialidade && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Especialidade</p>
                      <p className="text-sm mt-0.5">{selectedPrestador.especialidade}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Telefone</p>
                    <p className="text-sm mt-0.5">{selectedPrestador.telefone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">E-mail</p>
                    <p className="text-sm mt-0.5 break-all">{selectedPrestador.email || '-'}</p>
                  </div>
                </div>

                {selectedPrestador.cidade && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Cidade / Região</p>
                    <p className="text-sm mt-0.5">{selectedPrestador.cidade}</p>
                  </div>
                )}

                {selectedPrestador.observacoes && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Observações / Escopo</p>
                    <p className="text-sm mt-1 p-2.5 bg-muted/30 rounded border border-border/50 text-muted-foreground">
                      {selectedPrestador.observacoes}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFavorito(selectedPrestador)}
                  className="gap-1.5"
                >
                  <Star className={`w-4 h-4 ${selectedPrestador.favorito ? 'fill-amber-400 text-amber-500' : ''}`} />
                  {selectedPrestador.favorito ? 'Desfavoritar' : 'Marcar Favorito'}
                </Button>
                <Button onClick={() => setSelectedPrestador(null)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <Dialog open={Boolean(deleteConfirmId && isAdmin)} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este prestador de serviços? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteConfirmId)}
            >
              Excluir Prestador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
