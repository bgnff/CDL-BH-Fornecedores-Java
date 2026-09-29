import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fornecedoresAPI } from '@/api/localClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pencil, User, Building2, Mail, Phone, Tag, FolderOpen, FileText, Shield, Hash } from 'lucide-react';
import { format } from 'date-fns';
import DocumentosSection from '@/components/fornecedores/DocumentosSection';

export default function FornecedorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const { data: fornecedor, isLoading } = useQuery({ queryKey: ['fornecedor', id], queryFn: () => fornecedoresAPI.get(id), enabled: !!id });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!fornecedor) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center"><p className="text-muted-foreground">Fornecedor não encontrado.</p><Link to="/fornecedores"><Button variant="outline" className="mt-4">Voltar</Button></Link></div>;

  const fields = [
    { icon: User, label: 'Nome', value: fornecedor.nome },
    { icon: Building2, label: 'Empresa / PF', value: fornecedor.empresa_pf },
    { icon: Hash, label: 'CNPJ', value: fornecedor.cnpj },
    { icon: Mail, label: 'E-mail', value: fornecedor.email },
    { icon: Phone, label: 'Telefone', value: fornecedor.telefone },
    { icon: Tag, label: 'Palavra Chave', value: fornecedor.palavra_chave },
    { icon: FolderOpen, label: 'Projeto', value: fornecedor.projeto },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate('/fornecedores')}><ArrowLeft className="h-4 w-4" />Voltar</Button>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="h-6 w-6" /></div>
            <div><CardTitle className="text-xl">{fornecedor.nome}</CardTitle><p className="text-sm text-muted-foreground">{fornecedor.empresa_pf}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${fornecedor.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge>
            {isAdmin && <Link to={`/fornecedores/${fornecedor.id}/editar`}><Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" />Editar</Button></Link>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <f.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0"><p className="text-xs text-muted-foreground">{f.label}</p><p className="text-sm font-medium truncate">{f.value || '—'}</p></div>
              </div>
            ))}
          </div>
          {fornecedor.permissao_para?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">Permissão Para</p></div>
              <div className="flex flex-wrap gap-2">{fornecedor.permissao_para.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}</div>
            </div>
          )}
          {fornecedor.observacao && (
            <div className="space-y-2">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">Observação</p></div>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">{fornecedor.observacao}</p>
            </div>
          )}
          {fornecedor.created_at && <p className="text-xs text-muted-foreground pt-2 border-t border-border">Cadastrado em {format(new Date(fornecedor.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>}
        </CardContent>
      </Card>

      {/* Seção de Documentos e Contratos */}
      <DocumentosSection fornecedorId={fornecedor.id} />
    </div>
  );
}
