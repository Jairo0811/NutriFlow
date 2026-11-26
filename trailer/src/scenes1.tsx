import React from 'react';
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { C } from './theme';
import { FONT, Food, Glass, Headline, Logo, Phone, Shot, Sub, easeIO, floatY, phoneHeight, prog, useLayout } from './kit';

export const OV = 8; // fotogramas de fundido cruzado entre escenas
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ===== ESCENA 1 — Cada decisión cuenta (0–5 s) ===== */
const Bottle: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => {
  const f = useCurrentFrame();
  const { u } = useLayout();
  const p = prog(f, 22, 30);
  const w = h * 0.36;
  const wave = Math.sin(f / 9) * 3;
  return (
    <svg width={w} height={h} viewBox="0 0 100 260" style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 + floatY(f, 3, 8 * u), opacity: p, transform: `rotate(${6 + Math.sin(f / 40) * 2}deg)`, filter: `drop-shadow(0 ${14 * u}px ${24 * u}px rgba(0,0,0,0.6))` }}>
      <defs>
        <clipPath id="bottleBody"><path d="M30 38h40v14c14 8 22 20 22 40v132a18 18 0 0 1-18 18H26a18 18 0 0 1-18-18V92c0-20 8-32 22-40z" /></clipPath>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7fe8ff" stopOpacity="0.85" /><stop offset="1" stopColor="#1fa3d6" stopOpacity="0.9" /></linearGradient>
      </defs>
      <rect x="34" y="8" width="32" height="30" rx="6" fill={C.primary} />
      <path d="M30 38h40v14c14 8 22 20 22 40v132a18 18 0 0 1-18 18H26a18 18 0 0 1-18-18V92c0-20 8-32 22-40z" fill="rgba(180,220,230,0.14)" stroke="rgba(200,240,250,0.75)" strokeWidth="2.5" />
      <g clipPath="url(#bottleBody)">
        <path d={`M0 ${120 + wave} Q25 ${112 + wave} 50 ${120 + wave} T100 ${120 + wave} V270 H0 Z`} fill="url(#water)" />
        <rect x="20" y="70" width="9" height="150" rx="4.5" fill="rgba(255,255,255,0.35)" />
      </g>
    </svg>
  );
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, vertical, u } = useLayout();
  const cx = W / 2, cy = vertical ? H * 0.4 : H * 0.45;
  const k = (vertical ? 1.1 : 1.3) * u;
  const R = 158 * k;
  const N = 120;
  const ringOp = prog(f, 80, 35) * 0.85 * (1 - prog(f, 128, 16));
  const foods = vertical
    ? [
        { k: 'orange' as const, x: 0.14, y: 0.12, s: 230, d: 6, r: -12 }, { k: 'avocado' as const, x: 0.86, y: 0.15, s: 270, d: 12, r: 14 },
        { k: 'leaf-a' as const, x: 0.5, y: 0.07, s: 150, d: 18, r: 20 }, { k: 'strawberry' as const, x: 0.16, y: 0.63, s: 170, d: 14, r: -20 },
        { k: 'kiwi' as const, x: 0.85, y: 0.62, s: 190, d: 20, r: 10 }, { k: 'oats' as const, x: 0.12, y: 0.9, s: 230, d: 24, r: 0 },
        { k: 'berry-half' as const, x: 0.88, y: 0.91, s: 150, d: 28, r: -10 },
      ]
    : [
        { k: 'orange' as const, x: 0.11, y: 0.24, s: 250, d: 6, r: -12 }, { k: 'avocado' as const, x: 0.88, y: 0.27, s: 300, d: 12, r: 14 },
        { k: 'leaf-a' as const, x: 0.31, y: 0.1, s: 170, d: 18, r: 20 }, { k: 'strawberry' as const, x: 0.2, y: 0.68, s: 190, d: 14, r: -20 },
        { k: 'kiwi' as const, x: 0.8, y: 0.72, s: 210, d: 20, r: 10 }, { k: 'oats' as const, x: 0.07, y: 0.92, s: 250, d: 24, r: 0 },
        { k: 'berry-half' as const, x: 0.67, y: 0.1, s: 150, d: 28, r: -10 }, { k: 'leaf-b' as const, x: 0.94, y: 0.58, s: 150, d: 30, r: 30 },
      ];
  return (
    <AbsoluteFill>
      {foods.map((fd, i) => (
        <Food key={i} k={fd.k} x={fd.x * W} y={fd.y * H} size={fd.s * u} delay={fd.d} rot={fd.r} spin={0.12 + (i % 3) * 0.05} seed={i} opacity={0.92} />
      ))}
      <Bottle x={vertical ? W * 0.82 : W * 0.74} y={vertical ? H * 0.42 : H * 0.5} h={(vertical ? 330 : 360) * u} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.primary} strokeWidth={5 * u} opacity={ringOp} style={{ filter: `drop-shadow(0 0 ${14 * u}px ${C.primary})` }} />
      </svg>
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const tx = cx + Math.cos(a) * R, ty = cy + Math.sin(a) * R;
        const ang = random(`a${i}`) * Math.PI * 2;
        const dist = (0.5 + random(`d${i}`) * 0.7) * Math.max(W, H) * 0.55;
        const sx = cx + Math.cos(ang) * dist, sy = cy + Math.sin(ang) * dist * (vertical ? 1 : 0.7);
        const p = prog(f, 8 + random(`dl${i}`) * 38, 62, easeIO);
        const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy) || 1;
        const curve = (random(`c${i}`) - 0.5) * 260 * u * Math.sin(Math.PI * p);
        const x = sx + dx * p + (-dy / len) * curve, y = sy + dy * p + (dx / len) * curve;
        const s = (4 + random(`s${i}`) * 6) * u;
        const o = Math.min(1, f / 8) * (1 - prog(f, 122, 22));
        return <div key={i} style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: random(`g${i}`) > 0.5 ? C.primary : C.primaryBorder, opacity: o, boxShadow: `0 0 ${s * 3}px ${C.primary}` }} />;
      })}
      <Logo cx={cx} cy={cy} k={k} word={0} opacity={prog(f, 118, 26)} glow={0.6} />
      <div style={{ position: 'absolute', left: 0, width: W, top: vertical ? H * 0.7 : H * 0.8, display: 'flex', justifyContent: 'center', padding: `0 ${50 * u}px` }}>
        <Headline text="Cada decisión cuenta" size={(vertical ? 96 : 88) * u} start={44} align="center" glow style={{ maxWidth: (vertical ? 940 : 1500) * u }} />
      </div>
    </AbsoluteFill>
  );
};

/* ===== ESCENA 2 — Presentación (5–10 s) ===== */
export const Scene2: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf - OV;
  const { W, H, vertical, u } = useLayout();
  const e = prog(f, 6, 40, easeIO);
  const cx = vertical ? W / 2 : lerp(W / 2, W * 0.29, e);
  const cy = vertical ? lerp(H * 0.4, H * 0.25, e) : lerp(H * 0.45, H * 0.4, e);
  const k = (vertical ? lerp(1.1, 0.95, e) : lerp(1.3, 1.0, e)) * u;
  const pw = (vertical ? 470 : 380) * u;
  const ph = phoneHeight(pw);
  const pIn = prog(f, 8, 44);
  const pcx = vertical ? W / 2 : W * 0.72;
  const pcy = vertical ? H * 0.705 : H * 0.5;
  const rotY = lerp(vertical ? -16 : -24, vertical ? -6 : -11, pIn);
  const tagTop = cy + 308 * k + 22 * u;
  return (
    <AbsoluteFill>
      <Logo cx={cx} cy={cy} k={k} word={prog(f, 24, 30)} glow={0.6} />
      <div style={{ position: 'absolute', left: cx - 400 * u, width: 800 * u, top: tagTop, textAlign: 'center', fontFamily: FONT }}>
        <Sub text="Nutrición, hábitos y bienestar." size={40 * u} start={64} align="center" color={C.text} />
      </div>
      <Phone
        w={pw}
        shine={prog(f, 50, 60, easeIO)}
        style={{
          left: pcx - pw / 2, top: pcy - ph / 2 + (vertical ? (1 - pIn) * 420 * u : 0) + floatY(lf, 1, 7 * u), opacity: pIn,
          transform: `perspective(2200px) translateX(${vertical ? 0 : (1 - pIn) * 300 * u}px) rotateY(${rotY}deg) rotateZ(${vertical ? 0 : 2}deg)`,
        }}
      >
        <Shot n={1} />
      </Phone>
    </AbsoluteFill>
  );
};

/* ===== ESCENA 3 — Conoce tu nutrición (10–17 s) ===== */
const MacroCard: React.FC<{ label: string; value: string; frac: number; remain: string; left: number; top: number; w: number; start: number }> = ({ label, value, frac, remain, left, top, w, start }) => {
  const f = useCurrentFrame() - OV;
  const { u } = useLayout();
  const p = prog(f, start, 26);
  return (
    <Glass style={{ left, top: top + (1 - p) * 40 * u + floatY(f, start, 6 * u), width: w, opacity: p, transform: `scale(${0.92 + 0.08 * p})` }}>
      <div style={{ fontSize: 22 * u, color: C.muted, fontWeight: 500, letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 40 * u, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ height: 12 * u, borderRadius: 8 * u, background: '#26322C', margin: `${14 * u}px 0 ${12 * u}px`, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(3, frac * 100) * prog(f, start + 8, 40)}%`, height: '100%', background: C.primary, borderRadius: 8 * u, boxShadow: `0 0 ${10 * u}px ${C.primary}` }} />
      </div>
      <div style={{ fontSize: 24 * u, color: C.primary, fontWeight: 500 }}>{remain}</div>
    </Glass>
  );
};

export const Scene3: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf - OV;
  const { W, H, vertical, u } = useLayout();
  const pw = (vertical ? 440 : 400) * u;
  const ph = phoneHeight(pw);
  const pcx = vertical ? W / 2 : W * 0.66, pcy = vertical ? H * 0.5 : H * 0.5;
  const sw = prog(f, 62, 30, easeIO);
  const count = Math.round(2891 * prog(f, 18, 70));
  const cw = (vertical ? 300 : 320) * u;
  const L = vertical ? 24 * u : pcx - pw / 2 - cw - 22 * u;
  const Rr = vertical ? W - cw - 24 * u : pcx + pw / 2 + 22 * u;
  const pos = vertical
    ? { cal: [L, H * 0.25], pro: [Rr, H * 0.36], car: [L, H * 0.63], fat: [Rr, H * 0.74] }
    : { cal: [L, H * 0.2], pro: [L, H * 0.62], car: [Rr, H * 0.3], fat: [Rr, H * 0.55] };
  const pIn = prog(f, 0, 36);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: vertical ? 0 : W * 0.06, top: vertical ? H * 0.07 : H * 0.34, width: vertical ? W : W * 0.3, display: 'flex', flexDirection: 'column', alignItems: vertical ? 'center' : 'flex-start', gap: 22 * u, padding: vertical ? `0 ${50 * u}px` : 0 }}>
        <Headline text="Conoce tu nutrición" size={(vertical ? 92 : 74) * u} start={8} align={vertical ? 'center' : 'left'} glow style={{ maxWidth: (vertical ? 940 : 560) * u }} />
        <Sub text="Calorías, macronutrientes y objetivos diarios en un solo lugar." size={(vertical ? 34 : 30) * u} start={30} align={vertical ? 'center' : 'left'} style={{ maxWidth: (vertical ? 800 : 520) * u }} />
      </div>
      <Phone w={pw} shine={prog(f, 40, 70, easeIO)} style={{ left: pcx - pw / 2, top: pcy - ph / 2 + floatY(lf, 2, 8 * u) + (1 - pIn) * 120 * u, opacity: pIn, transform: `perspective(2200px) rotateY(${lerp(-18, -7, pIn)}deg)` }}>
        <Shot n={2} style={{ opacity: 1 - sw, transform: `translateY(${-sw * 8}%)` }} />
        <Shot n={3} style={{ opacity: sw, transform: `translateY(${(1 - sw) * 8}%)` }} />
      </Phone>
      <Glass style={{ left: pos.cal[0], top: pos.cal[1] + (1 - prog(f, 16, 26)) * 40 * u + floatY(f, 1, 6 * u), width: cw, opacity: prog(f, 16, 26) }}>
        <div style={{ fontSize: 22 * u, color: C.muted, fontWeight: 500, letterSpacing: '0.06em' }}>CALORÍAS RESTANTES</div>
        <div style={{ fontSize: 76 * u, fontWeight: 700, color: C.primary, lineHeight: 1.05, textShadow: `0 0 ${24 * u}px rgba(137,246,42,0.5)` }}>{count}</div>
        <div style={{ height: 12 * u, borderRadius: 8 * u, background: '#26322C', margin: `${10 * u}px 0` }}>
          <div style={{ width: `${Math.max(3, (120 / 3011) * 100) * prog(f, 30, 40)}%`, height: '100%', background: C.primary, borderRadius: 8 * u }} />
        </div>
        <div style={{ fontSize: 22 * u, color: C.text }}>120 consumidas de 3011 kcal</div>
      </Glass>
      <MacroCard label="Proteína" value="5 / 188 g" frac={5 / 188} remain="183 g restantes" left={pos.pro[0]} top={pos.pro[1]} w={cw} start={36} />
      <MacroCard label="Carbohidratos" value="20 / 339 g" frac={20 / 339} remain="319 g restantes" left={pos.car[0]} top={pos.car[1]} w={cw} start={58} />
      <MacroCard label="Grasas" value="3 / 100 g" frac={3 / 100} remain="97 g restantes" left={pos.fat[0]} top={pos.fat[1]} w={cw} start={80} />
    </AbsoluteFill>
  );
};
