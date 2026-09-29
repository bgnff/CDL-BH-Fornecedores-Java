/**
 * Copyright (c) 2026 Brayan Oliveira de Souza
 * Todos os direitos reservados.
 *
 * Protegido sob a Lei Federal nº 9.609/1998 (Lei do Software)
 * e Lei Federal nº 9.610/1998 (Direitos Autorais).
 */
import '../index.css';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Fornecedores from '@/pages/Fornecedores';
import CadastrarFornecedor from '@/pages/CadastrarFornecedor';
import FornecedorDetalhe from '@/pages/FornecedorDetalhe';
import EditarFornecedor from '@/pages/EditarFornecedor';
import Projetos from '@/pages/Projetos';
import Auditoria from '@/pages/Auditoria';
import Beneficiarios from '@/pages/Beneficiarios';
import CadastrarBeneficiario from '@/pages/CadastrarBeneficiario';
import Prestadores from '@/pages/Prestadores';
import CadastrarPrestador from '@/pages/CadastrarPrestador';
import Parceiros from '@/pages/Parceiros';
import CadastrarParceiro from '@/pages/CadastrarParceiro';
import { FullScreenLoader } from '@/components/ui/AceternityLoader';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

// Wrapper de rota protegida: renderiza <Outlet /> para rotas aninhadas
function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <FullScreenLoader message="Iniciando sessão Fundação CDL..." />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Rotas protegidas: ProtectedRoute renderiza Outlet, AppLayout também renderiza Outlet */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/prestadores" element={<Prestadores />} />
          <Route path="/prestadores/cadastrar" element={<CadastrarPrestador />} />
          <Route path="/parceiros" element={<Parceiros />} />
          <Route path="/parceiros/cadastrar" element={<CadastrarParceiro />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/beneficiarios" element={<Beneficiarios />} />
          <Route path="/beneficiarios/cadastrar" element={<CadastrarBeneficiario />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/cadastrar" element={<CadastrarFornecedor />} />
          <Route path="/fornecedores/:id" element={<FornecedorDetalhe />} />
          <Route path="/fornecedores/:id/editar" element={<EditarFornecedor />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}
