import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projetosAPI } from '@/api/localClient';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import {
  FolderKanban,
  PlusCircle,
  Search,
  Users,
  Building2,
  TrendingUp,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FolderOpen,
  Download
} from 'lucide-react';
import { exportToCsv } from '@/lib/exportUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProjetoDialog from '@/components/projetos/ProjetoDialog';

export default function Projetos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Queries
  const { data: projetos = [], isLoading } = useQuery({
    queryKey: ['projetos'],
    queryFn: () => projetosAPI.list(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => {
      if (!isAdmin) throw new Error('Apenas Administradores podem criar projetos.');
      return projetosAPI.create(data);
    },
    onSuccess: (novo) => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      toast.success(`Projeto "${novo.nome}" criado com sucesso!`);
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao criar projeto.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      if (!isAdmin) throw new Error('Apenas Administradores podem alterar projetos.');
      return projetosAPI.update(id, data);
    },
    onSuccess: (atualizado) => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success(`Projeto "${atualizado.nome}" atualizado!`);
      setDialogOpen(false);
      setSelectedProjeto(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao atualizar projeto.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (!isAdmin) throw new Error('Apenas Administradores podem excluir projetos.');
      return projetosAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success('Projeto excluído com sucesso!');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Erro ao excluir projeto.');
    },
  });

  const handleSave = (payload) => {
    if (!isAdmin) {
      toast.error('Apenas Administradores podem alterar projetos.');
      return;
    }
    if (selectedProjeto?.id) {
      updateMutation.mutate({ id: selectedProjeto.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOpenCreate = () => {
    if (!isAdmin) return;
    setSelectedProjeto(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (proj) => {
    if (!isAdmin) return;
    setSelectedProjeto(proj);
    setDialogOpen(true);
  };

  // Filtragem
  const filteredProjetos = projetos.filter((p) => {
    const q = search.toLowerCase();
    return (
      !search ||
      p.nome?.toLowerCase().includes(q) ||
      p.descricao?.toLowerCase().includes(q)
    );
  });

  // Métricas
  const totalProjetos = projetos.length;
  const comFornecedores = projetos.filter((p) => (p.fornecedores_count || 0) > 0).length;
  const totalFornecedoresVinculados = projetos.reduce(
    (acc, p) => acc + (p.fornecedores_count || 0),
    0
  );

  const handleExport = () => {
    try {
      const headers = [
        { label: 'Nome do Projeto', key: 'nome' },
        { label: 'Descrição', key: (p) => p.descricao || 'Sem descrição' },
        { label: 'Fornecedores Vinculados', key: (p) => p.fornecedores_count || 0 },
        { label: 'Data de Cadastro', key: (p) => p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-' }
      ];
      exportToCsv('projetos_cdlbh', headers, filteredProjetos);
      toast.success(`${filteredProjetos.length} projetos exportados com sucesso!`);
    } catch (err) {
      toast.error(err.message || 'Erro ao exportar projetos.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Projetos Sociais
              </h1>
              <p className="text-sm text-muted-foreground">
                Programas e iniciativas sociais mantidos pela Fundação CDL-BH
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={filteredProjetos.length === 0}>
            <Download className="h-4 w-4" /> Exportar Excel / CSV
          </Button>
          {isAdmin && (
            <Button onClick={handleOpenCreate} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Projeto
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total de Projetos</p>
              {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse mt-1 rounded" /> : <h3 className="text-2xl font-bold mt-1">{totalProjetos}</h3>}
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Com Fornecedores</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse mt-1 rounded" />
              ) : (
                <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                  {comFornecedores} <span className="text-sm font-normal text-muted-foreground">({totalProjetos ? Math.round((comFornecedores / totalProjetos) * 100) : 0}%)</span>
                </h3>
              )}
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Fornecedores Vinculados</p>
              {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse mt-1 rounded" /> : <h3 className="text-2xl font-bold mt-1 text-violet-600">{totalFornecedoresVinculados}</h3>}
            </div>
            <div className="p-2 bg-violet-500/10 text-violet-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Busca e Visualização */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="bg-muted p-1 rounded-lg flex items-center gap-1 border border-border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode('table')}
            >
              <List className="h-3.5 w-3.5" />
              Tabela
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Conteúdo: Cards ou Tabela */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProjetos.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card border-dashed space-y-3">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/60" />
          <h3 className="text-base font-semibold">Nenhum projeto encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search
              ? `Não foram encontrados projetos que correspondam ao termo "${search}".`
              : 'Comece criando a primeira iniciativa social da Fundação.'}
          </p>
          {search ? (
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              Limpar busca
            </Button>
          ) : isAdmin ? (
            <Button size="sm" onClick={handleOpenCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Projeto
            </Button>
          ) : null}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjetos.map((proj) => {
            const count = proj.fornecedores_count || 0;
            return (
              <Card
                key={proj.id}
                className="flex flex-col justify-between hover:shadow-md transition-all duration-200 border-border/80 hover:border-primary/40 group h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {proj.nome}
                      </CardTitle>
                      <Badge
                        variant={count > 0 ? 'secondary' : 'outline'}
                        className={`text-[11px] font-normal gap-1 ${
                          count > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Users className="h-3 w-3" />
                        {count === 1 ? '1 fornecedor' : `${count} fornecedores`}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Editar projeto"
                          onClick={() => handleOpenEdit(proj)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Excluir projeto"
                          onClick={() => setDeleteTarget(proj)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {proj.descricao || 'Sem descrição cadastrada para esta iniciativa social.'}
                  </p>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10 justify-between group/btn"
                    onClick={() =>
                      navigate(`/fornecedores?projeto=${encodeURIComponent(proj.nome)}`)
                    }
                  >
                    <span>Ver Fornecedores ({count})</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">Projeto</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[160px] text-center">Fornecedores</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjetos.map((proj) => {
                const count = proj.fornecedores_count || 0;
                return (
                  <TableRow key={proj.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                        <span>{proj.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-md truncate">
                      {proj.descricao || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={count > 0 ? 'secondary' : 'outline'}
                        className={`text-xs ${
                          count > 0 ? 'bg-emerald-50 text-emerald-700' : 'text-muted-foreground'
                        }`}
                      >
                        {count} parceiro{count === 1 ? '' : 's'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary"
                          onClick={() =>
                            navigate(`/fornecedores?projeto=${encodeURIComponent(proj.nome)}`)
                          }
                        >
                          Ver
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleOpenEdit(proj)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(proj)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <ProjetoDialog
        open={dialogOpen && isAdmin}
        onOpenChange={setDialogOpen}
        initialData={selectedProjeto}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={Boolean(deleteTarget && isAdmin)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Confirmar Exclusão de Projeto</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2 text-sm text-muted-foreground">
              <p>
                Tem certeza que deseja excluir o projeto{' '}
                <strong className="text-foreground">"{deleteTarget?.nome}"</strong>?
              </p>
              {deleteTarget?.fornecedores_count > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                  ⚠️ <strong>Atenção:</strong> Existem{' '}
                  {deleteTarget.fornecedores_count} fornecedor(es) vinculados a este projeto. Eles não serão
                  apagados, mas ficarão desvinculados.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleteTarget?.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
