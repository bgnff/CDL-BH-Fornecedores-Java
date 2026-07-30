import React, { useState } from 'react';
import { documentosAPI } from '@/api/localClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Upload, Trash2, Download, AlertTriangle, FileCheck2, Loader2, Plus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const TIPOS = ['Contrato', 'Certidão', 'Nota Fiscal', 'Alvará', 'Outro'];

export default function DocumentosSection({ fornecedorId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ nome: '', tipo: 'Contrato', data_vencimento: '', arquivo_url: '', observacao: '' });

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos', fornecedorId],
    queryFn: () => documentosAPI.listByFornecedor(fornecedorId),
    enabled: !!fornecedorId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => documentosAPI.create({ ...data, fornecedor_id: fornecedorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', fornecedorId] });
      queryClient.invalidateQueries({ queryKey: ['documentosVencendo'] });
      toast.success('Documento adicionado!');
      setShowForm(false);
      setForm({ nome: '', tipo: 'Contrato', data_vencimento: '', arquivo_url: '', observacao: '' });
    },
    onError: () => toast.error('Erro ao salvar documento.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => documentosAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', fornecedorId] });
      queryClient.invalidateQueries({ queryKey: ['documentosVencendo'] });
      toast.success('Documento removido.');
      setDeleteTarget(null);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // For now, we'll use a placeholder URL since we don't have a file upload endpoint
      // In production, this would call an upload API
      const fileUrl = URL.createObjectURL(file);
      setForm(p => ({ ...p, arquivo_url: fileUrl }));
      toast.success('Arquivo enviado!');
    } catch { toast.error('Erro ao enviar arquivo.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error('Informe o nome do documento.'); return; }
    if (!form.arquivo_url) { toast.error('Anexe um arquivo.'); return; }
    createMutation.mutate(form);
  };

  const getVencimentoStatus = (dataVenc) => {
    if (!dataVenc) return null;
    const dias = differenceInDays(new Date(dataVenc), new Date());
    if (dias < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    if (dias <= 30) return { label: `Vence em ${dias}d`, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle };
    return { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FileCheck2 };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />Contratos e Documentos
        </CardTitle>
        {isAdmin && !showForm && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && isAdmin && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do documento *</Label>
                <Input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex.: Contrato de fornecimento 2024" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={form.data_vencimento} onChange={e => setForm(p => ({ ...p, data_vencimento: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Arquivo *</Label>
                <div className="flex items-center gap-2">
                  <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} />
                  <Button type="button" variant="outline" size="sm" className="gap-1.5"
                    onClick={() => document.getElementById('doc-upload').click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? 'Enviando...' : 'Anexar'}
                  </Button>
                  {form.arquivo_url && <span className="text-xs text-emerald-600 truncate">✓ Anexado</span>}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea value={form.observacao} rows={2} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} placeholder="Observações sobre o documento..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending} className="gap-1.5">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                Salvar Documento
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : documentos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum documento cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {documentos.map(doc => {
              const status = getVencimentoStatus(doc.data_vencimento);
              return (
                <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{doc.nome}</p>
                      <Badge variant="secondary" className="text-xs">{doc.tipo}</Badge>
                      {status && (
                        <Badge className={`text-xs border ${status.color}`}>
                          <status.icon className="h-3 w-3 mr-0.5" />{status.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {doc.data_vencimento && <span>Venc: {format(new Date(doc.data_vencimento), 'dd/MM/yyyy')}</span>}
                      {doc.observacao && <span className="truncate">· {doc.observacao}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {doc.arquivo_url && (
                      <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      </a>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(doc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir documento</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza que deseja excluir o documento <strong>{deleteTarget?.nome}</strong>?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteMutation.mutate(deleteTarget.id)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
