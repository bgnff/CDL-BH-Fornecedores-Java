import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Fundação CDL BH. Todos os direitos reservados.</p>
        <a href="https://fundacaocdlbh.org.br" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">fundacaocdlbh.org.br</a>
      </div>
    </footer>
  );
}
