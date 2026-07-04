import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Users, PlusCircle, User, LogOut, Menu, X } from 'lucide-react';

const LOGO_URL = 'https://cdl-bh-manager-1-zip--bg21829.replit.app/logo-principal.png';
const navLinks = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/fornecedores', label: 'Fornecedores', icon: Users },
  { to: '/cadastrar', label: 'Cadastrar', icon: PlusCircle },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={LOGO_URL} alt="Fundação CDL BH" className="h-9 w-auto" />
            <span className="hidden sm:inline font-semibold text-foreground text-sm">Fundação CDL BH</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === to ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border border-border"><User className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user?.full_name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
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
          </nav>
        )}
      </div>
    </header>
  );
}
