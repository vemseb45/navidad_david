'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';

interface ConstellationPoint {
  id: number;
  top: string;
  left: string;
  size: string;
  bg: string;
  shadow: string;
  duration: string;
  delay: string;
  opacity?: string;
}

/**
 * Constelación calibrada y proporcionada para visualización al 100% de zoom
 */
const TREE_CONSTELLATION_POINTS: ConstellationPoint[] = [
  // Cúspide y zona alta
  { id: 1, top: '10%', left: '48.5%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#fde047', shadow: 'shadow-[0_0_12px_#fde047]', duration: '2.1s', delay: '0.1s' },
  { id: 2, top: '15%', left: '44%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#34d399', shadow: 'shadow-[0_0_16px_#10b981]', duration: '2.8s', delay: '0.4s', opacity: 'opacity-90' },
  { id: 3, top: '17%', left: '53%', size: 'w-2 h-2', bg: '#ffe088', shadow: 'shadow-[0_0_12px_#fbbf24]', duration: '1.9s', delay: '0.7s' },
  { id: 4, top: '21%', left: '49%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#a3ffc7', shadow: 'shadow-[0_0_14px_#34d399]', duration: '2.5s', delay: '0.2s' },

  // Nivel superior-medio
  { id: 5, top: '24%', left: '39%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#ffe088', shadow: 'shadow-[0_0_12px_#f59e0b]', duration: '2.3s', delay: '0.5s' },
  { id: 6, top: '26%', left: '58%', size: 'w-3 h-3 sm:w-3.5 sm:h-3.5', bg: '#34d399', shadow: 'shadow-[0_0_18px_#10b981]', duration: '3.1s', delay: '0.9s', opacity: 'opacity-95' },
  { id: 7, top: '29%', left: '46%', size: 'w-2 h-2', bg: '#fde047', shadow: 'shadow-[0_0_10px_#fde047]', duration: '1.8s', delay: '0.3s' },
  { id: 8, top: '32%', left: '34%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#86efac', shadow: 'shadow-[0_0_14px_#22c55e]', duration: '2.6s', delay: '0.8s' },
  { id: 9, top: '34%', left: '52%', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', bg: '#fde047', shadow: 'shadow-[0_0_18px_#f59e0b]', duration: '2.2s', delay: '0.6s', opacity: 'opacity-90' },
  { id: 10, top: '36%', left: '63%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#bfedd2', shadow: 'shadow-[0_0_12px_#34d399]', duration: '2.9s', delay: '1.1s' },
  { id: 11, top: '38%', left: '42%', size: 'w-2 h-2', bg: '#ffe088', shadow: 'shadow-[0_0_10px_#fbbf24]', duration: '2.0s', delay: '0.4s' },

  // Nivel medio
  { id: 12, top: '42%', left: '28%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#34d399', shadow: 'shadow-[0_0_16px_#10b981]', duration: '2.7s', delay: '0.3s' },
  { id: 13, top: '44%', left: '48%', size: 'w-4 h-4 sm:w-4.5 sm:h-4.5', bg: '#ffe088', shadow: 'shadow-[0_0_20px_#f59e0b]', duration: '3.4s', delay: '1.0s', opacity: 'opacity-95' },
  { id: 14, top: '46%', left: '37%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#a3ffc7', shadow: 'shadow-[0_0_12px_#22c55e]', duration: '2.1s', delay: '0.2s' },
  { id: 15, top: '47%', left: '67%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#4ade80', shadow: 'shadow-[0_0_16px_#22c55e]', duration: '2.5s', delay: '0.7s' },
  { id: 16, top: '50%', left: '56%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#fde047', shadow: 'shadow-[0_0_14px_#fde047]', duration: '1.9s', delay: '0.5s' },
  { id: 17, top: '52%', left: '24%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#bfedd2', shadow: 'shadow-[0_0_12px_#34d399]', duration: '2.4s', delay: '1.2s' },
  { id: 18, top: '54%', left: '43%', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', bg: '#34d399', shadow: 'shadow-[0_0_18px_#059669]', duration: '3.0s', delay: '0.4s' },
  { id: 19, top: '56%', left: '61%', size: 'w-2 h-2', bg: '#ffe088', shadow: 'shadow-[0_0_10px_#fbbf24]', duration: '1.7s', delay: '0.9s' },

  // Nivel medio-bajo
  { id: 20, top: '60%', left: '19%', size: 'w-3 h-3 sm:w-3.5 sm:h-3.5', bg: '#4ade80', shadow: 'shadow-[0_0_18px_#22c55e]', duration: '2.8s', delay: '0.6s' },
  { id: 21, top: '62%', left: '33%', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', bg: '#fde047', shadow: 'shadow-[0_0_18px_#f59e0b]', duration: '2.3s', delay: '0.1s', opacity: 'opacity-90' },
  { id: 22, top: '64%', left: '51%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#bfedd2', shadow: 'shadow-[0_0_12px_#34d399]', duration: '2.7s', delay: '0.8s' },
  { id: 23, top: '66%', left: '71%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#34d399', shadow: 'shadow-[0_0_16px_#10b981]', duration: '2.2s', delay: '0.3s' },
  { id: 24, top: '68%', left: '40%', size: 'w-4 h-4 sm:w-4.5 sm:h-4.5', bg: '#ffe088', shadow: 'shadow-[0_0_22px_#fde047]', duration: '3.5s', delay: '1.1s', opacity: 'opacity-95' },
  { id: 25, top: '70%', left: '60%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#86efac', shadow: 'shadow-[0_0_14px_#22c55e]', duration: '2.0s', delay: '0.7s' },
  { id: 26, top: '72%', left: '27%', size: 'w-2 h-2', bg: '#fde047', shadow: 'shadow-[0_0_10px_#fde047]', duration: '1.8s', delay: '0.5s' },

  // Base ancha y falda del pino
  { id: 27, top: '76%', left: '13%', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', bg: '#34d399', shadow: 'shadow-[0_0_18px_#059669]', duration: '2.9s', delay: '0.2s' },
  { id: 28, top: '77%', left: '47%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#a3ffc7', shadow: 'shadow-[0_0_16px_#34d399]', duration: '2.4s', delay: '0.9s' },
  { id: 29, top: '79%', left: '66%', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', bg: '#ffe088', shadow: 'shadow-[0_0_20px_#f59e0b]', duration: '3.2s', delay: '0.4s', opacity: 'opacity-90' },
  { id: 30, top: '81%', left: '22%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#bfedd2', shadow: 'shadow-[0_0_14px_#34d399]', duration: '2.1s', delay: '0.8s' },
  { id: 31, top: '83%', left: '36%', size: 'w-4 h-4 sm:w-4.5 sm:h-4.5', bg: '#4ade80', shadow: 'shadow-[0_0_22px_#22c55e]', duration: '2.6s', delay: '0.3s', opacity: 'opacity-95' },
  { id: 32, top: '85%', left: '55%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#fde047', shadow: 'shadow-[0_0_12px_#fde047]', duration: '1.9s', delay: '1.0s' },
  { id: 33, top: '87%', left: '76%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#34d399', shadow: 'shadow-[0_0_16px_#10b981]', duration: '2.7s', delay: '0.5s' },
  { id: 34, top: '90%', left: '17%', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', bg: '#ffe088', shadow: 'shadow-[0_0_18px_#fbbf24]', duration: '2.3s', delay: '0.7s' },
  { id: 35, top: '91%', left: '30%', size: 'w-2.5 h-2.5 sm:w-3 sm:h-3', bg: '#86efac', shadow: 'shadow-[0_0_14px_#22c55e]', duration: '2.5s', delay: '0.2s' },
  { id: 36, top: '92%', left: '45%', size: 'w-4 h-4 sm:w-4.5 sm:h-4.5', bg: '#ffe088', shadow: 'shadow-[0_0_20px_#fde047]', duration: '3.3s', delay: '1.2s', opacity: 'opacity-95' },
  { id: 37, top: '91%', left: '63%', size: 'w-3 h-3 sm:w-3.5 sm:h-3.5', bg: '#34d399', shadow: 'shadow-[0_0_18px_#059669]', duration: '2.2s', delay: '0.6s' },
  { id: 38, top: '89%', left: '72%', size: 'w-2 h-2 sm:w-2.5 sm:h-2.5', bg: '#fde047', shadow: 'shadow-[0_0_12px_#f59e0b]', duration: '2.0s', delay: '0.4s' },
];

const FESTIVE_COLORS = [
  '#ffe088', // Oro festivo
  '#ef4444', // Rojo navideño
  '#22c55e', // Verde esmeralda
  '#a3ffc7', // Menta estelar
  '#ffffff', // Blanco destello
  '#f59e0b', // Ámbar cálido
];

// ========================================================
// SISTEMA DE FÍSICA PARA SERPENTINAS Y PIROTECNIA FESTIVA
// ========================================================

class RibbonParticle {
  points: { x: number; y: number }[] = [];
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  width: number;
  wigglePhase: number;
  wiggleSpeed: number;
  amplitude: number;

  constructor(startX: number, startY: number, color: string) {
    this.x = startX;
    this.y = startY;
    const angle = (Math.random() - 0.5) * Math.PI * 1.5 - Math.PI / 2; // Arcos ascendentes y laterales
    const speed = Math.random() * 8 + 6;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.maxLife = Math.floor(Math.random() * 35 + 45); // ~1.3 a 1.6 segundos
    this.life = this.maxLife;
    this.width = Math.random() * 1.5 + 2.5;
    this.wigglePhase = Math.random() * Math.PI * 2;
    this.wiggleSpeed = Math.random() * 0.22 + 0.16;
    this.amplitude = Math.random() * 16 + 10;
  }

  update(): boolean {
    this.life--;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.965;
    this.vy *= 0.965;
    this.vy += 0.14; // Gravedad suave
    this.wigglePhase += this.wiggleSpeed;

    // Desplazamiento perpendicular para el ondeado ondulado de la serpentina
    const perpAngle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
    const offset = Math.sin(this.wigglePhase) * this.amplitude * (this.life / this.maxLife);
    const waveX = this.x + Math.cos(perpAngle) * offset;
    const waveY = this.y + Math.sin(perpAngle) * offset;

    this.points.unshift({ x: waveX, y: waveY });
    if (this.points.length > 18) {
      this.points.pop();
    }

    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
    ctx.stroke();
    ctx.restore();
  }
}

class SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;

  constructor(startX: number, startY: number, color: string) {
    this.x = startX;
    this.y = startY;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.maxLife = Math.floor(Math.random() * 25 + 20);
    this.life = this.maxLife;
    this.size = Math.random() * 2.2 + 1.2;
  }

  update(): boolean {
    this.life--;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.vy += 0.18; // Caída de chispa pirotécnica
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  rot: number;
  rotSpeed: number;

  constructor(startX: number, startY: number, color: string) {
    this.x = startX;
    this.y = startY;
    const angle = (Math.random() - 0.5) * Math.PI * 1.6 - Math.PI / 2;
    const speed = Math.random() * 6 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.maxLife = Math.floor(Math.random() * 32 + 25);
    this.life = this.maxLife;
    this.size = Math.random() * 3.5 + 3.5;
    this.rot = Math.random() * Math.PI;
    this.rotSpeed = (Math.random() - 0.5) * 0.25;
  }

  update(): boolean {
    this.life--;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.vy += 0.1;
    this.rot += this.rotSpeed;
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;

    const s = this.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Subcomponente de partículas estelares de fondo
 */
function BackgroundParticles() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      size: number;
      bg: string;
      top: number;
      left: number;
      opacity: number;
      moveX: number;
      moveY: number;
    }>
  >([]);

  useEffect(() => {
    const items = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      size: Math.random() * 2.2 + 1.2,
      bg: Math.random() > 0.4 ? '#bfedd2' : '#ffe088',
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.2,
      moveX: (Math.random() - 0.5) * 25,
      moveY: (Math.random() - 0.5) * 25,
    }));
    setParticles(items);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          moveX: (Math.random() - 0.5) * 28,
          moveY: (Math.random() - 0.5) * 28,
          opacity: Math.random() * 0.5 + 0.2,
        }))
      );
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: p.bg,
            top: `${p.top}%`,
            left: `${p.left}%`,
            opacity: p.opacity,
            boxShadow: `0 0 6px ${p.bg}`,
            transform: `translate(${p.moveX}px, ${p.moveY}px)`,
            transition: 'transform 6s ease-in-out, opacity 3.5s ease-in-out',
          }}
        />
      ))}
    </div>
  );
}

interface HeroProps {
  onExploreClick: () => void;
}

export function Hero({ onExploreClick }: HeroProps) {
  const [spotlight, setSpotlight] = useState({ x: 260, y: 280, opacity: 0 });
  const [isIlluminated, setIsIlluminated] = useState(false);

  // Referencia al escenario principal y al motor de pirotecnia sobre canvas (DETRÁS del árbol)
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ribbonsRef = useRef<RibbonParticle[]>([]);
  const sparksRef = useRef<SparkParticle[]>([]);
  const starsRef = useRef<StarParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastBurstTimeRef = useRef<number>(0);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Inicializar y redimensionar canvas adaptándose a toda la escena y pantallas Retina
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const rect = hero.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Bucle de animación 60 FPS autónomo
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    // Actualizar y dibujar serpentinas onduladas
    ribbonsRef.current = ribbonsRef.current.filter((ribbon) => {
      const alive = ribbon.update();
      if (alive) ribbon.draw(ctx);
      return alive;
    });

    // Actualizar y dibujar chispas pirotécnicas
    sparksRef.current = sparksRef.current.filter((spark) => {
      const alive = spark.update();
      if (alive) spark.draw(ctx);
      return alive;
    });

    // Actualizar y dibujar estrellas brillantes
    starsRef.current = starsRef.current.filter((star) => {
      const alive = star.update();
      if (alive) star.draw(ctx);
      return alive;
    });

    ctx.restore();

    // Continuar el bucle mientras queden partículas vivas
    if (
      ribbonsRef.current.length > 0 ||
      sparksRef.current.length > 0 ||
      starsRef.current.length > 0
    ) {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    } else {
      animFrameIdRef.current = null;
    }
  }, []);

  // Asegurar que el bucle esté activo si hay partículas
  const ensureAnimationRunning = useCallback(() => {
    if (animFrameIdRef.current === null) {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop]);

  // Disparar ráfaga pirotécnica festiva DETRÁS del árbol (serpentinas + chispas + estrellas, SIN GLOBOS)
  const triggerPyrotechnicBurst = (x: number, y: number) => {
    const colors = FESTIVE_COLORS;

    // 1. Ráfaga de serpentinas onduladas que ascienden en espiral
    const ribbonCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < ribbonCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      ribbonsRef.current.push(new RibbonParticle(x, y, color));
    }

    // 2. Chispas de pirotecnia festiva que radian hacia el exterior
    const sparkCount = Math.floor(Math.random() * 12) + 14;
    for (let i = 0; i < sparkCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      sparksRef.current.push(new SparkParticle(x, y, color));
    }

    // 3. Estrellas brillantes giratorias
    const starCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < starCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      starsRef.current.push(new StarParticle(x, y, color));
    }

    ensureAnimationRunning();
  };

  // Manejo de movimiento sobre el escenario completo (spotlight de fondo)
  const handleStageMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 0.85,
    });
  };

  // EFECTO EXCLUSIVO: Disparo dinámico de pirotecnia y serpentinas DETRÁS DEL ÁRBOL al pasar el ratón
  const handleTreeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsIlluminated(true);

    const now = Date.now();
    if (now - lastBurstTimeRef.current < 70) return; // Control de frecuencia suave (throttling)
    lastBurstTimeRef.current = now;

    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    triggerPyrotechnicBurst(x, y);
  };

  const handleTreeMouseLeave = () => {
    setIsIlluminated(false);
  };

  return (
    <section
      id="hero-half-stage"
      ref={heroRef}
      onMouseMove={handleStageMouseMove}
      onMouseLeave={() => setSpotlight((prev) => ({ ...prev, opacity: 0 }))}
      className="relative w-full min-h-[520px] lg:min-h-[580px] max-h-[720px] flex items-stretch bg-[#02130b] overflow-hidden select-none"
    >
      {/* 1. FONDO CONTINUO UNIFICADO CON DEGRADADOS ATMOSFÉRICOS PINO NOCTURNO (z-0) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#010c07] via-[#02140c] to-[#010f08] pointer-events-none z-0" />
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] bg-[#133e2b] rounded-full blur-[140px] opacity-35 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/3 w-[360px] h-[360px] bg-[#1a4430] rounded-full blur-[160px] opacity-20 pointer-events-none z-0" />
      <div className="absolute -bottom-16 right-10 w-[420px] h-[420px] bg-[#1a4430] rounded-full blur-[150px] opacity-25 pointer-events-none z-0" />

      {/* Partículas de polvo de estrellas en cielo nocturno */}
      <BackgroundParticles />

      {/* 2. LIENZO CANVAS DE FUEGOS ARTIFICIALES Y PIROTECNIA (ESTRICTAMENTE DETRÁS DEL ÁRBOL - z-10) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* SPOTLIGHT INTERACTIVO QUE SIGUE EL CURSOR (z-15) */}
      <div
        className="absolute w-[580px] h-[580px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ease-out bg-[radial-gradient(circle,rgba(191,237,210,0.35)_0%,rgba(61,103,81,0.15)_40%,rgba(2,19,11,0)_75%)] blur-3xl z-15 mix-blend-screen"
        style={{
          left: `${spotlight.x}px`,
          top: `${spotlight.y}px`,
          opacity: spotlight.opacity,
        }}
      />

      {/* 3. CAPAS DEL ÁRBOL NAVIDEÑO EN EL FRENTE (z-20: TAPA Y DEJA VER LOS FUEGOS ARTIFICIALES POR DETRÁS) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div className="absolute inset-0 w-full lg:w-[54%] flex items-start justify-center pointer-events-none select-none pt-4 sm:pt-6 md:pt-8">
          <div className="relative w-full max-w-[440px] h-[420px] sm:h-[460px] md:h-[500px] flex items-center justify-center">
            {/* Capa 1: Resplandor cónico y atmosférico de fondo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[360px] h-[460px] bg-[radial-gradient(ellipse_at_50%_58%,rgba(16,185,129,0.22)_0%,rgba(5,150,105,0.1)_35%,rgba(2,19,11,0)_75%)] blur-2xl" />
            </div>

            {/* Capa 2: Silueta orgánica de pino esmeralda imperial (Cuerpo opaco en el frente que oculta los fuegos que pasan por detrás) */}
            <svg
              viewBox="0 0 440 500"
              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="pineTrunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1a0f07" />
                  <stop offset="50%" stopColor="#2c1a0e" />
                  <stop offset="100%" stopColor="#1a0f07" />
                </linearGradient>
                <linearGradient id="heroPineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#082b1c" stopOpacity="0.96" />
                  <stop offset="35%" stopColor="#052015" stopOpacity="0.93" />
                  <stop offset="70%" stopColor="#03160e" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="#010d08" stopOpacity="0.98" />
                </linearGradient>
                <linearGradient id="heroBranchTone" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0a3523" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#144b33" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0a3523" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* Base y tronco del árbol */}
              <path d="M 211 468 L 210 495 L 230 495 L 229 468 Z" fill="url(#pineTrunkGrad)" />

              {/* Tier 5 (Base frondosa ancha) */}
              <path
                d="M 220 330 C 180 370 120 420 52 470 C 100 460 140 455 180 462 C 140 472 100 480 82 485 C 130 480 180 475 220 475 C 260 475 310 480 358 485 C 340 480 300 472 260 462 C 300 455 340 460 388 470 C 320 420 260 370 220 330 Z"
                fill="url(#heroPineGrad)"
              />
              <path
                d="M 220 330 C 180 370 120 420 52 470 C 100 460 140 455 180 462 C 140 472 100 480 82 485 C 130 480 180 475 220 475 C 260 475 310 480 358 485 C 340 480 300 472 260 462 C 300 455 340 460 388 470 C 320 420 260 370 220 330 Z"
                fill="url(#heroBranchTone)"
              />

              {/* Tier 4 */}
              <path
                d="M 220 240 C 190 280 140 330 85 375 C 130 365 170 362 205 368 C 175 378 145 385 125 390 C 165 385 200 382 220 382 C 240 382 275 385 315 390 C 295 385 265 378 235 368 C 270 362 310 365 355 375 C 300 330 250 280 220 240 Z"
                fill="url(#heroPineGrad)"
              />
              <path
                d="M 220 240 C 190 280 140 330 85 375 C 130 365 170 362 205 368 C 175 378 145 385 125 390 C 165 385 200 382 220 382 C 240 382 275 385 315 390 C 295 385 265 378 235 368 C 270 362 310 365 355 375 C 300 330 250 280 220 240 Z"
                fill="url(#heroBranchTone)"
              />

              {/* Tier 3 */}
              <path
                d="M 220 160 C 195 200 160 245 120 285 C 155 278 185 275 210 280 C 185 288 160 295 145 300 C 180 295 205 292 220 292 C 235 292 260 295 295 300 C 280 295 255 288 230 280 C 255 275 285 278 320 285 C 280 245 245 200 220 160 Z"
                fill="url(#heroPineGrad)"
              />

              {/* Tier 2 */}
              <path
                d="M 220 85 C 200 120 175 160 150 195 C 180 190 205 188 220 192 C 235 188 260 190 290 195 C 265 160 240 120 220 85 Z"
                fill="url(#heroPineGrad)"
              />

              {/* Tier 1 (Cúspide de pino) */}
              <path
                d="M 220 30 C 212 55 195 85 175 110 C 198 106 212 106 220 108 C 228 106 242 106 265 110 C 245 85 228 55 220 30 Z"
                fill="url(#heroPineGrad)"
              />
            </svg>

            {/* Capa 3: Resplandor interactivo al acercarse el mouse */}
            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out mix-blend-screen pointer-events-none ${
                isIlluminated ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_48%_52%,rgba(163,255,199,0.32)_0%,rgba(52,211,153,0.18)_40%,transparent_72%)] filter blur-xl" />
            </div>

            {/* Capa 4: Estrella dorada apical en la cúspide (Escala proporcionada) */}
            <div className="absolute top-1 left-[49%] -translate-x-1/2 flex items-center justify-center tree-star-anim z-30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-[#ffe088]/30 blur-lg absolute" />
              <Star
                className="w-8 h-8 sm:w-9 sm:h-9 text-[#ffe088] fill-[#ffe088] drop-shadow-[0_0_16px_#ffe088]"
                strokeWidth={1.5}
              />
            </div>

            {/* Capa 5: Constelación de filamentos y orbes lumínicos (38 puntos en el frente) */}
            {TREE_CONSTELLATION_POINTS.map((pt) => (
              <div
                key={pt.id}
                className={`needle-glow absolute rounded-full ${pt.size} ${pt.shadow} ${pt.opacity || ''}`}
                style={
                  {
                    top: pt.top,
                    left: pt.left,
                    backgroundColor: pt.bg,
                    '--duration': pt.duration,
                    '--delay': pt.delay,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. CONTENEDOR DE INTERACCIÓN Y COLUMNA EDITORIAL (z-30: PLANO DE INTERACCIÓN Y LECTURA) */}
      <div className="relative z-30 w-full flex flex-col lg:flex-row items-stretch">
        {/* ÁREA INTERACTIVA IZQUIERDA (Pasa el cursor sobre el árbol y dispara los fuegos DETRÁS) */}
        <div
          ref={treeContainerRef}
          onMouseMove={handleTreeMouseMove}
          onMouseEnter={() => setIsIlluminated(true)}
          onMouseLeave={handleTreeMouseLeave}
          className="w-full lg:w-1/2 min-h-[380px] sm:min-h-[440px] lg:min-h-[560px] relative flex items-end p-4 sm:p-6 lg:p-8 cursor-crosshair overflow-hidden"
        >
          {/* Guía flotante de interactividad en esquina inferior izquierda */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#001c10]/80 backdrop-blur-md border border-[#bfedd2]/25 shadow-lg text-[#bfedd2] text-[10px] font-bold pointer-events-none transition-all duration-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isIlluminated ? 'bg-[#a3ffc7]' : 'bg-[#bfedd2]'
              } animate-ping`}
            />
            <span
              className={`uppercase tracking-widest ${
                isIlluminated ? 'text-[#a3ffc7]' : 'text-[#bfedd2]'
              }`}
            >
              {isIlluminated
                ? '✦ ¡Pirotecnia y serpentinas festivas detonando detrás del árbol!'
                : '✦ Pasa el cursor sobre el árbol para celebrar'}
            </span>
          </div>
        </div>

        {/* COLUMNA DERECHA: TEXTO EDITORIAL & CONVERSIÓN CON TAMAÑO EQUILIBRADO */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-0 text-left relative">
          {/* Overline Tag */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-8 h-[2px] bg-[#bfedd2]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#bfedd2]">
              Colección Botánica &amp; Fibra Óptica 2026
            </span>
          </div>

          {/* Headline con tamaño proporcionado (Se lee perfecto al 100% de zoom) */}
          <div className="flex flex-col gap-1.5 mb-3.5">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-[1.12] font-bold">
              Navidad para <br />
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

          {/* Botones de Acción (CTA compactos y elegantes) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4 sm:mb-5">
            <button
              onClick={onExploreClick}
              className="group px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#b90d1c] hover:bg-[#930011] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(185,13,28,0.4)] hover:shadow-[0_0_32px_rgba(185,13,28,0.65)] transition-all duration-300 hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span>Explorar Colección Iluminada</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <a
              href="https://wa.me/573104567890?text=Hola%20Navidad%20David%2C%20quisiera%20asesor%C3%ADa%20sobre%20los%20%C3%A1rboles"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-[#133e2b] hover:bg-[#bfedd2] text-[#bfedd2] hover:text-[#002718] text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(19,62,43,0.4)] border border-[#bfedd2]/25 transition-all duration-300 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Ver Árboles en Video / Asesoría</span>
            </a>
          </div>

          {/* Tira de Métricas y Garantías de Confianza (Proporcionada) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg text-center sm:text-left">
            <div className="flex flex-col gap-0.5 p-2 sm:p-2.5 rounded-xl bg-[#133e2b]/40 border border-[#bfedd2]/15 backdrop-blur-sm">
              <span className="font-serif text-base sm:text-xl text-[#bfedd2] font-bold leading-none">
                100%
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c1c8c1] uppercase tracking-wider">
                Pinos Alta Densidad
              </span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 sm:p-2.5 rounded-xl bg-[#133e2b]/40 border border-[#bfedd2]/15 backdrop-blur-sm">
              <span className="font-serif text-base sm:text-xl text-[#ffe088] font-bold leading-none">
                Express
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c1c8c1] uppercase tracking-wider">
                Envío Garantizado
              </span>
            </div>

            <div className="flex flex-col gap-0.5 p-2 sm:p-2.5 rounded-xl bg-[#133e2b]/40 border border-[#bfedd2]/15 backdrop-blur-sm">
              <span className="font-serif text-base sm:text-xl text-[#bfedd2] font-bold leading-none">
                2 Años
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c1c8c1] uppercase tracking-wider">
                Garantía Atelier
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DIFUMINADO INFERIOR SUAVE QUE FUSIONA CON EL VERDE PINO FESTIVO DE LA TIENDA (z-30) */}
      <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-t from-[#03170e] via-[#02130b]/70 to-transparent pointer-events-none z-30" />
    </section>
  );
}
