import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fornecedoresAPI } from '@/api/localClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import FornecedorForm from '@/components/fornecedores/FornecedorForm';

export default function CadastrarFornecedor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data) => fornecedoresAPI.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success('Fornecedor cadastrado! Agora você pode anexar documentos.');
      navigate(`/fornecedores/${created.id}`);
    },
    onError: () => toast.error('Erro ao cadastrar.'),
  });
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <FornecedorForm onSubmit={data => mutation.mutate(data)} onCancel={() => navigate('/fornecedores')} isSubmitting={mutation.isPending} />
    </div>
  );
}
