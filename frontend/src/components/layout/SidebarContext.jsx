import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext({
  isCollapsed: false,
  toggleCollapse: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  toggleMobile: () => {},
});

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('cdl_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cdl_sidebar_collapsed', String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);
  const toggleMobile = () => setMobileOpen(prev => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapse,
        mobileOpen,
        setMobileOpen,
        toggleMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
