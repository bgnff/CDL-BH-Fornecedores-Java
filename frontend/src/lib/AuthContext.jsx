import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/api/localClient';
import { supabaseAuth, isSupabaseConfigured } from '@/api/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Escuta eventos de autenticação do Supabase
    let unsubscribe = () => {};
    if (isSupabaseConfigured() && supabaseAuth?.onAuthStateChange) {
      unsubscribe = supabaseAuth.onAuthStateChange((event, userObj) => {
        if (event === 'SIGNED_IN' && userObj) {
          setUser(userObj);
          setIsLoadingAuth(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoadingAuth(false);
        }
      });
    }

    if (!auth.isAuthenticated()) { 
      setUser(null);
      setIsLoadingAuth(false); 
      return () => unsubscribe(); 
    }

    auth.me()
      .then(setUser)
      .catch(() => {
        setUser(null);
      })
      .finally(() => setIsLoadingAuth(false));

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const data = await auth.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async (redirectPath = '/login') => {
    setIsLoadingAuth(true);
    try {
      await auth.logout(redirectPath);
    } catch (err) {
      console.warn('Erro durante o logout:', err);
    } finally {
      setUser(null);
      setIsLoadingAuth(false);
      localStorage.removeItem('cdlbh_token');
      localStorage.removeItem('cdlbh_user');
      localStorage.removeItem('cdlbh_mock_mode');
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {}

      // Redireciona sempre para a rota relativa /login na mesma origem de produção
      window.location.href = redirectPath;
    }
  };

  const signUp = async (email, password, fullName) => {
    return auth.signUp(email, password, fullName);
  };

  const resendConfirmation = async (email) => {
    return auth.resendConfirmation(email);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingAuth, 
      isAuthenticated: !!user, 
      login, 
      logout,
      signUp,
      resendConfirmation
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
