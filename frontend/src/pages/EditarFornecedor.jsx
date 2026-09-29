import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fornecedoresAPI } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FornecedorForm from '@/components/fornecedores/FornecedorForm';

export default function EditarFornecedor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: fornecedor, isLoading } = useQuery({ queryKey: ['fornecedor', id], queryFn: () => fornecedoresAPI.get(id), enabled: !!id });
  const mutation = useMutation({
    mutationFn: (data) => fornecedoresAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); queryClient.invalidateQueries({ queryKey: ['fornecedor', id] }); toast.success('Fornecedor atualizado!'); navigate(`/fornecedores/${id}`); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  if (!isAdmin) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center"><p className="text-muted-foreground">Sem permissão de administrador para editar este fornecedor.</p><Button variant="outline" className="mt-4" onClick={() => navigate('/fornecedores')}>Voltar</Button></div>;
  if (isLoading) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" />Voltar</Button>
      <FornecedorForm initialData={fornecedor} onSubmit={data => mutation.mutate(data)} onCancel={() => navigate(-1)} isSubmitting={mutation.isPending} />
    </div>
  );
}
