import React from 'react';
import { Link } from 'react-router-dom';
import { fornecedoresAPI, documentosAPI } from '@/api/localClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, PlusCircle, Building2, Search, TrendingUp, Activity, AlertTriangle, FileText, FolderKanban } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: fornecedores = [], isLoading } = useQuery({ queryKey: ['fornecedores'], queryFn: () => fornecedoresAPI.list() });
  const { data: documentos = [] } = useQuery({ queryKey: ['documentosVencendo'], queryFn: () => documentosAPI.list() });

  const ativos = fornecedores.filter(f => f.status === 'ativo').length;
  const recentCount = fornecedores.filter(f => new Date(f.created_at) >= new Date(Date.now() - 7*24*60*60*1000)).length;
  const projetoCounts = fornecedores.reduce((acc, f) => { if (f.projeto) acc[f.projeto] = (acc[f.projeto]||0)+1; return acc; }, {});

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const clean = String(dateStr).split('T')[0];
    return new Date(clean + 'T00:00:00');
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const targetDate = parseLocalDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Documentos vencendo nos próximos 30 dias (ou já vencidos)
  const docsVencendo = documentos
    .filter(d => {
      const dias = getDaysUntil(d.data_vencimento);
      return dias !== null && dias <= 30;
    })
    .sort((a, b) => (parseLocalDate(a.data_vencimento) || 0) - (parseLocalDate(b.data_vencimento) || 0));

  const fornecedorMap = {};
  fornecedores.forEach(f => { fornecedorMap[f.id] = f; });

  const stats = [
    { title: 'Total de Fornecedores', value: fornecedores.length, icon: Users, color: 'text-primary' },
    { title: 'Fornecedores Ativos', value: ativos, icon: Activity, color: 'text-emerald-600' },
    { title: 'Cadastrados esta Semana', value: recentCount, icon: TrendingUp, color: 'text-amber-600' },
    { title: 'Projetos com Fornecedores', value: Object.keys(projetoCounts).length, icon: Building2, color: 'text-violet-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo, {user?.full_name?.split(' ')[0] || 'Usuário'}</h1>
        <p className="text-muted-foreground text-sm mt-1">Painel de gestão de fornecedores da Fundação CDL BH</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/cadastrar"><Button className="gap-2"><PlusCircle className="h-4 w-4" />Novo Fornecedor</Button></Link>
        <Link to="/projetos"><Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10"><FolderKanban className="h-4 w-4" />Ver Projetos</Button></Link>
        <Link to="/fornecedores"><Button variant="outline" className="gap-2"><Search className="h-4 w-4" />Buscar Fornecedores</Button></Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.title}>
            <CardHeader className="pb-2"><div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{s.title}</p><s.icon className={`h-5 w-5 ${s.color}`} /></div></CardHeader>
            <CardContent>{isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{s.value}</p>}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Últimos Cadastros</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : fornecedores.length === 0 ? <p className="text-sm text-muted-foreground py-4">Nenhum fornecedor cadastrado ainda.</p>
            : <div className="space-y-3">{fornecedores.slice(0,5).map(f => (
                <Link key={f.id} to={`/fornecedores/${f.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group">
                  <div className="min-w-0"><p className="text-sm font-medium truncate group-hover:text-primary">{f.nome}</p><p className="text-xs text-muted-foreground truncate">{f.empresa_pf}</p></div>
                  {f.projeto && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0 ml-3">{f.projeto}</span>}
                </Link>
              ))}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Fornecedores por Projeto</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
            : Object.keys(projetoCounts).length === 0 ? <p className="text-sm text-muted-foreground py-4">Nenhum projeto com fornecedores.</p>
            : <div className="space-y-3">{Object.entries(projetoCounts).sort((a,b) => b[1]-a[1]).map(([proj, count]) => (
                <div key={proj} className="flex items-center justify-between p-3 rounded-lg border"><span className="text-sm font-medium">{proj}</span><span className="text-sm font-bold text-primary">{count}</span></div>
              ))}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Documentos Vencendo (próximos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docsVencendo.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum documento vencendo nos próximos 30 dias.</p>
          ) : (
            <div className="space-y-3">
              {docsVencendo.slice(0, 10).map(doc => {
                const dias = getDaysUntil(doc.data_vencimento) ?? 0;
                const fornecedor = fornecedorMap[doc.fornecedor_id];
                const vencido = dias < 0;
                return (
                  <Link key={doc.id} to={`/fornecedores/${doc.fornecedor_id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={"h-9 w-9 rounded-lg flex items-center justify-center shrink-0 " + (vencido ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600")}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{doc.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{fornecedor?.nome || "Fornecedor"} · {doc.tipo}</p>
                      </div>
                    </div>
                    <span className={"text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ml-3 " + (vencido ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                      {vencido ? "Vencido há " + Math.abs(dias) + "d" : "Vence em " + dias + "d"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
