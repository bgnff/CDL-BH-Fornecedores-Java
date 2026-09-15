import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FolderPlus, Pencil, Loader2 } from 'lucide-react';

export default function ProjetoDialog({ open, onOpenChange, initialData, onSave, isSaving }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (open) {
      setNome(initialData?.nome || '');
      setDescricao(initialData?.descricao || '');
      setError('');
    }
  }, [open, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('O nome do projeto é obrigatório.');
      return;
    }
    setError('');
    onSave({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {isEditing ? <Pencil className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
              </div>
              <DialogTitle>{isEditing ? 'Editar Projeto Social' : 'Novo Projeto Social'}</DialogTitle>
            </div>
            <DialogDescription>
              {isEditing
                ? 'Atualize o título ou descrição deste projeto da Fundação CDL-BH.'
                : 'Cadastre uma nova iniciativa social para associar fornecedores e parceiros.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projeto-nome">
                Nome do Projeto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="projeto-nome"
                placeholder="Ex: Brinquedoteca Itinerante"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projeto-descricao">Descrição / Finalidade</Label>
              <Textarea
                id="projeto-descricao"
                placeholder="Descreva o propósito da iniciativa, público beneficiado ou área de atuação..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={isSaving}
                rows={4}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
