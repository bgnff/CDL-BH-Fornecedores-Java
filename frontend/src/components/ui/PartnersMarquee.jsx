import React from 'react';
import { Marquee } from '@/registry/spell-ui/marquee';

export const PARTNER_LOGOS = [
  { src: '/parceiros/CDL_Belo_Horizonte.png', alt: 'CDL Belo Horizonte' },
  { src: '/parceiros/CDL_Jovem.png', alt: 'CDL Jovem' },
  { src: '/parceiros/Hospital_Sofia_Feldman.png', alt: 'Hospital Sofia Feldman' },
  { src: '/parceiros/Minas_Shopping.png', alt: 'Minas Shopping' },
  { src: '/parceiros/Radio_CDL_FM_102_9.png', alt: 'Rádio CDL FM 102.9' },
  { src: '/parceiros/Rotary_International.png', alt: 'Rotary International' },
  { src: '/parceiros/Lions_International.png', alt: 'Lions International' },
  { src: '/parceiros/OralDents.png', alt: 'OralDents' },
  { src: '/parceiros/Rommanel.png', alt: 'Rommanel' },
  { src: '/parceiros/Martinelli_Advogados.png', alt: 'Martinelli Advogados' },
  { src: '/parceiros/Amadis.png', alt: 'Amadis' },
  { src: '/parceiros/Amor_de_Mae.png', alt: 'Amor de Mãe' },
  { src: '/parceiros/RB_Semijoias.png', alt: 'RB Semijoias' },
  { src: '/parceiros/Salada.png', alt: 'Salada' },
  { src: '/parceiros/Super_Bull.png', alt: 'Super Bull' },
  { src: '/parceiros/Van_Gogh_Papelaria.png', alt: 'Van Gogh Papelaria' },
  { src: '/parceiros/Zumpy.png', alt: 'Zumpy' },
  { src: '/parceiros/Gelastica.png', alt: 'Gelástica' },
  { src: '/parceiros/Recreart.png', alt: 'Recreart' },
  { src: '/parceiros/Ftavio_Cultural.png', alt: 'Ftavio Cultural' },
];

export function PartnersMarquee({ className = '', duration = 35 }) {
  return (
    <div className={`w-full overflow-hidden select-none py-1 ${className}`}>
      {/* Etiqueta institucional sutil */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-[1px] w-8 sm:w-12 bg-border/60" />
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
          Parceiros da Fundação CDL-BH
        </span>
        <div className="h-[1px] w-8 sm:w-12 bg-border/60" />
      </div>

      {/* Carrossel Infinito com máscaras de gradiente nas bordas laterais */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee duration={duration} pauseOnHover={true} className="flex items-center py-1">
          {PARTNER_LOGOS.map((logo) => (
            <div
              key={logo.src}
              className="mx-3 sm:mx-4 flex items-center justify-center h-12 w-28 sm:w-32 px-3 py-1.5 rounded-lg bg-card/70 hover:bg-card border border-border/40 hover:border-primary/30 transition-all duration-300 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)] hover:shadow-md hover:scale-105 group"
              title={logo.alt}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="max-h-8 sm:max-h-9 max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-75 group-hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}

export default PartnersMarquee;
