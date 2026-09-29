import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { SidebarProvider } from './SidebarContext';
import { useAuth } from '@/lib/AuthContext';
import FloatingDock, { defaultDockItems } from '@/components/ui/floating-dock';

export default function AppLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const dockItems = defaultDockItems.filter(
    (item) => item.href !== '/auditoria' || isAdmin
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary relative">
        {/* Animated and interactive Sidebar com framer-motion */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar />
          <main className="flex-1 overflow-y-auto pb-20">
            <Outlet />
          </main>
          <Footer />

          {/* FloatingDock apenas para Mobile, para não conflitar com a Sidebar no Desktop */}

          {/* Mobile FloatingDock Trigger */}
          <div className="fixed bottom-5 right-5 z-40 md:hidden">
            <FloatingDock items={dockItems} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
