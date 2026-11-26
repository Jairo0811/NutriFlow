import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from './theme';

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);

export const prog = (frame: number, start: number, dur: number, fn: (t: number) => number = ease) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn });

export const useLayout = () => {
  const { width: W, height: H } = useVideoConfig();
  const vertical = H > W;
  // Unidad de diseño: 1 u = 1 px en 1080 p (alto en horizontal, ancho en vertical)
  const u = vertical ? W / 1080 : H / 1080;
  return { W, H, vertical, u };
};

export const FONT = "'Poppins', 'Inter', system-ui, sans-serif";

/* ---------- Fondo global (negro profundo + verde neón + partículas) ---------- */
export const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, u } = useLayout();
  const parts = Array.from({ length: 64 }, (_, i) => {
    const speed = 0.25 + random(`ps${i}`) * 0.7;
    const x = random(`px${i}`) * W + Math.sin(f / 70 + i) * 14 * u;
    const y = (((random(`py${i}`) * H - f * speed * u * 1.4) % H) + H) % H;
    const size = (2 + random(`pz${i}`) * 5) * u;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / 26 + i * 1.7));
    return { x, y, size, o: tw * (0.25 + random(`po${i}`) * 0.5) };
  });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at ${50 + 12 * Math.sin(f / 110)}% ${38 + 8 * Math.cos(f / 130)}%, rgba(56,196,43,0.20), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 45% 40% at ${22 + 10 * Math.cos(f / 150)}% ${88 - 6 * Math.sin(f / 120)}%, rgba(137,246,42,0.11), transparent 70%)`,
        }}
      />
      {parts.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size, borderRadius: '50%',
            background: C.primary, opacity: p.o, boxShadow: `0 0 ${p.size * 3}px ${C.primary}`,
          }}
        />
      ))}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ---------- Teléfono con captura real ---------- */
export const PHONE_ASPECT = 2400 / 1080;
export const phoneHeight = (w: number) => {
  const bezel = w * 0.032;
  return (w - bezel * 2) * PHONE_ASPECT + bezel * 2;
};

export const Phone: React.FC<{
  w: number; children: React.ReactNode; style?: React.CSSProperties; shine?: number; glow?: number;
}> = ({ w, children, style, shine = -1, glow = 0.35 }) => {
  const bezel = w * 0.032;
  const h = phoneHeight(w);
  const r = w * 0.13;
  return (
    <div
      style={{
        position: 'absolute', width: w, height: h, borderRadius: r,
        background: 'linear-gradient(160deg, #1d2721 0%, #070b09 55%, #131b16 100%)',
        border: `${Math.max(2, w * 0.006)}px solid rgba(137,246,42,${glow + 0.1})`,
        boxShadow: `0 0 ${w * 0.22}px rgba(137,246,42,${glow * 0.7}), 0 ${w * 0.1}px ${w * 0.25}px rgba(0,0,0,0.65)`,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: bezel, borderRadius: r - bezel, overflow: 'hidden', background: C.bg }}>
        {children}
        {shine >= 0 && (
          <div
            style={{
              position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none',
              background: `linear-gradient(112deg, transparent ${shine * 140 - 40}%, rgba(255,255,255,0.20) ${shine * 140 - 20}%, transparent ${shine * 140}%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export const Shot: React.FC<{ n: 1 | 2 | 3 | 4 | 5 | 6; style?: React.CSSProperties }> = ({ n, style }) => {
  const names = ['login', 'inicio', 'dashboard', 'diario', 'progreso', 'escaner'];
  return (
    <Img
      src={staticFile(`shots/android-0${n}-${names[n - 1]}.png`)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
};

/* ---------- Tarjeta de vidrio oscuro ---------- */
export const Glass: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => {
  const { u } = useLayout();
  return (
    <div
      style={{
        position: 'absolute', background: 'rgba(15,22,18,0.88)', border: `${1.5 * u}px solid rgba(137,246,42,0.38)`,
        borderRadius: 30 * u, padding: `${22 * u}px ${26 * u}px`, boxShadow: `0 0 ${34 * u}px rgba(137,246,42,0.16), 0 ${18 * u}px ${40 * u}px rgba(0,0,0,0.55)`,
        fontFamily: FONT, color: C.text, ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Titular con entrada por palabras ---------- */
export const Headline: React.FC<{
  text: string; size: number; start?: number; align?: 'left' | 'center'; color?: string; italic?: boolean;
  stagger?: number; weight?: number; glow?: boolean; lh?: number; spacing?: string; style?: React.CSSProperties;
}> = ({ text, size, start = 0, align = 'left', color = C.text, italic = true, stagger = 4, weight = 700, glow = false, lh = 1.06, spacing = '0.01em', style }) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{ fontFamily: FONT, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: lh, color, textAlign: align, letterSpacing: spacing, textTransform: 'uppercase', ...style }}>
      {words.map((w, i) => {
        const p = prog(f, start + i * stagger, 22);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', marginRight: '0.26em', opacity: p, transform: `translateY(${(1 - p) * size * 0.55}px)`,
              textShadow: glow ? `0 0 ${size * 0.35}px rgba(137,246,42,0.55)` : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Sub: React.FC<{ text: string; size: number; start?: number; align?: 'left' | 'center'; color?: string; style?: React.CSSProperties }> = ({ text, size, start = 0, align = 'left', color = C.muted, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 24);
  return (
    <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: size, lineHeight: 1.3, color, textAlign: align, opacity: p, transform: `translateY(${(1 - p) * size * 0.8}px)`, ...style }}>
      {text}
    </div>
  );
};

/* ---------- Alimentos (recortes del arte oficial branding/cover.png) ---------- */
export type FoodKey = 'strawberry' | 'kiwi' | 'avocado' | 'berry-half' | 'orange' | 'oats' | 'leaf-a' | 'leaf-b' | 'spinach';
export const Food: React.FC<{
  k: FoodKey; x: number; y: number; size: number; delay?: number; rot?: number; spin?: number; seed?: number; opacity?: number; floatAmp?: number;
}> = ({ k, x, y, size, delay = 0, rot = 0, spin = 0.15, seed = 0, opacity = 1, floatAmp = 9 }) => {
  const f = useCurrentFrame();
  const { u } = useLayout();
  const p = prog(f, delay, 34);
  const fy = Math.sin((f + seed * 37) / 38) * floatAmp * u;
  return (
    <Img
      src={staticFile(`food/${k}.png`)}
      style={{
        position: 'absolute', left: x, top: y + fy, width: size, opacity: p * opacity,
        transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * p}) rotate(${rot + spin * f}deg)`,
        filter: `drop-shadow(0 ${18 * u}px ${28 * u}px rgba(0,0,0,0.65))`,
      }}
    />
  );
};

/* ---------- Logo oficial (recorte transparente de branding/cover.png) ---------- */
// Imagen 630×495; centro del anillo en (312,187); el logotipo "NutriFlow" ocupa ~el 78–100 % inferior.
export const LOGO_W = 630, LOGO_H = 495, RING_CX = 312, RING_CY = 187;
export const Logo: React.FC<{ cx: number; cy: number; k: number; word?: number; opacity?: number; glow?: number; style?: React.CSSProperties }> = ({ cx, cy, k, word = 1, opacity = 1, glow = 0.5, style }) => (
  // El resplandor va en la capa exterior; el recorte del logotipo en la interior (si no, el recorte corta el brillo).
  <div
    style={{
      position: 'absolute', left: cx - RING_CX * k, top: cy - RING_CY * k, width: LOGO_W * k, height: LOGO_H * k, opacity,
      filter: `drop-shadow(0 0 ${28 * k}px rgba(137,246,42,${glow}))`, ...style,
    }}
  >
    <Img
      src={staticFile('brand/nutriflow-logo-transparent.png')}
      style={{ width: '100%', height: '100%', display: 'block', clipPath: `inset(0 0 ${24 * (1 - word)}% 0)` }}
    />
  </div>
);

/* ---------- Iconos (trazo, 24×24) ---------- */
export const Icon: React.FC<{ name: 'drop' | 'sliders' | 'target' | 'chat' | 'camera' | 'mic' | 'sparkle'; size: number; color?: string }> = ({ name, size, color = C.primary }) => {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {name === 'drop' && <path {...common} d="M12 2.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 8.7 12 2.5 12 2.5z" />}
      {name === 'sliders' && (<g {...common}><path d="M4 7h9M18 7h2M4 12h3M12 12h8M4 17h11M20 17h0" /><circle cx="15.5" cy="7" r="2" /><circle cx="9.5" cy="12" r="2" /><circle cx="17.5" cy="17" r="2" /></g>)}
      {name === 'target' && (<g {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.3" /></g>)}
      {name === 'chat' && <path {...common} d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />}
      {name === 'camera' && (<g {...common}><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8 7l1.5-2.5h5L16 7" /><circle cx="12" cy="13.5" r="3.5" /></g>)}
      {name === 'mic' && (<g {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></g>)}
      {name === 'sparkle' && <path {...common} d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />}
    </svg>
  );
};

export const floatY = (f: number, seed: number, amp: number) => Math.sin((f + seed * 29) / 36) * amp;
