import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loader One (Aceternity UI Inspired)
 * Customizado com as cores exatas da identidade visual do Favicon Fundação CDL BH:
 * - Azul Marinho CDL: #1c3761
 * - Azul Claro / Ciano: #80c6dd
 * - Amarelo Ouro: #eee228
 * - Vermelho Vibrante: #de292f
 * - Verde Esperança: #47704c
 */

export function LoaderOne({ size = 'sm', className = '' }) {
  const sizeMap = {
    xs: {
      box: 'w-4 h-4',
      strokeWidth: 2,
      particles: 4,
      r1: 6,
      r2: 4,
    },
    sm: {
      box: 'w-5 h-5',
      strokeWidth: 2.2,
      particles: 6,
      r1: 8,
      r2: 5,
    },
    md: {
      box: 'w-8 h-8',
      strokeWidth: 2.8,
      particles: 8,
      r1: 13,
      r2: 8,
    },
    lg: {
      box: 'w-12 h-12',
      strokeWidth: 3.5,
      particles: 10,
      r1: 19,
      r2: 12,
    },
  };

  const config = sizeMap[size] || sizeMap.sm;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${config.box} ${className}`}>
      {/* Halo de pulso suave de fundo */}
      <motion.div
        animate={{
          scale: [0.95, 1.25, 0.95],
          opacity: [0.35, 0.75, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full blur-[2px]"
        style={{
          background: 'radial-gradient(circle, rgba(128,198,221,0.5) 0%, rgba(28,55,97,0.2) 65%, transparent 100%)',
        }}
      />

      {/* SVG com órbitas animadas nas cores do Favicon FCDL */}
      <svg
        className="w-full h-full relative z-10"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fcdl-gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#80c6dd" />
            <stop offset="50%" stopColor="#1c3761" />
            <stop offset="100%" stopColor="#de292f" />
          </linearGradient>

          <linearGradient id="fcdl-gradient-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eee228" />
            <stop offset="60%" stopColor="#47704c" />
            <stop offset="100%" stopColor="#80c6dd" />
          </linearGradient>
        </defs>

        {/* Anel Externo Giratório - Sentido Horário */}
        <motion.circle
          cx="20"
          cy="20"
          r="15"
          stroke="url(#fcdl-gradient-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="42 28"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.1,
            ease: 'linear',
          }}
          style={{ transformOrigin: 'center' }}
        />

        {/* Anel Interno Giratório - Sentido Anti-Horário */}
        <motion.circle
          cx="20"
          cy="20"
          r="9.5"
          stroke="url(#fcdl-gradient-secondary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="24 16"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 0.9,
            ease: 'linear',
          }}
          style={{ transformOrigin: 'center' }}
        />

        {/* Ponto Central com Pulso Rítmico Amarelo Ouro (#eee228) */}
        <motion.circle
          cx="20"
          cy="20"
          r="2.8"
          fill="#eee228"
          animate={{
            scale: [0.75, 1.35, 0.75],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.9,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: 'center' }}
        />

        {/* Satélite Orbitante Vermelho FCDL (#de292f) */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: 'linear',
          }}
          style={{ transformOrigin: 'center' }}
        >
          <circle cx="20" cy="4" r="1.8" fill="#de292f" />
        </motion.g>

        {/* Satélite Orbitante Ciano FCDL (#80c6dd) */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: 'linear',
          }}
          style={{ transformOrigin: 'center' }}
        >
          <circle cx="20" cy="36" r="1.8" fill="#80c6dd" />
        </motion.g>
      </svg>
    </div>
  );
}

export const Loader = LoaderOne;
export default LoaderOne;
