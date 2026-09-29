import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Pencil, Trash2, Mail, Phone, Wrench, Star } from 'lucide-react';

function whatsappUrl(telefone) {
  const digits = (telefone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const formatted = digits.length <= 11 ? '55' + digits : digits;
  return 'https://wa.me/' + formatted;
}

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function PrestadorTable({ prestadores, isLoading, onDeleteClick, onViewDetails, onToggleFavorito }) {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  if (isLoading) return <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>;
  if (prestadores.length === 0) return <div className="text-center py-16"><p className="text-muted-foreground">Nenhum prestador encontrado.</p></div>;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10 text-center font-semibold" title="Favoritos">★</TableHead>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Empresa / Especialidade</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Contato</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Projeto</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Status</TableHead>
              <TableHead className="font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prestadores.map(p => {
              const isPF = p.tipo_pessoa === 'PF';
              return (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="w-10 text-center px-2">
                    <button
                      type="button"
                      onClick={() => onToggleFavorito && onToggleFavorito(p)}
                      className="p-1.5 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-950/40 transition-colors group cursor-pointer inline-flex items-center justify-center"
                      title={p.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
                    >
                      <Star
                        className={`h-4 w-4 transition-transform duration-200 group-hover:scale-125 ${
                          p.favorito
                            ? "fill-amber-400 text-amber-500"
                            : "text-muted-foreground/30 hover:text-amber-400"
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1.5">
                        {p.nome}
                        {isPF && <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300">PF</Badge>}
                        {!isPF && <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300">PJ</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{p.documento || p.cnpj || p.cpf}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-foreground/90">{p.servico || 'Serviços Gerais'}</p>
                      {(p.especialidade || (p.empresa_pf && p.empresa_pf !== p.nome)) && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.especialidade || p.empresa_pf}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-0.5">
                      {p.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /><span className="truncate max-w-[180px]">{p.email}</span></div>}
                      {p.telefone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{p.telefone}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {p.projeto && <Badge variant="secondary" className="text-xs font-normal">{p.projeto}</Badge>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge className={`text-xs ${p.status?.toLowerCase() === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{p.status || 'Ativo'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewDetails(p)} title="Visualizar detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {whatsappUrl(p.telefone) && (
                        <a href={whatsappUrl(p.telefone)} target="_blank" rel="noopener noreferrer" title="Conversar no WhatsApp">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <WhatsAppIcon className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Excluir prestador" onClick={() => onDeleteClick(p)}>
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
