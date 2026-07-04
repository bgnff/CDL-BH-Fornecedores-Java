import React, { useState } from 'react';
import { fornecedoresAPI } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import FornecedorFilters from '@/components/fornecedores/FornecedorFilters';
import FornecedorTable from '@/components/fornecedores/FornecedorTable';

export default function Fornecedores() {
  const [search, setSearch] = useState('');
  const [projeto, setProjeto] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: fornecedores = [], isLoading } = useQuery({ queryKey: ['fornecedores'], queryFn: () => fornecedoresAPI.list() });
  const deleteMutation = useMutation({
    mutationFn: (id) => fornecedoresAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); toast.success('Fornecedor excluído!'); setDeleteTarget(null); },
    onError: () => toast.error('Erro ao excluir.'),
  });

  const filtered = fornecedores.filter(f => {
    const s = search.toLowerCase();
    return (!search || f.nome?.toLowerCase().includes(s) || f.empresa_pf?.toLowerCase().includes(s) || f.palavra_chave?.toLowerCase().includes(s) || f.email?.toLowerCase().includes(s))
      && (projeto === 'all' || f.projeto === projeto);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
        <div><h1 className="text-xl font-bold">Fornecedores</h1><p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}</p></div>
      </div>
      <FornecedorFilters search={search} onSearchChange={setSearch} projeto={projeto} onProjetoChange={setProjeto} />
      <FornecedorTable fornecedores={filtered} isLoading={isLoading} onDelete={f => setDeleteTarget(f)} />
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
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
