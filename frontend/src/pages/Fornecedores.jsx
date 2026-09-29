import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fornecedoresAPI } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Download, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { exportToCsv } from '@/lib/exportUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/AuthContext';
import FornecedorFilters from '@/components/fornecedores/FornecedorFilters';
import FornecedorTable from '@/components/fornecedores/FornecedorTable';

export default function Fornecedores() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [projeto, setProjeto] = useState(searchParams.get('projeto') || 'all');
  const [apenasFavoritos, setApenasFavoritos] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlProj = searchParams.get('projeto');
    if (urlProj) {
      setProjeto(urlProj);
    }
  }, [searchParams]);

  const { data: fornecedores = [], isLoading } = useQuery({ queryKey: ['fornecedores'], queryFn: () => fornecedoresAPI.list() });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (!isAdmin) throw new Error('Apenas Administradores possuem permissão para excluir fornecedores.');
      return fornecedoresAPI.delete(id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); toast.success('Fornecedor excluído!'); setDeleteTarget(null); },
    onError: (err) => toast.error(err.message || 'Erro ao excluir.'),
  });

  const toggleFavoritoMutation = useMutation({
    mutationFn: async (f) => {
      const novoFavorito = !f.favorito;
      return fornecedoresAPI.update(f.id, {
        ...f,
        favorito: novoFavorito,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      const foiFavoritado = !variables.favorito;
      if (foiFavoritado) {
        toast.success(`⭐ "${variables.nome}" adicionado aos favoritos!`);
      } else {
        toast.info(`"${variables.nome}" removido dos favoritos.`);
      }
    },
    onError: () => {
      toast.error('Não foi possível alterar o status de favorito.');
    },
  });

  const normalizeText = (text) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const filtered = fornecedores
    .filter((f) => {
      if (apenasFavoritos && !f.favorito) return false;

      const sClean = search.trim();
      const sNorm = normalizeText(sClean);
      const sDigits = sClean.replace(/\D/g, '');

      const fCnpjDigits = (f.cnpj || '').replace(/\D/g, '');
      const fTelDigits = (f.telefone || '').replace(/\D/g, '');

      const matchSearch =
        !sNorm ||
        normalizeText(f.nome).includes(sNorm) ||
        normalizeText(f.empresa_pf).includes(sNorm) ||
        normalizeText(f.palavra_chave).includes(sNorm) ||
        normalizeText(f.email).includes(sNorm) ||
        normalizeText(f.observacao).includes(sNorm) ||
        (f.cnpj && normalizeText(f.cnpj).includes(sNorm)) ||
        (sDigits.length >= 2 && fCnpjDigits.includes(sDigits)) ||
        (sDigits.length >= 4 && fTelDigits.includes(sDigits));

      const matchProjeto = projeto === 'all' || f.projeto === projeto;

      return matchSearch && matchProjeto;
    })
    .sort((a, b) => {
      // Favoritos no topo da lista
      if (Boolean(b.favorito) !== Boolean(a.favorito)) {
        return b.favorito ? 1 : -1;
      }
      return 0;
    });

  const handleExport = () => {
    try {
      const headers = [
        { label: 'Nome do Contato', key: 'nome' },
        { label: 'Empresa / PF', key: 'empresa_pf' },
        { label: 'CNPJ', key: 'cnpj' },
        { label: 'E-mail', key: 'email' },
        { label: 'Telefone', key: 'telefone' },
        { label: 'Palavras-chave', key: 'palavra_chave' },
        { label: 'Projeto', key: (f) => f.projeto || 'Sem projeto' },
        { label: 'Status', key: (f) => (f.status === 'ativo' ? 'Ativo' : 'Inativo') },
        { label: 'Observação', key: 'observacao' },
      ];
      exportToCsv('fornecedores_cdlbh', headers, filtered);
      toast.success(`${filtered.length} fornecedores exportados com sucesso!`);
    } catch (err) {
      toast.error(err.message || 'Erro ao exportar fornecedores.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Fornecedores
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestão de fornecedores e empresas cadastradas
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" /> Exportar Excel / CSV
          </Button>
          <Link to="/cadastrar">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Novo Fornecedor
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas (Padrão Prestadores/Parceiros) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total de Fornecedores</p>
              <h3 className="text-2xl font-bold mt-1">{fornecedores.length}</h3>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Ativos</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {fornecedores.filter(f => f.status?.toLowerCase() === 'ativo').length}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">⭐ Favoritos</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-500">
                {fornecedores.filter(f => f.favorito).length}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Inativos</p>
              <h3 className="text-2xl font-bold mt-1 text-muted-foreground">
                {fornecedores.filter(f => f.status?.toLowerCase() !== 'ativo').length}
              </h3>
            </div>
            <div className="p-2 bg-muted text-muted-foreground rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-4">
          <FornecedorFilters 
            search={search} 
            onSearchChange={setSearch} 
            projeto={projeto} 
            onProjetoChange={setProjeto}
            apenasFavoritos={apenasFavoritos}
            onApenasFavoritosChange={setApenasFavoritos}
          />
        </CardContent>
      </Card>
      <FornecedorTable 
        fornecedores={filtered} 
        isLoading={isLoading} 
        onDelete={f => {
          if (!isAdmin) {
            toast.error('Apenas Administradores possuem permissão para excluir fornecedores.');
            return;
          }
          setDeleteTarget(f);
        }}
        onToggleFavorito={f => toggleFavoritoMutation.mutate(f)}
      />
      <AlertDialog open={Boolean(deleteTarget && isAdmin)} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMutation.mutate(deleteTarget.id)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
