import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import confetti from "canvas-confetti";

export const FCDL_CONFETTI_COLORS = [
  "#1c3761", // Azul Marinho CDL
  "#de292f", // Vermelho FCDL
  "#eee228", // Amarelo Ouro FCDL
  "#80c6dd", // Azul Claro
  "#47704c", // Verde
];

/**
 * Componente Confetti baseado no Magic UI
 */
export const Confetti = forwardRef((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    className,
    ...rest
  } = props;
  const instanceRef = useRef(null);

  const canvasRef = useCallback(
    (node) => {
      if (node !== null) {
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
    [globalOptions]
  );

  const fire = useCallback(
    (opts = {}) => {
      const mergedOptions = {
        colors: FCDL_CONFETTI_COLORS,
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        ...options,
        ...opts,
      };
      instanceRef.current?.(mergedOptions);
    },
    [options]
  );

  useImperativeHandle(ref, () => ({
    fire,
    reset: () => instanceRef.current?.reset(),
  }));

  useEffect(() => {
    if (!manualstart) {
      fire();
    }
  }, [manualstart, fire]);

  return (
    <canvas ref={canvasRef} className={className} {...rest}>
      {children}
    </canvas>
  );
});

Confetti.displayName = "Confetti";

/**
 * Função utilitária para disparar chuva de confetes festivos com as cores da FCDL
 */
export function fireLoginConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: FCDL_CONFETTI_COLORS,
    zIndex: 9999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Efeito canhões laterais e explosão central
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export default Confetti;
