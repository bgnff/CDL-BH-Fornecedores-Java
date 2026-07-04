import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/api/localClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) { setIsLoadingAuth(false); return; }
    auth.me().then(setUser).catch(() => {}).finally(() => setIsLoadingAuth(false));
  }, []);

  const login = async (email, password) => {
    const data = await auth.login(email, password);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, isAuthenticated: !!user, login, logout: () => auth.logout('/login') }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
