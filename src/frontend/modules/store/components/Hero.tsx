'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

interface TreeStarData {
  id: number;
  ay0: string;
  ay1: string;
  ty0: string;
  ty1: string;
  delay: string;
  size: string;
  starTint: string;
  twinkleDur: string;
  twinkleDelay: string;
  minOp: string;
}

// Parámetros maestros del Árbol 3D de Navidad David (velocidad armónica y balanceada)
const N_STARS = 180;
const ROTATION_SPEED = '18s';

/**
 * Genera la constelación cónica 3D de 180 estrellas con distribución áurea
 */
function buildTreeStars(count: number): TreeStarData[] {
  const cycleDurationSec = 0.33333 * count * 0.1; // 6s
  const stars: TreeStarData[] = [];

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const goldenAngle = i * 137.508;
    const ay0 = `${(goldenAngle % 360).toFixed(2)}deg`;
    const ay1 = `${(((goldenAngle + 720) % 360) + 720).toFixed(2)}deg`;
    const ty0 = '9.2em';
    const ty1 = '-9.5em';
    const delay = `${(-(progress * cycleDurationSec * 0.999)).toFixed(4)}s`;

    const isTopCluster = progress > 0.9;
    const randomSize = isTopCluster
      ? `${(10 + (i % 6)).toFixed(1)}px`
      : `${(11 + ((i * 13) % 11) * (1 - progress * 0.35)).toFixed(1)}px`;

    const twinkleDur = `${(1.4 + ((i * 17) % 22) * 0.1).toFixed(2)}s`;
    const twinkleDelay = `-${(((i * 23) % 30) * 0.1).toFixed(2)}s`;
    const minOp = `${(0.35 + ((i * 7) % 4) * 0.1).toFixed(2)}`;

    // Paleta oficial Navidad David: blanco puro, oro cálido, champagne y destellos esmeralda
    let starTint: string;
    if (progress > 0.92) {
      starTint = 'rgba(186, 226, 255, 0.95)'; // Cúspide diamante ártico
    } else if (i % 7 === 0) {
      starTint = '#ffe088'; // Oro cálido festivo
    } else if (i % 5 === 0) {
      starTint = 'rgba(255, 236, 179, 0.95)'; // Champagne cálido
    } else if (i % 11 === 0) {
      starTint = '#4ade80'; // Esmeralda suave
    } else {
      starTint = 'rgba(255, 250, 240, 0.92)'; // Blanco perla puro
    }

    stars.push({
      id: i,
      ay0,
      ay1,
      ty0,
      ty1,
      delay,
      size: randomSize,
      starTint,
      twinkleDur,
      twinkleDelay,
      minOp,
    });
  }

  return stars;
}

interface HeroProps {
  onExploreClick: () => void;
}

export function Hero({ onExploreClick }: HeroProps) {
  const [tilt, setTilt] = useState({ x: -8, y: 0 });
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Pre-computar las 180 estrellas cónicas de forma determinista para SSR
  const stars = useMemo(() => buildTreeStars(N_STARS), []);

  // Control interactivo de inclinación 3D de la cámara con mouse y touch
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - startPosRef.current.x;
    const dy = clientY - startPosRef.current.y;
    startPosRef.current = { x: clientX, y: clientY };

    setTilt((prev) => ({
      x: Math.max(-35, Math.min(25, prev.x - dy * 0.35)),
      y: prev.y + dx * 0.45,
    }));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <section
      id="hero-half-stage"
      className="relative w-full min-h-[520px] lg:min-h-[580px] max-h-none lg:max-h-[720px] flex items-stretch bg-[#02130b] overflow-hidden select-none"
    >
      {/* 1. DEGRADADOS Y ATMÓSFERA PROFUNDA DE BOSQUE NOCTURNO */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#010c07] via-[#02140c] to-[#010f08] pointer-events-none z-0" />
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] bg-[#133e2b] rounded-full blur-[140px] opacity-35 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/3 w-[360px] h-[360px] bg-[#1a4430] rounded-full blur-[160px] opacity-20 pointer-events-none z-0" />
      <div className="absolute -bottom-16 right-10 w-[420px] h-[420px] bg-[#1a4430] rounded-full blur-[150px] opacity-25 pointer-events-none z-0" />

      {/* 2. CONTENEDOR PRINCIPAL FLEX (Árbol 3D en izquierda / Editorial en derecha) */}
      <div className="relative z-20 w-full flex flex-col lg:flex-row items-stretch">
        
        {/* COLUMNA IZQUIERDA: ESCENA 3D DEL ÁRBOL DE NAVIDAD DAVID */}
        <div className="w-full lg:w-1/2 min-h-[340px] sm:min-h-[420px] lg:min-h-[560px] flex flex-col items-center justify-center p-3 sm:p-6 relative">
          
          {/* Resplandor áurico detrás del árbol */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] sm:w-[420px] h-[360px] sm:h-[480px] bg-[radial-gradient(circle_at_50%_52%,rgba(34,197,94,0.18)_0%,rgba(254,240,138,0.1)_35%,rgba(2,19,11,0)_75%)] blur-3xl" />
          </div>

          {/* VIEWPORT 3D INTERACTIVO */}
          <div
            ref={viewportRef}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handlePointerUp}
            className="scene-viewport relative w-full max-w-[520px] h-[340px] sm:h-[420px] lg:h-[480px] flex items-center justify-center"
          >
            {/* CONTENEDOR DE INCLINACIÓN DE CÁMARA 3D */}
            <div
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tilt.x.toFixed(1)}deg) rotateY(${tilt.y.toFixed(1)}deg)`,
              }}
            >
              {/* ÁRBOL CÓNICO 3D EN ROTACIÓN CONTINUA */}
              <div
                className="christmas-tree"
                style={
                  {
                    '--n-stars': N_STARS,
                    '--speed': ROTATION_SPEED,
                  } as React.CSSProperties
                }
              >
                {/* ESTRELLA APICAL RADIANTE DE 8 PUNTAS EN LA CIMA */}
                <div className="tree-apical-star" />

                {/* 180 ESTRELLAS DISTRIBUIDAS EN ESPIRAL CÓNICA 3D */}
                {stars.map((star) => (
                  <div
                    key={star.id}
                    className="tree-star"
                    style={
                      {
                        '--ay0': star.ay0,
                        '--ay1': star.ay1,
                        '--ty0': star.ty0,
                        '--ty1': star.ty1,
                        '--delay': star.delay,
                        '--sz': star.size,
                        '--star-tint': star.starTint,
                        '--twinkle-dur': star.twinkleDur,
                        '--twinkle-delay': star.twinkleDelay,
                        '--min-op': star.minOp,
                        '--flow-state': 'paused',
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TEXTO EDITORIAL & CONVERSIÓN CON ALTA ELEGANCIA */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-0 text-left relative">
          {/* Overline Tag */}
          <div className="flex items-center gap-2.5 mb-2 sm:mb-2.5">
            <span className="w-6 sm:w-8 h-[2px] bg-[#bfedd2]" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#bfedd2] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#ffe088]" />
              Colección Botánica &amp; Fibra Óptica 2026
            </span>
          </div>

          {/* Headline de Alto Impacto */}
          <div className="flex flex-col gap-1 sm:gap-1.5 mb-3 sm:mb-3.5">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-[1.15] font-bold">
              Navidad para <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bfedd2] via-white to-[#ffe088] drop-shadow-[0_0_18px_rgba(191,237,210,0.35)]">
                tu familia.
              </span>
            </h1>
            <p className="text-xs sm:text-[13.5px] lg:text-[14px] text-[#c1c8c1] max-w-lg mt-1 leading-relaxed font-light">
              La magia de compartir momentos inolvidables alrededor de pinos frondosos y árboles de
              fibra óptica de última generación. Arquitectura festiva pensada para emocionar por
              generaciones.
            </p>
          </div>

          {/* Botones de Acción (CTA responsivos en móvil) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 mb-3.5 sm:mb-5">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#b90d1c] hover:bg-[#930011] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(185,13,28,0.4)] hover:shadow-[0_0_32px_rgba(185,13,28,0.65)] transition-all duration-300 hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span>Explorar Colección Iluminada</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <a
              href="https://wa.me/573104567890?text=Hola%20Navidad%20David%2C%20quisiera%20asesor%C3%ADa%20sobre%20los%20%C3%A1rboles"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#133e2b] hover:bg-[#bfedd2] text-[#bfedd2] hover:text-[#002718] text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(19,62,43,0.4)] border border-[#bfedd2]/25 transition-all duration-300 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Ver Árboles en Video / Asesoría</span>
            </a>
          </div>

          {/* Tira de Métricas y Garantías de Confianza Adaptada */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 max-w-lg text-center sm:text-left">
            <div className="flex flex-col gap-0.5 p-1.5 sm:p-2.5 rounded-xl bg-[#133e2b]/40 border border-[#bfedd2]/15 backdrop-blur-sm">
              <span className="font-serif text-sm sm:text-xl text-[#bfedd2] font-bold leading-none">
                100%
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-[#c1c8c1] uppercase tracking-wider">
                Pinos Alta Densidad
              </span>
            </div>

            <div className="flex flex-col gap-0.5 p-1.5 sm:p-2.5 rounded-xl bg-[#133e2b]/40 border border-[#bfedd2]/15 backdrop-blur-sm">
              <span className="font-serif text-sm sm:text-xl text-[#ffe088] font-bold leading-none">
                Express
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-[#c1c8c1] uppercase tracking-wider">
                Envío Garantizado
              </span>
            </div>

            <div className="flex flex-col gap-0.5 p-1.5 sm:p-2.5 rounded-xl bg-[#133e2b]/40 border border-[#bfedd2]/15 backdrop-blur-sm">
              <span className="font-serif text-sm sm:text-xl text-[#bfedd2] font-bold leading-none">
                2 Años
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-[#c1c8c1] uppercase tracking-wider">
                Garantía Atelier
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DIFUMINADO INFERIOR SUAVE QUE FUSIONA CON EL VERDE PINO FESTIVO DE LA TIENDA */}
      <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-t from-[#03170e] via-[#02130b]/70 to-transparent pointer-events-none z-30" />
    </section>
  );
}
