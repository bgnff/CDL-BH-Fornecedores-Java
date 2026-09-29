import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loader inspirado no Aceternity UI adaptado com a paleta do Favicon FCDL:
 * - Azul CDL: #1c3761
 * - Vermelho: #de292f
 * - Amarelo Ouro: #eee228
 * - Azul Claro: #80c6dd
 * - Verde: #47704c
 */

export function AceternityLoader({ size = 'md', className = '' }) {
  const sizes = {
    sm: { container: 'w-10 h-10', stroke: 2.5, radius: [14, 10, 6] },
    md: { container: 'w-16 h-16', stroke: 3, radius: [24, 18, 11] },
    lg: { container: 'w-24 h-24', stroke: 3.5, radius: [36, 27, 17] },
    xl: { container: 'w-32 h-32', stroke: 4, radius: [50, 38, 24] },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`relative flex items-center justify-center ${currentSize.container} ${className}`}>
      {/* Anel Externo 1: Azul Marinho CDL (#1c3761) */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      >
        <circle
          cx="50"
          cy="50"
          r={currentSize.radius[0]}
          fill="none"
          stroke="#1c3761"
          strokeWidth={currentSize.stroke}
          strokeDasharray="60 40"
          strokeLinecap="round"
          className="opacity-90"
        />
      </motion.svg>

      {/* Anel Médio 2: Vermelho FCDL (#de292f) girando no sentido oposto */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
      >
        <circle
          cx="50"
          cy="50"
          r={currentSize.radius[1]}
          fill="none"
          stroke="#de292f"
          strokeWidth={currentSize.stroke}
          strokeDasharray="45 35"
          strokeLinecap="round"
          className="opacity-90"
        />
      </motion.svg>

      {/* Anel Interno 3: Amarelo Ouro FCDL (#eee228) */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
      >
        <circle
          cx="50"
          cy="50"
          r={currentSize.radius[2]}
          fill="none"
          stroke="#eee228"
          strokeWidth={currentSize.stroke}
          strokeDasharray="30 25"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Núcleo Pulsante Central: Alternando Azul Claro (#80c6dd) e Verde (#47704c) */}
      <motion.div
        className="w-2.5 h-2.5 rounded-full"
        animate={{
          scale: [0.8, 1.3, 0.8],
          backgroundColor: ['#80c6dd', '#47704c', '#80c6dd'],
          boxShadow: [
            '0 0 6px rgba(128, 198, 221, 0.6)',
            '0 0 10px rgba(71, 112, 76, 0.6)',
            '0 0 6px rgba(128, 198, 221, 0.6)'
          ]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
    </div>
  );
}

/**
 * Loader em tela cheia para transições de rotas e verificações de autenticação
 */
export function FullScreenLoader({ message = 'Carregando sistema...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card/80 border border-border shadow-xl">
        <AceternityLoader size="lg" />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground tracking-tight">{message}</p>
          <p className="text-xs text-muted-foreground">Fundação CDL BH</p>
        </div>
      </div>
    </div>
  );
}

export default AceternityLoader;
