import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parceirosAPI } from '@/api/localClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AceternityLoader } from '@/components/ui/AceternityLoader';
import {
  Handshake,
  UserPlus,
  Search,
  Star,
  Phone,
  Mail,
  Building2,
  Trash2,
  Eye,
  RefreshCw,
  ExternalLink,
  Award,
  CheckCircle2,
  HeartHandshake,
  UserCheck
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

const TIPOS_PARCERIA = [
  'Empresa Mantenedora',
  'Patrocinador Social',
  'Instituição Educacional',
  'Apoio Institucional & Gestão',
  'Benfeitor Pessoa Física',
  'Poder Público',
  'Outro'
];

export default function Parceiros() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [apenasFavoritos, setApenasFavoritos] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchParceiros = async () => {
    setLoading(true);
    try {
      const data = await parceirosAPI.list();
      setParceiros(data || []);
    } catch (err) {
      toast.error('Erro ao carregar parceiros institucionais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParceiros();
  }, []);

  const handleToggleFavorito = async (p) => {
    const novoFavorito = !p.favorito;
    try {
      await parceirosAPI.update(p.id, { ...p, favorito: novoFavorito });
      setParceiros((prev) =>
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
      toast.error('Apenas Administradores possuem permissão para excluir parceiros.');
      return;
    }
    try {
      await parceirosAPI.delete(id);
      toast.success('Parceiro removido com sucesso!');
      setDeleteConfirmId(null);
      fetchParceiros();
    } catch (err) {
      toast.error('Não foi possível remover o parceiro.');
    }
  };

  const filtered = parceiros
    .filter((p) => {
      if (apenasFavoritos && !p.favorito) return false;

      const query = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.nome?.toLowerCase().includes(query) ||
        p.empresa_pf?.toLowerCase().includes(query) ||
        p.responsavel?.toLowerCase().includes(query) ||
        p.documento?.includes(search) ||
        p.cnpj?.includes(search) ||
        p.cpf?.includes(search) ||
        p.tipo_parceria?.toLowerCase().includes(query);

      const matchesProjeto =
        filtroProjeto === 'TODOS' || p.projeto === filtroProjeto;

      const matchesTipo =
        filtroTipo === 'TODOS' || p.tipo_parceria === filtroTipo;

      return matchesSearch && matchesProjeto && matchesTipo;
    })
    .sort((a, b) => {
      if (Boolean(b.favorito) !== Boolean(a.favorito)) {
        return Boolean(b.favorito) ? 1 : -1;
      }
      return (a.nome || '').localeCompare(b.nome || '');
    });

  const totalAtivos = parceiros.filter((p) => (p.status || 'Ativo').toLowerCase() === 'ativo').length;
  const totalFavoritos = parceiros.filter((p) => Boolean(p.favorito)).length;
  const totalMantenedores = parceiros.filter((p) => p.tipo_parceria === 'Empresa Mantenedora').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Parceiros Institucionais
              </h1>
              <p className="text-sm text-muted-foreground">
                Empresas mantenedoras, doadores, instituições de ensino e patrocinadores sociais da Fundação CDL-BH
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParceiros}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <Link to="/parceiros/cadastrar">
              <UserPlus className="w-4 h-4" />
              Novo Parceiro
            </Link>
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total de Parceiros</p>
              <h3 className="text-2xl font-bold mt-1">{parceiros.length}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Handshake className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Parcerias Ativas</p>
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
              <p className="text-xs text-muted-foreground uppercase font-semibold">Mantenedoras</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">{totalMantenedores}</h3>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
              <Award className="w-5 h-5" />
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
              placeholder="Buscar parceiro, contato, CNPJ..."
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
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-sm bg-background border border-input rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="TODOS">Todos os Tipos de Parceria</option>
              {TIPOS_PARCERIA.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>

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
          </div>
        </CardContent>
      </Card>

      {/* Grid de Parceiros */}
      {loading ? (
        <div className="py-20">
          <AceternityLoader />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl p-8">
          <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-semibold text-foreground">Nenhum parceiro encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-5">
            {apenasFavoritos 
              ? 'Nenhum parceiro foi favoritado até o momento.' 
              : 'Nenhum parceiro atende aos filtros de pesquisa.'}
          </p>
          <Button asChild size="sm">
            <Link to="/parceiros/cadastrar">Cadastrar Novo Parceiro</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const isFav = Boolean(p.favorito);
            const isPF = p.tipo_pessoa === 'PF';
            const doc = p.documento || p.cnpj || p.cpf;

            return (
              <Card
                key={p.id}
                className={`relative flex flex-col justify-between border transition-all duration-200 hover:shadow-md h-full ${
                  isFav ? 'border-amber-400/60 bg-amber-50/20 dark:bg-amber-950/10' : 'border-border/70 hover:border-border'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={isPF ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono text-[10px]' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-mono text-[10px]'}
                        >
                          {isPF ? 'PF' : 'PJ'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px]"
                        >
                          {p.tipo_parceria || 'Parceiro'}
                        </Badge>
                      </div>

                      <CardTitle className="text-base font-bold leading-tight line-clamp-1 mt-1">
                        {p.nome}
                      </CardTitle>
                      
                      {!isPF && p.empresa_pf && p.empresa_pf !== p.nome && (
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                          {p.empresa_pf}
                        </p>
                      )}
                    </div>

                    {/* Botão Favoritar */}
                    <button
                      type="button"
                      onClick={() => handleToggleFavorito(p)}
                      title={isFav ? 'Remover dos favoritos' : 'Marcar como favorito'}
                      className={`p-1.5 rounded-full transition-transform active:scale-90 ${
                        isFav 
                          ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/50' 
                          : 'text-muted-foreground/50 hover:text-amber-500 hover:bg-muted'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm pb-4">
                  {/* Responsável e Contato */}
                  <div className="p-2.5 bg-muted/40 rounded-lg space-y-1">
                    <p className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {p.responsavel || 'Contato Institucional'}
                    </p>
                    {p.cargo_responsavel && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {p.cargo_responsavel}
                      </p>
                    )}
                  </div>

                  {/* Informações detalhadas */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {doc && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground/80">{isPF ? 'CPF:' : 'CNPJ:'}</span>
                        <span className="font-mono">{doc}</span>
                      </div>
                    )}

                    {p.projeto && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{p.projeto}</span>
                      </div>
                    )}

                    {p.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <a
                          href={`https://wa.me/55${p.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-emerald-600 transition-colors"
                        >
                          {p.telefone}
                        </a>
                      </div>
                    )}

                    {p.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <a href={`mailto:${p.email}`} className="truncate hover:underline hover:text-primary">
                          {p.email}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Rodapé com Ações */}
                <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedParceiro(p)}
                    className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Detalhes
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="text-xs gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes do Parceiro */}
      <Dialog open={Boolean(selectedParceiro)} onOpenChange={() => setSelectedParceiro(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedParceiro && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{selectedParceiro.tipo_pessoa || 'PJ'}</Badge>
                  <Badge variant="secondary">{selectedParceiro.tipo_parceria}</Badge>
                  {selectedParceiro.favorito && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-300">⭐ Favorito</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold">{selectedParceiro.nome}</DialogTitle>
                {selectedParceiro.empresa_pf && selectedParceiro.tipo_pessoa !== 'PF' && (
                  <DialogDescription>{selectedParceiro.empresa_pf}</DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-4 py-3 text-sm">
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Documento</p>
                    <p className="font-mono text-sm mt-0.5">{selectedParceiro.documento || selectedParceiro.cnpj || selectedParceiro.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Projeto Social Apoiado</p>
                    <p className="font-medium text-sm mt-0.5">{selectedParceiro.projeto || 'Não vinculado'}</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Responsável na Instituição</p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">{selectedParceiro.responsavel || 'Não informado'}</p>
                  </div>
                  {selectedParceiro.cargo_responsavel && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">Cargo / Função</p>
                      <p className="text-sm mt-0.5">{selectedParceiro.cargo_responsavel}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Telefone</p>
                    <p className="text-sm mt-0.5">{selectedParceiro.telefone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">E-mail</p>
                    <p className="text-sm mt-0.5 break-all">{selectedParceiro.email || '-'}</p>
                  </div>
                </div>

                {selectedParceiro.contribuicao && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Escopo e Contribuição da Parceria</p>
                    <p className="text-sm mt-1 p-2.5 bg-muted/30 rounded border border-border/50 text-muted-foreground">
                      {selectedParceiro.contribuicao}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFavorito(selectedParceiro)}
                  className="gap-1.5"
                >
                  <Star className={`w-4 h-4 ${selectedParceiro.favorito ? 'fill-amber-400 text-amber-500' : ''}`} />
                  {selectedParceiro.favorito ? 'Desfavoritar' : 'Marcar Favorito'}
                </Button>
                <Button onClick={() => setSelectedParceiro(null)}>Fechar</Button>
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
              Tem certeza que deseja remover este parceiro institucional? Esta ação não pode ser desfeita.
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
              Excluir Parceiro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
