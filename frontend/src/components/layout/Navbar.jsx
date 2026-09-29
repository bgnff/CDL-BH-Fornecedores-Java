import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { isMockMode, resetMockData, deactivateMockMode, isBrowserLocalhost } from '@/api/localClient';
import { toast } from 'sonner';

const LOGO_URL = '/logo-fundacao.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar();
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
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="w-full px-4 sm:px-6">
        <div className="relative flex items-center justify-between h-14">
          
          {/* LADO ESQUERDO: Botão de alternar a Sidebar e Badge de Teste */}
          <div className="flex items-center gap-3">
            {/* Toggle mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={toggleMobile}
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Toggle desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              aria-label="Alternar barra lateral"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            {mockActive && isBrowserLocalhost && (
              <Badge
                variant="outline"
                className="hidden sm:inline-flex items-center gap-1 border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-normal py-0.5"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Modo Teste Local
              </Badge>
            )}
          </div>

          {/* CENTRO: Logo original da Fundação CDL BH rigorosamente centralizada */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
              <img src={LOGO_URL} alt="Fundação CDL BH" className="h-9 w-auto" />
              <span className="hidden sm:inline font-semibold text-foreground text-sm">Fundação CDL BH</span>
            </Link>
          </div>

          {/* LADO DIREITO: Botão de Reset e Menu do Usuário */}
          <div className="flex items-center gap-2">
            {mockActive && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex h-8 text-xs gap-1 border-amber-300 text-amber-800 hover:bg-amber-100/50"
                onClick={handleResetData}
                title="Restaura fornecedores, beneficiários e documentos para o padrão de testes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetar Dados
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border border-border">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {mockActive && (
                    <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                      Modo Teste Ativo
                    </span>
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
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </header>
  );
}
