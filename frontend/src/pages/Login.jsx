import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import logoPrincipal from '@/assets/logo-principal.png';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); window.location.href = '/'; }
    catch { setError('E-mail ou senha incorretos.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoPrincipal} alt="Fundação CDL BH" className="h-24 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-1 text-sm">Entre com sua conta para continuar</p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {error && <div className="mb-5 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><Label>E-mail</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12" required /></div>
            </div>
            <div className="space-y-2"><Label>Senha</Label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12" required /></div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Entrando...</> : <><LogIn className="w-4 h-4" />Entrar</>}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">© {new Date().getFullYear()} Fundação CDL BH</p>
      </div>
    </div>
  );
}
