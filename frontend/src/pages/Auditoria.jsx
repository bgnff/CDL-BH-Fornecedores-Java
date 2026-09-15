import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logsAPI } from '@/api/localClient';
import { useAuth } from '@/lib/AuthContext';
import { exportToCsv } from '@/lib/exportUtils';
import { toast } from 'sonner';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  RefreshCw,
  PlusCircle,
  FileEdit,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Database,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

function getActionBadge(acao) {
  const norm = (acao || '').toUpperCase();
  if (norm === 'CREATE') {
    return {
      label: 'Criação',
      icon: PlusCircle,
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
  }
  if (norm === 'UPDATE') {
    return {
      label: 'Alteração',
      icon: FileEdit,
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  }
  if (norm === 'DELETE') {
    return {
      label: 'Exclusão',
      icon: Trash2,
      className: 'bg-rose-100 text-rose-800 border-rose-200'
    };
  }
  return {
    label: norm,
    icon: Database,
    className: 'bg-slate-100 text-slate-800 border-slate-200'
  };
}

function getTableLabel(tabela) {
  const t = (tabela || '').toLowerCase();
  if (t === 'fornecedores') return 'Fornecedor';
  if (t === 'projetos') return 'Projeto';
  if (t === 'documentos') return 'Documento';
  if (t === 'usuarios') return 'Usuário';
  return tabela;
}

export default function Auditoria() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [acaoFilter, setAcaoFilter] = useState('ALL');
  const [tabelaFilter, setTabelaFilter] = useState('ALL');
  const [expandedRows, setExpandedRows] = useState({});

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['logs'],
    queryFn: () => logsAPI.list(),
  });

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredLogs = logs.filter(log => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      log.usuario_nome?.toLowerCase().includes(q) ||
      log.tabela?.toLowerCase().includes(q) ||
      log.acao?.toLowerCase().includes(q) ||
      String(log.registro_id).includes(q) ||
      JSON.stringify(log.detalhes || {}).toLowerCase().includes(q);

    const matchAcao = acaoFilter === 'ALL' || (log.acao || '').toUpperCase() === acaoFilter;
    const matchTabela = tabelaFilter === 'ALL' || (log.tabela || '').toLowerCase() === tabelaFilter.toLowerCase();

    return matchSearch && matchAcao && matchTabela;
  });

  const handleExport = () => {
    try {
      const headers = [
        { label: 'Data e Hora', key: l => formatDateTime(l.created_at) },
        { label: 'Usuário', key: l => l.usuario_nome || 'Sistema' },
        { label: 'Ação', key: 'acao' },
        { label: 'Módulo / Tabela', key: l => getTableLabel(l.tabela) },
        { label: 'ID do Registro', key: 'registro_id' },
        { label: 'Detalhes', key: l => JSON.stringify(l.detalhes || {}) }
      ];
      exportToCsv('auditoria_cdlbh', headers, filteredLogs);
      toast.success(`${filteredLogs.length} logs exportados com sucesso!`);
    } catch (err) {
      toast.error(err.message || 'Erro ao exportar logs de auditoria.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trilha de Auditoria</h1>
            <p className="text-sm text-muted-foreground">
              Histórico seguro de ações e alterações realizadas no sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar registros"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, registro, ID ou detalhe..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <Select value={acaoFilter} onValueChange={setAcaoFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criação</SelectItem>
                  <SelectItem value="UPDATE">Alteração</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tabelaFilter} onValueChange={setTabelaFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Todos os módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os módulos</SelectItem>
                  <SelectItem value="fornecedores">Fornecedores</SelectItem>
                  <SelectItem value="projetos">Projetos</SelectItem>
                  <SelectItem value="documentos">Documentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead className="font-semibold">Data / Hora</TableHead>
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold">Ação</TableHead>
                <TableHead className="font-semibold">Módulo</TableHead>
                <TableHead className="font-semibold">Registro Afetado</TableHead>
                <TableHead className="font-semibold text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="py-4">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    Nenhum registro de auditoria encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => {
                  const badge = getActionBadge(log.acao);
                  const BadgeIcon = badge.icon;
                  const isExpanded = !!expandedRows[log.id];
                  const detalhes = log.detalhes || {};
                  const alteracoes = detalhes.alteracoes || null;
                  const hasDiff = alteracoes && Object.keys(alteracoes).length > 0;

                  return (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className={`hover:bg-muted/30 transition-colors ${hasDiff ? 'cursor-pointer' : ''}`}
                        onClick={() => hasDiff && toggleRow(log.id)}
                      >
                        <TableCell className="text-center p-2">
                          {hasDiff ? (
                            <button
                              type="button"
                              className="p-1 hover:bg-muted rounded text-muted-foreground"
                              title={isExpanded ? 'Recolher alterações' : 'Ver alterações'}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          ) : (
                            <span className="inline-block w-4" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(log.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold">
                              {(log.usuario_nome || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{log.usuario_nome || 'Sistema'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs gap-1 py-0.5 border ${badge.className}`}>
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {getTableLabel(log.tabela)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium text-foreground">
                            {detalhes.nome || detalhes.empresa_pf || `ID #${log.registro_id}`}
                          </span>
                          {detalhes.projeto && (
                            <span className="text-xs text-muted-foreground block">
                              Projeto: {detalhes.projeto}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {hasDiff ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(log.id);
                              }}
                            >
                              {isExpanded ? 'Ocultar diff' : 'Ver diff'}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Sem histórico</span>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Linha expandida com visualização do diff de alterações */}
                      {isExpanded && hasDiff && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20">
                          <TableCell colSpan={7} className="p-4 pl-14">
                            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Campos Modificados
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {Object.entries(alteracoes).map(([campo, diff]) => (
                                  <div
                                    key={campo}
                                    className="p-2.5 rounded-md border border-border/80 bg-muted/30 text-xs space-y-1"
                                  >
                                    <span className="font-semibold text-foreground capitalize">
                                      {campo.replace(/_/g, ' ')}
                                    </span>
                                    <div className="flex items-center gap-2 text-muted-foreground pt-1">
                                      <span className="line-through bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                                        {String(diff?.de ?? '(vazio)')}
                                      </span>
                                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                      <span className="font-medium bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                                        {String(diff?.para ?? '(vazio)')}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
