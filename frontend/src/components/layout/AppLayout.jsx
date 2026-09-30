import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { SidebarProvider } from './SidebarContext';
import { useAuth } from '@/lib/AuthContext';
export default function AppLayout() {
  const { user } = useAuth();

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

        </div>
      </div>
    </SidebarProvider>
  );
}
