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
import {
  FileText,
  Upload,
  Trash2,
  Download,
  AlertTriangle,
  FileCheck2,
  Loader2,
  Plus,
  Files,
  CloudUpload,
  CheckCircle2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TIPOS = ['Contrato', 'Certidão', 'Nota Fiscal', 'Alvará', 'Outro'];

function inferDocType(fileName) {
  const lower = (fileName || '').toLowerCase();
  if (lower.includes('contrato') || lower.includes('convenio') || lower.includes('termo')) return 'Contrato';
  if (lower.includes('certidao') || lower.includes('cnd') || lower.includes('crf') || lower.includes('fgts')) return 'Certidão';
  if (lower.includes('nota') || lower.includes('nf') || lower.includes('fatura')) return 'Nota Fiscal';
  if (lower.includes('alvara') || lower.includes('licenca')) return 'Alvará';
  return 'Outro';
}

function cleanFileName(fileName) {
  return (fileName || '').replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}

export default function DocumentosSection({ fornecedorId }) {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Formulário individual
  const [form, setForm] = useState({
    nome: '',
    tipo: 'Contrato',
    data_vencimento: '',
    arquivo_url: '',
    observacao: '',
  });

  // Upload em lote
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchUploading, setBatchUploading] = useState(false);

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos', fornecedorId],
    queryFn: () => documentosAPI.listByFornecedor(fornecedorId),
    enabled: !!fornecedorId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      if (!isAdmin) throw new Error('Apenas Administradores têm permissão para anexar documentos ou contratos.');
      return documentosAPI.create({ ...data, fornecedor_id: fornecedorId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', fornecedorId] });
      queryClient.invalidateQueries({ queryKey: ['documentosVencendo'] });
      toast.success('Documento adicionado!');
      setShowForm(false);
      setForm({ nome: '', tipo: 'Contrato', data_vencimento: '', arquivo_url: '', observacao: '' });
    },
    onError: (err) => toast.error(err.message || 'Erro ao salvar documento.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (!isAdmin) throw new Error('Apenas Administradores têm permissão para excluir documentos ou contratos.');
      return documentosAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', fornecedorId] });
      queryClient.invalidateQueries({ queryKey: ['documentosVencendo'] });
      toast.success('Documento removido.');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message || 'Erro ao excluir documento.'),
  });

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const clean = String(dateStr).split('T')[0];
    return new Date(clean + 'T00:00:00');
  };

  const formatDateBR = (dateStr) => {
    if (!dateStr) return '';
    const clean = String(dateStr).split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return format(new Date(dateStr), 'dd/MM/yyyy');
  };

  const getVencimentoStatus = (dataVenc) => {
    if (!dataVenc) return null;
    const targetDate = parseLocalDate(dataVenc);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = targetDate.getTime() - today.getTime();
    const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (dias < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    if (dias <= 30) return { label: `Vence em ${dias}d`, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle };
    return { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FileCheck2 };
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileUrl = await documentosAPI.uploadFile(file);
      setForm((p) => ({
        ...p,
        arquivo_url: fileUrl,
        nome: p.nome ? p.nome : cleanFileName(file.name),
        tipo: p.tipo && p.tipo !== 'Contrato' ? p.tipo : inferDocType(file.name),
      }));
      toast.success('Arquivo anexado com sucesso!');
    } catch (err) {
      console.error('Erro no upload:', err);
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (filesList) => {
    setIsDragging(false);
    if (!isAdmin) {
      toast.error('Apenas Administradores têm permissão para anexar documentos ou contratos.');
      return;
    }
    if (!filesList || filesList.length === 0) return;

    if (filesList.length > 1) {
      // Múltiplos arquivos -> Ativa Envio em Lote
      const newItems = Array.from(filesList).map((f) => ({
        file: f,
        name: cleanFileName(f.name),
        tipo: inferDocType(f.name),
        status: 'pending',
      }));
      setBatchFiles((prev) => [...prev, ...newItems]);
      setShowBatchUpload(true);
      setShowForm(false);
      toast.info(`${filesList.length} arquivos prontos para envio em lote.`);
    } else {
      // Arquivo único
      const single = filesList[0];
      if (showBatchUpload) {
        setBatchFiles((prev) => [
          ...prev,
          { file: single, name: cleanFileName(single.name), tipo: inferDocType(single.name), status: 'pending' },
        ]);
      } else {
        setShowForm(true);
        handleFileUpload(single);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error('Informe o nome do documento.');
      return;
    }
    if (!form.arquivo_url) {
      toast.error('Anexe um arquivo.');
      return;
    }
    createMutation.mutate(form);
  };

  const handleProcessBatch = async () => {
    if (batchFiles.length === 0) return;
    setBatchUploading(true);
    let successCount = 0;

    for (let i = 0; i < batchFiles.length; i++) {
      const item = batchFiles[i];
      if (item.status === 'done') {
        successCount++;
        continue;
      }

      try {
        setBatchFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading' } : f))
        );

        const fileUrl = await documentosAPI.uploadFile(item.file);
        await documentosAPI.create({
          nome: item.name || cleanFileName(item.file.name),
          tipo: item.tipo || 'Outro',
          arquivo_url: fileUrl,
          fornecedor_id: fornecedorId,
        });

        setBatchFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done' } : f))
        );
        successCount++;
      } catch (err) {
        console.error('Erro no arquivo:', item.file.name, err);
        setBatchFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'error' } : f))
        );
      }
    }

    queryClient.invalidateQueries({ queryKey: ['documentos', fornecedorId] });
    queryClient.invalidateQueries({ queryKey: ['documentosVencendo'] });
    setBatchUploading(false);

    if (successCount === batchFiles.length) {
      toast.success(`${successCount} documentos cadastrados com sucesso!`);
      setShowBatchUpload(false);
      setBatchFiles([]);
    } else {
      toast.warning(`${successCount} de ${batchFiles.length} documentos salvos. Verifique os erros.`);
    }
  };

  return (
    <Card
      onDragOver={(e) => {
        if (!isAdmin) return;
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        if (!isAdmin) return;
        e.preventDefault();
        handleDrop(e.dataTransfer.files);
      }}
      className={`transition-colors ${isDragging && isAdmin ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Contratos e Documentos
        </CardTitle>
        {isAdmin && !showForm && !showBatchUpload && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                setShowBatchUpload(true);
                setShowForm(false);
              }}
            >
              <Files className="h-4 w-4" />
              Upload em Lote
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setShowForm(true);
                setShowBatchUpload(false);
              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Banner de Drag & Drop ativo */}
        {isDragging && (
          <div className="p-8 border-2 border-dashed border-primary rounded-xl text-center bg-primary/10 animate-pulse">
            <CloudUpload className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="font-semibold text-primary">Solte os arquivos aqui</p>
            <p className="text-xs text-muted-foreground mt-1">
              Arquivos soltos serão anexados automaticamente
            </p>
          </div>
        )}

        {/* Modal/Seção de Envio em Lote */}
        {showBatchUpload && isAdmin && (
          <div className="space-y-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Files className="h-4 w-4 text-primary" />
                  Upload em Lote de Documentos
                </h3>
                <p className="text-xs text-muted-foreground">
                  Arraste múltiplos arquivos ou selecione do seu computador
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setShowBatchUpload(false);
                  setBatchFiles([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Dropzone de lote */}
            <div
              onClick={() => document.getElementById('batch-upload-input').click()}
              className="p-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary hover:bg-card/50 transition-colors"
            >
              <input
                type="file"
                id="batch-upload-input"
                multiple
                className="hidden"
                onChange={(e) => handleDrop(e.target.files)}
              />
              <CloudUpload className="h-8 w-8 text-primary mx-auto mb-1.5" />
              <p className="text-sm font-medium">Clique para selecionar ou arraste arquivos aqui</p>
              <p className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, PNG, JPG, XML</p>
            </div>

            {/* Lista de arquivos do lote */}
            {batchFiles.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {batchFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card text-xs"
                  >
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <Input
                      value={item.name}
                      placeholder="Nome do documento"
                      className="h-7 text-xs flex-1"
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchFiles((prev) =>
                          prev.map((f, i) => (i === idx ? { ...f, name: val } : f))
                        );
                      }}
                    />
                    <Select
                      value={item.tipo}
                      onValueChange={(val) => {
                        setBatchFiles((prev) =>
                          prev.map((f, i) => (i === idx ? { ...f, tipo: val } : f))
                        );
                      }}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="w-16 text-right shrink-0">
                      {item.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
                      )}
                      {item.status === 'done' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto" />
                      )}
                      {item.status === 'error' && (
                        <span className="text-destructive font-medium">Erro</span>
                      )}
                      {item.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => setBatchFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleProcessBatch}
                disabled={batchUploading || batchFiles.length === 0}
                className="gap-1.5"
              >
                {batchUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {batchUploading
                  ? 'Enviando arquivos...'
                  : `Enviar ${batchFiles.length} ${batchFiles.length === 1 ? 'documento' : 'documentos'}`}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowBatchUpload(false);
                  setBatchFiles([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Formulário Individual */}
        {showForm && isAdmin && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 rounded-lg border border-border bg-muted/30"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do documento *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex.: Contrato de fornecimento 2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={form.data_vencimento}
                  onChange={(e) => setForm((p) => ({ ...p, data_vencimento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Arquivo *</Label>
                <div
                  onClick={() => document.getElementById('single-doc-upload').click()}
                  className={`p-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${form.arquivo_url ? 'border-emerald-500 bg-emerald-50/50' : 'border-border hover:border-primary'}`}
                >
                  <input
                    type="file"
                    id="single-doc-upload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium py-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando arquivo...
                    </div>
                  ) : form.arquivo_url ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 font-medium py-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Arquivo anexado com sucesso (clique para trocar)
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-1">
                      <Upload className="h-4 w-4 text-primary" />
                      Arraste o arquivo aqui ou clique para selecionar
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea
                value={form.observacao}
                rows={2}
                onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))}
                placeholder="Observações sobre o documento..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending} className="gap-1.5">
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileCheck2 className="h-4 w-4" />
                )}
                Salvar Documento
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Documentos Existentes */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : documentos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <CloudUpload className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">Nenhum documento cadastrado.</p>
            {isAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                Arraste arquivos diretamente nesta área para iniciar o upload
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc) => {
              const status = getVencimentoStatus(doc.data_vencimento);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 mx-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{doc.nome}</p>
                      <Badge variant="secondary" className="text-xs">
                        {doc.tipo}
                      </Badge>
                      {status && (
                        <Badge className={`text-xs border ${status.color}`}>
                          <status.icon className="h-3 w-3 mr-0.5" />
                          {status.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {doc.data_vencimento && <span>Venc: {formatDateBR(doc.data_vencimento)}</span>}
                      {doc.observacao && <span className="truncate">· {doc.observacao}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {doc.arquivo_url && (
                      <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Baixar documento">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Excluir documento"
                        onClick={() => setDeleteTarget(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover documento</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover <strong>{deleteTarget?.nome}</strong>? O arquivo continuará acessível se
              já baixado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
