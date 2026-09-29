import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LoaderOne } from './loader';

/**
 * Stateful Button (Aceternity UI inspired)
 * Gerencia estados de 'idle' | 'loading' | 'success' | 'error'
 * com Loader customizado nas cores exatas do favicon da Fundação CDL BH.
 */
export function StatefulButton({
  children,
  onClick,
  className = '',
  disabled = false,
  loading: controlledLoading,
  success: controlledSuccess,
  status: controlledStatus,
  type = 'button',
  variant = 'primary',
  loaderText = 'Autenticando...',
  ...props
}) {
  const [internalState, setInternalState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const currentState = controlledStatus || (
    controlledLoading !== undefined 
      ? (controlledLoading ? 'loading' : (controlledSuccess ? 'success' : 'idle'))
      : (controlledSuccess ? 'success' : internalState)
  );

  const isLoading = currentState === 'loading';
  const isSuccess = currentState === 'success';

  const handleClick = async (e) => {
    if (disabled || isLoading || isSuccess) return;

    if (onClick) {
      const result = onClick(e);
      // Se for uma Promise assíncrona
      if (result && typeof result.then === 'function') {
        setInternalState('loading');
        try {
          await result;
          setInternalState('success');
          setTimeout(() => {
            setInternalState('idle');
          }, 1800);
        } catch (err) {
          setInternalState('error');
          setTimeout(() => {
            setInternalState('idle');
          }, 1500);
          throw err;
        }
      }
    }
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      whileHover={!disabled && !isLoading ? { scale: 1.015, y: -1 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.985 } : {}}
      className={cn(
        'relative inline-flex items-center justify-center font-medium text-sm rounded-lg transition-all duration-200 select-none overflow-hidden shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:shadow-inner',
        // Estilo primário com degradê sutil e elegante
        variant === 'primary' &&
          'bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground hover:shadow-md hover:shadow-primary/20',
        variant === 'outline' &&
          'border border-border bg-background hover:bg-muted text-foreground',
        (disabled || isLoading) && 'opacity-85 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {/* Brilho dinâmico de fundo ao carregar */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-primary/30 to-amber-300/20 pointer-events-none"
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2.5 py-1 px-2"
          >
            {/* Loader One com cores oficiais do Favicon FCDL */}
            <LoaderOne size="sm" />
            <span className="tracking-tight font-medium text-xs sm:text-sm">
              {loaderText}
            </span>
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="flex items-center justify-center gap-2 text-emerald-300 py-1"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                d="M20 6L9 17l-5-5"
              />
            </motion.svg>
            <span className="font-semibold text-xs sm:text-sm">Sucesso!</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Exporta como Button e StatefulButton para permitir:
// import { Button } from "@/components/ui/stateful-button";
export const Button = StatefulButton;
export default StatefulButton;
