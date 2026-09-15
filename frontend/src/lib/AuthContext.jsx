import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/api/localClient';
import { supabaseAuth, isSupabaseConfigured } from '@/api/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Escuta evento de login automático ao clicar no link do e-mail de confirmação
    let unsubscribe = () => {};
    if (isSupabaseConfigured() && supabaseAuth?.onAuthStateChange) {
      unsubscribe = supabaseAuth.onAuthStateChange((event, userObj) => {
        if (event === 'SIGNED_IN' && userObj) {
          setUser(userObj);
          setIsLoadingAuth(false);
        }
      });
    }

    if (!auth.isAuthenticated()) { 
      setIsLoadingAuth(false); 
      return () => unsubscribe(); 
    }

    auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setIsLoadingAuth(false));

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const data = await auth.login(email, password);
    setUser(data.user);
    return data;
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
      signUp,
      resendConfirmation,
      logout: () => auth.logout('/login') 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
