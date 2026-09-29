import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 w-full mt-auto">
      <div className="w-full px-6 sm:px-10 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 sm:gap-8 text-xs text-muted-foreground">
        <div className="text-left max-w-3xl space-y-0.5">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Fundação CDL-BH • Arquiteto e Desenvolvedor:{' '}
            <strong className="text-foreground font-medium">Brayan Oliveira de Souza</strong>
          </p>
          <p className="text-[11px] text-muted-foreground/80 leading-normal">
            Software protegido pela Lei nº 9.609/1998 e Lei nº 9.610/1998. Todos os direitos reservados.
          </p>
        </div>

        <a 
          href="https://fundacaocdlbh.org.br" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-primary hover:underline shrink-0"
        >
          fundacaocdlbh.org.br
        </a>
      </div>
    </footer>
  );
}
