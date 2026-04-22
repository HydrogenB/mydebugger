/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Interactive canvas that absorbs pointer/touch entropy while rendering a
 * particle trail. Provides tactile feedback that randomness is being
 * actively seeded by the user's hover/touch activity.
 */
import React, { useEffect, useRef } from 'react';
import { EntropyPool, pointerEntropyValues } from '../lib/entropy';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
  size: number;
}

interface Props {
  pool: EntropyPool;
  onEvent: () => void;
  progress: number;
  events: number;
  className?: string;
}

const MAX_PARTICLES = 120;
const PARTICLE_DECAY = 0.018;

export const EntropyCanvas: React.FC<Props> = ({
  pool,
  onEvent,
  progress,
  events,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMixRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.max(1, Math.round(clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(clientHeight * ratio));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      observer.disconnect();
      return undefined;
    }

    const step = () => {
      const ratio = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(ratio, ratio);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // Fade trail
      ctx.fillStyle = 'rgba(11, 18, 32, 0.22)';
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= PARTICLE_DECAY;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = Math.max(0, Math.min(1, p.life));
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 70%, ${alpha * 0.9})`;
        ctx.shadowBlur = 14;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = containerRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();

    // throttle absorb to one mix per ~16ms to avoid saturating the pool
    if (now - lastMixRef.current < 12) return;
    lastMixRef.current = now;

    pool.absorb(
      pointerEntropyValues(
        Math.round(x),
        Math.round(y),
        Math.round(now),
        event.pressure,
      ),
    );
    onEvent();

    const particles = particlesRef.current;
    const hue = (now / 12) % 360;
    for (let i = 0; i < 3; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.8 + 0.4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        hue: (hue + i * 18) % 360,
        size: Math.random() * 1.8 + 1.1,
      });
    }
    if (particles.length > MAX_PARTICLES) {
      particles.splice(0, particles.length - MAX_PARTICLES);
    }
  };

  const percent = Math.round(progress * 100);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointer}
      onPointerDown={handlePointer}
      role="img"
      aria-label={`Entropy seeder. ${events} pointer events captured, ${percent} percent seeded.`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-[#0b1220] touch-none select-none ${className ?? ''}`}
      style={{ minHeight: 160 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80 font-semibold">
          Entropy seeder
        </div>
        <div className="mt-1 text-sm sm:text-base text-white/90">
          Move your cursor to seed · tap &amp; drag on mobile
        </div>
        <div className="mt-3 w-full max-w-xs">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 transition-[width] duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/60">
            <span>{events} events</span>
            <span>{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntropyCanvas;
