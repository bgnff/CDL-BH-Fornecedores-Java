import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fornecedoresAPI } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Download, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/exportUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import FornecedorFilters from '@/components/fornecedores/FornecedorFilters';
import FornecedorTable from '@/components/fornecedores/FornecedorTable';

export default function Fornecedores() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [projeto, setProjeto] = useState(searchParams.get('projeto') || 'all');
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
    mutationFn: (id) => fornecedoresAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); toast.success('Fornecedor excluído!'); setDeleteTarget(null); },
    onError: () => toast.error('Erro ao excluir.'),
  });

  const normalizeText = (text) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const filtered = fornecedores.filter((f) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold">Fornecedores</h1><p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}</p></div>
        </div>
        <div className="flex items-center gap-2">
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
