import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Sparkles, 
  Database, 
  Send, 
  AlertCircle 
} from 'lucide-react';
import { activateMockMode, deactivateMockMode, resetMockData, isBrowserLocalhost } from '@/api/localClient';
import { StatefulButton } from '@/components/ui/stateful-button';
import TransparentVideo from '@/components/ui/TransparentVideo';
import { BubbleText } from '@/components/ui/BubbleText';
import { PartnersMarquee } from '@/components/ui/PartnersMarquee';
import { toast } from 'sonner';

const VIDEO_URL = '/video_atualizado_fcdl.mp4';

export default function Login() {
  const { login, resendConfirmation, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

  // Redireciona automaticamente se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnconfirmedEmail('');
    setLoading(true);
    setSuccess(false);

    try {
      // Ao logar manualmente com email e senha, desativa o modo mock para usar a API/banco
      deactivateMockMode();
      
      // Delay artificial de 1s para exibir o loader animado de forma visível
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await login(email.trim(), password);
      
      setLoading(false);
      setSuccess(true);
      sessionStorage.setItem('just_logged_in', 'true');
      
      // Aguarda 1.5s exibindo o ícone de sucesso (Check) antes de redirecionar
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setSuccess(false);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not confirmed')) {
        setUnconfirmedEmail(email);
        setError('Seu e-mail ainda não foi confirmado. Verifique o link enviado para sua caixa de entrada e pasta de spam.');
      } else if (
        msg.includes('Invalid login credentials') || 
        msg.includes('401') || 
        msg.includes('403') || 
        msg.toLowerCase().includes('bad credentials') ||
        msg.toLowerCase().includes('inválidas') ||
        msg.toLowerCase().includes('não encontrado')
      ) {
        setError('Credenciais inválidas. Verifique o e-mail ou senha digitados.');
      } else {
        setError(msg || 'E-mail ou senha incorretos.');
      }
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = unconfirmedEmail || email;
    if (!targetEmail) return;

    setResending(true);
    try {
      await resendConfirmation(targetEmail);
      toast.success(`E-mail de confirmação reenviado para ${targetEmail}! Verifique sua caixa de entrada e pasta de spam.`);
    } catch (err) {
      toast.error(err.message || 'Erro ao reenviar confirmação. Tente novamente em alguns minutos.');
    } finally {
      setResending(false);
    }
  };

  const handleMockLogin = async (role = 'admin') => {
    if (!isBrowserLocalhost) return;
    activateMockMode();
    resetMockData();
    const testEmail = role === 'user' ? 'user@cdlbh.org.br' : 'admin@cdlbh.org.br';
    const testPassword = role === 'user' ? 'user123' : 'admin123';
    try {
      // Pequeno delay para animação fluida no mock
      await new Promise(resolve => setTimeout(resolve, 600));
      await login(testEmail, testPassword);
      sessionStorage.setItem('just_logged_in', 'true');
      navigate('/');
    } catch (err) {
      console.warn('Erro ao autenticar mock:', err);
      sessionStorage.setItem('just_logged_in', 'true');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      
      {/* Luz ambiente suave de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 18 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Carrossel Animado Marquee de Parceiros da Fundação CDL-BH */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-3 px-1"
        >
          <PartnersMarquee duration={32} />
        </motion.div>

        {/* Topo: Novo Vídeo Animado da Fundação CDL BH com Fundo Transparente */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex justify-center mb-1"
          >
            <TransparentVideo
              src={VIDEO_URL}
              width={340}
              height={170}
              className="h-32 sm:h-36 w-auto"
            />
          </motion.div>

          {/* Animação BubbleText interativa */}
          <div className="py-1">
            <BubbleText text="Fundação CDL-BH" />
          </div>

          <p className="text-muted-foreground mt-0.5 text-sm">
            Entre com sua conta para continuar
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-7 sm:p-8 space-y-6">
          
          {/* Alerta de Erro Geral */}
          {error && !unconfirmedEmail && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Alerta de E-mail Não Confirmado */}
          {unconfirmedEmail && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs"
            >
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">E-mail não confirmado</p>
                  <p className="mt-0.5 text-amber-800">
                    Clique no link enviado para <strong>{unconfirmedEmail}</strong>. Verifique também a sua pasta de Spam.
                  </p>
                </div>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendConfirmation}
                disabled={resending}
                className="w-full h-8 text-xs flex items-center justify-center gap-1.5 border border-amber-300 rounded-md text-amber-900 hover:bg-amber-100 bg-white font-medium transition-colors"
              >
                {resending ? <AceternityLoader size="sm" /> : <Send className="w-3.5 h-3.5" />}
                Reenviar link de confirmação
              </motion.button>
            </motion.div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="seu-email@cdlbh.org.br" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="pl-10 h-10 text-sm focus-visible:ring-primary/30" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Sua senha" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pl-10 h-10 text-sm focus-visible:ring-primary/30" 
                  required 
                />
              </div>
            </div>

            {/* Botão Entrar com Stateful Button e Loader One nas cores do Favicon FCDL */}
            <StatefulButton
              type="submit"
              loading={loading}
              success={success}
              loaderText="Autenticando..."
              className="w-full h-11 text-sm shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </StatefulButton>
          </form>

          {/* Seção de Demonstração / Testes Locais - Visível ESTRITAMENTE em ambiente de teste localhost */}
          {isBrowserLocalhost && (
            <div className="pt-4 border-t border-border space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  Ambiente de Testes Local:
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-semibold">
                  Sem Servidor
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs h-9 gap-1.5 rounded-md border border-primary/30 hover:bg-primary/10 text-primary font-medium flex items-center justify-center transition-colors shadow-sm"
                  onClick={() => handleMockLogin('admin')}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  Testar como Admin
                </motion.button>

                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs h-9 gap-1.5 rounded-md border border-input hover:bg-accent text-muted-foreground hover:text-foreground font-medium flex items-center justify-center transition-colors shadow-sm"
                  onClick={() => handleMockLogin('user')}
                >
                  Testar como User
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé institucional com créditos */}
        <div className="text-center text-xs text-muted-foreground mt-6 space-y-1">
          <p>© {new Date().getFullYear()} Fundação CDL-BH • Arquiteto e Desenvolvedor: <strong>Brayan Oliveira de Souza</strong></p>
          <p className="text-[11px] text-muted-foreground/80">Protegido sob a Lei nº 9.609/1998 e Lei nº 9.610/1998</p>
        </div>
      </motion.div>
    </div>
  );
}
