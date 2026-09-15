import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Users, PlusCircle, FolderKanban, User, LogOut, Menu, X, RotateCcw, Sparkles, ShieldCheck } from 'lucide-react';
import { isMockMode, resetMockData, deactivateMockMode } from '@/api/localClient';
import { toast } from 'sonner';

const LOGO_URL = '/logo-fundacao.png';
const navLinks = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/fornecedores', label: 'Fornecedores', icon: Users },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck },
  { to: '/cadastrar', label: 'Cadastrar', icon: PlusCircle },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mockActive = isMockMode();

  const handleResetData = () => {
    resetMockData();
    toast.success('Dados de teste restaurados para o padrão!');
    window.location.reload();
  };

  const handleExitMock = () => {
    deactivateMockMode();
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src={LOGO_URL} alt="Fundação CDL BH" className="h-9 w-auto" />
              <span className="hidden sm:inline font-semibold text-foreground text-sm">Fundação CDL BH</span>
            </Link>
            {mockActive && (
              <Badge variant="outline" className="hidden lg:flex items-center gap-1 border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-normal py-0.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Modo Teste Local
              </Badge>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === to ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {mockActive && (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:inline-flex h-8 text-xs gap-1 border-amber-300 text-amber-800 hover:bg-amber-100/50"
                onClick={handleResetData}
                title="Restaura fornecedores e documentos para a massa inicial de testes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetar Dados
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border border-border"><User className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {mockActive && (
                    <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Modo Teste Ativo</span>
                  )}
                </div>
                <DropdownMenuSeparator />
                {mockActive && (
                  <>
                    <DropdownMenuItem onClick={handleResetData} className="cursor-pointer text-xs">
                      <RotateCcw className="h-3.5 w-3.5 mr-2" />
                      Restaurar Dados Teste
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExitMock} className="cursor-pointer text-xs">
                      <LogOut className="h-3.5 w-3.5 mr-2" />
                      Sair do Modo Teste
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer"><LogOut className="h-4 w-4 mr-2" />Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="md:hidden pb-3 pt-1 border-t border-border mt-1 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === to ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            {mockActive && (
              <button
                onClick={handleResetData}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-50"
              >
                <RotateCcw className="h-4 w-4" />Restaurar Dados de Teste
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
