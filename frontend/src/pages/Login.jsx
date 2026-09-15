import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Lock, Loader2, Sparkles, Database } from 'lucide-react';
import { activateMockMode, resetMockData } from '@/api/localClient';

const LOGO_URL = '/logo-fundacao.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique o e-mail/senha ou cadastre o usuário no painel do Supabase (Authentication > Users).');
      } else if (msg.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Ative a opção "Auto Confirm User" no painel do Supabase.');
      } else {
        setError(msg || 'E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (role = 'admin') => {
    activateMockMode();
    resetMockData();
    const testEmail = role === 'user' ? 'user@cdlbh.org.br' : 'admin@cdlbh.org.br';
    await login(testEmail, 'admin123');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Fundação CDL BH" className="h-24 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">Seja Bem-Vindo! </h1>
          <p className="text-muted-foreground mt-1 text-sm">Entre com sua conta para continuar</p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-6">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuário ou E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="admin@cdlbh.org.br" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="pl-10 h-11" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Sua senha" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pl-10 h-11" 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-medium gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Entrando...</> : <><LogIn className="w-4 h-4" />Entrar</>}
            </Button>
          </form>

          {/* Seção de Modo de Teste Local */}
          <div className="pt-4 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-primary" />
                Ambiente de Testes Local:
              </span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-semibold">Sem Servidor</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-xs h-9 gap-1.5 border-primary/30 hover:bg-primary/5 text-primary"
                onClick={() => handleMockLogin('admin')}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Testar como Admin
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-xs h-9 gap-1.5 text-muted-foreground"
                onClick={() => handleMockLogin('user')}
              >
                Testar como User
              </Button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">© {new Date().getFullYear()} Fundação CDL BH</p>
      </div>
    </div>
  );
}
