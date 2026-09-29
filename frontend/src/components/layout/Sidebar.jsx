import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShieldCheck,
  HeartHandshake,
  Briefcase,
  Handshake,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RotateCcw
} from 'lucide-react';
import { isMockMode, resetMockData, isBrowserLocalhost } from '@/api/localClient';
import { toast } from 'sonner';

const SIDEBAR_LOGO_URL = '/logo-sidebar.png';

const navGroups = [
  {
    title: 'Visão Geral',
    items: [
      { to: '/', label: 'Painel', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: 'Cadastros & Parcerias',
    items: [
      { to: '/fornecedores', label: 'Fornecedores', icon: Users },
      { to: '/prestadores', label: 'Prestadores', icon: Briefcase },
      { to: '/parceiros', label: 'Parceiros', icon: Handshake },
    ]
  },
  {
    title: 'Ações Sociais',
    items: [
      { to: '/beneficiarios', label: 'Beneficiários', icon: HeartHandshake },
      { to: '/projetos', label: 'Projetos', icon: FolderKanban },
    ]
  },
  {
    title: 'Segurança',
    items: [
      { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck },
    ]
  }
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const mockActive = isMockMode();

  const handleResetData = () => {
    resetMockData();
    toast.success('Dados de teste restaurados para o padrão!');
    window.location.reload();
  };

  const isItemActive = (to, exact) => {
    if (exact) return pathname === to;
    if (to === '/') return pathname === '/';
    return pathname.startsWith(to);
  };

  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.to !== '/auditoria' || isAdmin),
    }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card text-card-foreground border-r border-border select-none overflow-x-hidden">
      
      {/* Topo da Sidebar: Logo perfeitamente centralizada, sem bordas e em tamanho visível */}
      <div className={`relative flex flex-col items-center justify-center border-b border-border transition-all overflow-hidden ${
        isCollapsed ? 'px-2 py-3' : 'px-4 py-5'
      }`}>
        {/* Botão de recolher/expandir (Desktop) posicionado de forma discreta */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={`hidden lg:flex text-muted-foreground hover:text-foreground ${
            isCollapsed ? 'h-7 w-7 mb-2' : 'absolute top-2 right-2 h-7 w-7'
          }`}
          title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex flex-col items-center justify-center text-center transition-opacity hover:opacity-90 w-full"
          title="Fundação CDL BH"
        >
          <motion.img
            src={SIDEBAR_LOGO_URL}
            alt="Fundação CDL BH"
            animate={{
              height: isCollapsed ? 44 : 100,
              maxWidth: isCollapsed ? '100%' : '210px'
            }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-auto object-contain mix-blend-multiply border-0 shadow-none outline-none select-none pointer-events-none"
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2.5 flex flex-col items-center leading-tight overflow-hidden"
              >
                <span className="font-bold text-sm text-foreground tracking-tight">Fundação CDL BH</span>
                <span className="text-[11px] text-muted-foreground">Ações Sociais & Gestão</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navegação - Animações Aceternity com framer-motion */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
        {visibleNavGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/75"
                >
                  {group.title}
                </motion.h3>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.to, item.exact);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.18 }}
                          className="flex-1 truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {!isCollapsed && item.badge && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold px-1.5 py-0 rounded ${
                          active
                            ? 'bg-white/20 text-white border-0'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}

                    {/* Tooltip quando recolhido */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-md border border-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Rodapé: Informações do Usuário & Modo Teste */}
      <div className="p-3 border-t border-border bg-muted/30 space-y-2 overflow-hidden">
        {mockActive && isBrowserLocalhost && !isCollapsed && (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-medium text-[11px] truncate">Modo Teste Ativo</span>
            <button
              onClick={handleResetData}
              title="Restaurar dados de teste"
              className="hover:text-amber-950 dark:hover:text-amber-100 p-0.5"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        )}

        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-md ${
            isCollapsed ? 'justify-center p-1' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.full_name || 'Usuário'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'contato@cdlbh.com.br'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sair"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar com animação Aceternity */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:block shrink-0 z-40 sticky top-0 h-screen overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer Overlay e Sidebar com AnimatePresence */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
