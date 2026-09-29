import React, { useRef, useEffect } from 'react';

/**
 * Componente que reproduz um vídeo com remoção dinâmica do fundo branco via Canvas.
 * Transforma o fundo claro em transparência real com suavização de bordas (anti-aliasing).
 */
export default function TransparentVideo({
  src,
  className = '',
  threshold = 232, // Limite onde inicia a transparência
  fullTransparent = 246, // Limite onde se torna 100% transparente
  width = 280,
  height = 140,
  cropBottomRatio = 0, // Ex: 0.28 para remover texto estático embutido na parte inferior
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animationFrameId;

    const processFrame = () => {
      if (video.paused || video.ended) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Desenha o quadro atual do vídeo com recorte opcional do rodapé
      if (cropBottomRatio > 0 && video.videoHeight) {
        const sH = video.videoHeight * (1 - cropBottomRatio);
        ctx.drawImage(video, 0, 0, video.videoWidth, sH, 0, 0, w, h);
      } else {
        ctx.drawImage(video, 0, 0, w, h);
      }

      try {
        const frame = ctx.getImageData(0, 0, w, h);
        const data = frame.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Verifica se o pixel é próximo ao branco (fundo claro)
          const minChannel = Math.min(r, g, b);

          if (minChannel >= fullTransparent) {
            // 100% Transparente
            data[i + 3] = 0;
          } else if (minChannel > threshold) {
            // Suavização gradativa da borda para não ficar serrilhado
            const factor = (fullTransparent - minChannel) / (fullTransparent - threshold);
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }

        ctx.putImageData(frame, 0, 0);
      } catch (err) {
        // Fallback caso ocorra restrição de CORS em ambientes externos
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    video.play().catch(() => {});
    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [threshold, fullTransparent]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Vídeo oculto usado como fonte de frames */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Canvas com transparência real sem fundo */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-auto h-full object-contain pointer-events-none select-none drop-shadow-sm"
      />
    </div>
  );
}
