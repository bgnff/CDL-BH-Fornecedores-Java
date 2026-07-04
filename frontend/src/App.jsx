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

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

// Wrapper de rota protegida: renderiza <Outlet /> para rotas aninhadas
function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
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
