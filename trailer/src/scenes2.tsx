import React from 'react';
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { C } from './theme';
import { FONT, Food, Glass, Headline, Icon, Logo, Phone, Shot, Sub, easeIO, floatY, phoneHeight, prog, useLayout } from './kit';
import { OV } from './scenes1';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ===== ESCENA 4 — Registra tus alimentos (17–24 s) ===== */
const Barcode: React.FC<{ cx: number; cy: number; w: number; h: number; start: number }> = ({ cx, cy, w, h, start }) => {
  const f = useCurrentFrame() - OV;
  const { u } = useLayout();
  const p = prog(f, start, 26);
  const bars: number[] = [];
  let x = 0, i = 0;
  while (x < 100) { const bw = 0.7 + random(`bw${i}`) * 2.6; bars.push(x, bw); x += bw + 0.6 + random(`bg${i}`) * 1.4; i++; }
  const laser = (Math.sin(f / 14) * 0.5 + 0.5) * h * 0.86 + h * 0.07;
  const corner = 26 * u;
  const col = C.primary;
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2 + floatY(f, 4, 6 * u), width: w, height: h, opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(238,246,236,0.96)', borderRadius: 18 * u, boxShadow: `0 0 ${40 * u}px rgba(137,246,42,0.35)` }} />
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', left: w * 0.08, top: h * 0.14, width: w * 0.84, height: h * 0.72 }}>
        {Array.from({ length: bars.length / 2 }, (_, j) => <rect key={j} x={bars[j * 2]} y={0} width={bars[j * 2 + 1]} height={40} fill="#0A130E" />)}
      </svg>
      <div style={{ position: 'absolute', left: -12 * u, right: -12 * u, top: laser, height: 4 * u, background: col, boxShadow: `0 0 ${18 * u}px ${col}, 0 0 ${40 * u}px ${col}` }} />
      {[[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].map(([ax, ay, sx, sy], j) => (
        <div key={j} style={{ position: 'absolute', left: ax ? undefined : -14 * u, right: ax ? -14 * u : undefined, top: ay ? undefined : -14 * u, bottom: ay ? -14 * u : undefined, width: corner, height: corner, borderTop: sy > 0 ? `${5 * u}px solid ${col}` : undefined, borderBottom: sy < 0 ? `${5 * u}px solid ${col}` : undefined, borderLeft: sx > 0 ? `${5 * u}px solid ${col}` : undefined, borderRight: sx < 0 ? `${5 * u}px solid ${col}` : undefined, borderRadius: 6 * u }} />
      ))}
    </div>
  );
};

export const Scene4: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf - OV;
  const { W, H, vertical, u } = useLayout();
  const pw1 = (vertical ? 430 : 380) * u, pw2 = (vertical ? 400 : 340) * u;
  const ph1 = phoneHeight(pw1), ph2 = phoneHeight(pw2);
  const a = prog(f, 4, 40), b = prog(f, 26, 40);
  const x1 = vertical ? W * 0.31 : W * 0.6, y1 = vertical ? H * 0.52 : H * 0.52;
  const x2 = vertical ? W * 0.71 : W * 0.8, y2 = vertical ? H * 0.5 : H * 0.46;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: vertical ? 0 : W * 0.06, top: vertical ? H * 0.07 : H * 0.2, width: vertical ? W : W * 0.34, display: 'flex', justifyContent: vertical ? 'center' : 'flex-start', padding: vertical ? `0 ${40 * u}px` : 0 }}>
        <Headline text="Registra. Organiza. Controla." size={(vertical ? 92 : 76) * u} start={6} align={vertical ? 'center' : 'left'} glow stagger={9} style={{ maxWidth: (vertical ? 1000 : 600) * u }} />
      </div>
      <Phone w={pw2} glow={0.25} style={{ left: x2 - pw2 / 2 + (1 - b) * 240 * u, top: y2 - ph2 / 2 + floatY(lf, 5, 7 * u), opacity: b, transform: `perspective(2200px) rotateY(${vertical ? -10 : -16}deg) rotateZ(3deg)` }}>
        <Shot n={6} />
      </Phone>
      <Phone w={pw1} shine={prog(f, 40, 60, easeIO)} style={{ left: x1 - pw1 / 2 + (vertical ? 0 : (1 - a) * 260 * u), top: y1 - ph1 / 2 + (vertical ? (1 - a) * 300 * u : 0) + floatY(lf, 2, 8 * u), opacity: a, transform: `perspective(2200px) rotateY(${vertical ? 8 : -9}deg) rotateZ(-2deg)` }}>
        <Shot n={4} />
      </Phone>
      <Barcode cx={vertical ? W * 0.5 : W * 0.3} cy={vertical ? H * 0.885 : H * 0.74} w={(vertical ? 520 : 380) * u} h={(vertical ? 170 : 150) * u} start={40} />
      {vertical ? (
        <>
          <Food k="strawberry" x={W * 0.1} y={H * 0.8} size={160 * u} delay={30} rot={-15} seed={1} />
          <Food k="kiwi" x={W * 0.92} y={H * 0.8} size={170 * u} delay={36} rot={10} seed={2} />
          <Food k="leaf-a" x={W * 0.9} y={H * 0.95} size={130 * u} delay={42} rot={40} seed={3} />
        </>
      ) : (
        <>
          <Food k="strawberry" x={W * 0.5} y={H * 0.88} size={140 * u} delay={30} rot={-15} seed={1} />
          <Food k="kiwi" x={W * 0.94} y={H * 0.88} size={170 * u} delay={36} rot={10} seed={2} />
          <Food k="berry-half" x={W * 0.5} y={H * 0.1} size={120 * u} delay={42} rot={20} seed={3} />
          <Food k="leaf-a" x={W * 0.93} y={H * 0.1} size={140 * u} delay={48} rot={40} seed={4} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* ===== ESCENA 5 — Visualiza tu progreso (24–31 s) ===== */
const Pill: React.FC<{ icon: 'drop' | 'sliders' | 'target'; label: string; left?: number; top?: number; start: number }> = ({ icon, label, left, top, start }) => {
  const f = useCurrentFrame() - OV;
  const { u } = useLayout();
  const p = prog(f, start, 24);
  return (
    <Glass style={{ ...(left === undefined ? { position: 'relative' as const, transform: `translateY(${(1 - p) * 30 * u + floatY(f, start, 5 * u)}px)` } : { left, top: (top ?? 0) + (1 - p) * 30 * u + floatY(f, start, 5 * u) }), opacity: p, padding: `${14 * u}px ${24 * u}px`, borderRadius: 60 * u, display: 'flex', alignItems: 'center', gap: 14 * u }}>
      <Icon name={icon} size={36 * u} />
      <span style={{ fontSize: 28 * u, fontWeight: 700 }}>{label}</span>
    </Glass>
  );
};

const Chart: React.FC<{ left: number; top: number; w: number; h: number; start: number }> = ({ left, top, w, h, start }) => {
  const f = useCurrentFrame() - OV;
  const { u } = useLayout();
  const p = prog(f, start, 70, easeIO);
  const pts = Array.from({ length: 14 }, (_, i) => [i / 13, 0.34 + (i / 13) * 0.42 + Math.sin(i * 1.3) * 0.07 - random(`ch${i}`) * 0.05]);
  const iw = w - 60 * u, ih = h - 130 * u;
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x * iw).toFixed(1)} ${(ih - y * ih).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const dotP = Math.min(1, p * 1.1);
  const op = prog(f, start - 10, 24);
  return (
    <Glass style={{ left, top, width: w, height: h, opacity: op, padding: `${22 * u}px ${30 * u}px` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 * u, fontWeight: 500, color: C.muted }}>
        <span>TU PROGRESO</span><span style={{ color: C.text }}>Actual 218.5 lb · Objetivo 220 lb</span>
      </div>
      <svg width={iw} height={ih} style={{ marginTop: 14 * u, overflow: 'visible' }}>
        <defs><clipPath id="reveal"><rect x="0" y={-30 * u} width={iw * p} height={ih + 60 * u} /></clipPath><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={C.primary} stopOpacity="0.32" /><stop offset="1" stopColor={C.primary} stopOpacity="0" /></linearGradient></defs>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={iw} y1={ih * g} y2={ih * g} stroke="rgba(91,112,98,0.35)" strokeWidth={1.5 * u} />)}
        <path d={`${d} L${last[0] * iw} ${ih} L0 ${ih} Z`} fill="url(#area)" clipPath="url(#reveal)" />
        <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={C.primary} strokeWidth={5 * u} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${10 * u}px ${C.primary})` }} />
        <circle cx={last[0] * iw} cy={ih - last[1] * ih} r={9 * u} fill={C.primaryBorder} opacity={dotP > 0.97 ? 1 : 0} style={{ filter: `drop-shadow(0 0 ${14 * u}px ${C.primary})` }} />
      </svg>
    </Glass>
  );
};

export const Scene5: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf - OV;
  const { W, H, vertical, u } = useLayout();
  const pw = (vertical ? 440 : 390) * u;
  const ph = phoneHeight(pw);
  const pcx = vertical ? W / 2 : W * 0.72, pcy = H * 0.5;
  const pIn = prog(f, 2, 38);
  const pillW = 300 * u;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: vertical ? 0 : W * 0.06, top: vertical ? H * 0.06 : H * 0.1, width: vertical ? W : W * 0.5, display: 'flex', flexDirection: 'column', alignItems: vertical ? 'center' : 'flex-start', gap: 20 * u, padding: vertical ? `0 ${50 * u}px` : 0 }}>
        <Headline text="Cada paso es progreso" size={(vertical ? 92 : 74) * u} start={6} align={vertical ? 'center' : 'left'} glow style={{ maxWidth: (vertical ? 940 : 760) * u }} />
        <Sub text="Establece tus objetivos y visualiza tu progreso, a tu propio ritmo." size={(vertical ? 34 : 30) * u} start={28} align={vertical ? 'center' : 'left'} style={{ maxWidth: (vertical ? 800 : 640) * u }} />
      </div>
      <Phone w={pw} shine={prog(f, 36, 70, easeIO)} style={{ left: pcx - pw / 2, top: pcy - ph / 2 + floatY(lf, 6, 8 * u) + (1 - pIn) * 140 * u, opacity: pIn, transform: `perspective(2200px) rotateY(${lerp(-18, -7, pIn)}deg)` }}>
        <Shot n={5} />
      </Phone>
      {vertical ? (
        <>
          <Pill icon="drop" label="Hidratación" left={24 * u} top={H * 0.3} start={26} />
          <Pill icon="sliders" label="Preferencias" left={W - pillW - 18 * u} top={H * 0.43} start={44} />
          <Pill icon="target" label="Objetivos" left={24 * u} top={H * 0.6} start={62} />
          <Chart left={30 * u} top={H * 0.8} w={W - 60 * u} h={H * 0.17} start={36} />
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: W * 0.06, top: H * 0.46, display: 'flex', gap: 22 * u }}>
            <Pill icon="drop" label="Hidratación" start={26} />
            <Pill icon="sliders" label="Preferencias" start={44} />
            <Pill icon="target" label="Objetivos" start={62} />
          </div>
          <Chart left={W * 0.06} top={H * 0.6} w={W * 0.46} h={H * 0.31} start={36} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* ===== ESCENA 6 — NutriFlow AI (31–38 s) ===== */
const Network: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
  const f = useCurrentFrame();
  const { W, H, u } = useLayout();
  const nodes = Array.from({ length: 30 }, (_, i) => ({
    x: random(`nx${i}`) * W + Math.cos(f / 60 + i) * 26 * u, y: random(`ny${i}`) * H + Math.sin(f / 75 + i * 1.3) * 26 * u, r: (3 + random(`nr${i}`) * 4) * u,
  }));
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
    if (d < 300 * u) lines.push(<line key={`${i}-${j}`} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} stroke={C.primary} strokeOpacity={(1 - d / (300 * u)) * 0.28} strokeWidth={1.5 * u} />);
  }
  const reveal = prog(f, 0, 40);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: reveal }}>
      {lines}
      {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={C.primary} opacity={0.55 + 0.4 * Math.sin(f / 20 + i)} />)}
      <circle cx={cx} cy={cy} r={1} fill="none" />
    </svg>
  );
};

const CapCard: React.FC<{ icon: 'chat' | 'camera' | 'mic' | 'sparkle'; title: string; sub: string; left: number; top: number; w: number; h: number; start: number }> = ({ icon, title, sub, left, top, w, h, start }) => {
  const f = useCurrentFrame() - OV;
  const { u, vertical } = useLayout();
  const p = prog(f, start, 26);
  return (
    <Glass style={{ left, top: top + (1 - p) * 36 * u + floatY(f, start, 5 * u), width: w, height: h, boxSizing: 'border-box', opacity: p, transform: `scale(${0.94 + 0.06 * p})`, display: 'flex', flexDirection: 'column', gap: 10 * u }}>
      <div style={{ width: 70 * u, height: 70 * u, borderRadius: 22 * u, background: 'rgba(137,246,42,0.12)', border: `${1.5 * u}px solid rgba(137,246,42,0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={40 * u} />
      </div>
      <div style={{ fontSize: (vertical ? 34 : 28) * u, fontWeight: 700, whiteSpace: 'nowrap' }}>{title}</div>
      <div style={{ fontSize: 24 * u, color: C.muted, lineHeight: 1.25 }}>{sub}</div>
    </Glass>
  );
};

export const Scene6: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf - OV;
  const { W, H, vertical, u } = useLayout();
  const ocx = vertical ? W / 2 : W * 0.22, ocy = vertical ? H * 0.38 : H * 0.62;
  const os = (vertical ? 340 : 330) * u;
  const pulse = 1 + 0.04 * Math.sin(f / 12);
  const cw = (vertical ? 498 : 430) * u;
  const gx = vertical ? 30 * u : W * 0.48, gy = vertical ? H * 0.57 : H * 0.2;
  const gap = 22 * u;
  const ch = (vertical ? 230 : 250) * u;
  const cards: [('chat' | 'camera' | 'mic' | 'sparkle'), string, string][] = [
    ['chat', 'AI Coach', 'Orientación nutricional conversacional'],
    ['camera', 'Meal Photo AI', 'Analiza una foto de tu comida'],
    ['mic', 'Voice Logging', 'Registra tus comidas con la voz'],
    ['sparkle', 'Asistencia nutricional', 'Sugerencias según tu perfil'],
  ];
  return (
    <AbsoluteFill>
      <Network cx={ocx} cy={ocy} />
      <div style={{ position: 'absolute', left: ocx - os * 0.9, top: ocy - os * 0.9, width: os * 1.8, height: os * 1.8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(137,246,42,0.28), transparent 68%)', transform: `scale(${pulse * prog(f, 6, 30)})`, opacity: prog(f, 4, 20) }} />
      {[0, 1].map((i) => {
        const t = ((f + i * 45) % 90) / 90;
        return <div key={i} style={{ position: 'absolute', left: ocx - os / 2, top: ocy - os / 2, width: os, height: os, borderRadius: '50%', border: `${3 * u}px solid ${C.primary}`, transform: `scale(${0.6 + t * 0.9})`, opacity: (1 - t) * 0.6 * prog(f, 10, 20) }} />;
      })}
      <Logo cx={ocx} cy={ocy} k={(os / 2 / 158) * 0.78} word={0} opacity={prog(f, 6, 26)} glow={0.7} />
      <div style={{ position: 'absolute', left: vertical ? 0 : W * 0.06, top: vertical ? H * 0.07 : H * 0.14, width: vertical ? W : W * 0.4, display: 'flex', justifyContent: vertical ? 'center' : 'flex-start', padding: vertical ? `0 ${40 * u}px` : 0 }}>
        <Headline text="Nutrición asistida por IA" size={(vertical ? 88 : 66) * u} start={6} align={vertical ? 'center' : 'left'} glow style={{ maxWidth: (vertical ? 1000 : 640) * u }} />
      </div>
      {cards.map((c, i) => (
        <CapCard key={c[1]} icon={c[0]} title={c[1]} sub={c[2]} w={cw} h={ch} left={gx + (i % 2) * (cw + gap)} top={gy + Math.floor(i / 2) * (ch + gap)} start={20 + i * 26} />
      ))}
      <div style={{ position: 'absolute', left: 0, width: W, bottom: (vertical ? 70 : 44) * u, textAlign: 'center', fontFamily: FONT, fontSize: (vertical ? 24 : 22) * u, color: C.muted, opacity: prog(f, 120, 30) * 0.9 }}>
        Funciones implementadas en el código; su uso requiere configurar el servicio.
      </div>
    </AbsoluteFill>
  );
};

/* ===== ESCENA 7 — Revelación final (38–41.5 s) y tarjeta institucional (41.5–45 s) ===== */
export const Scene7: React.FC = () => {
  const lf = useCurrentFrame();
  const f = lf - OV;
  const { W, H, vertical, u } = useLayout();
  const flash = (1 - prog(f, 0, 14)) * 0.55;
  const shock = prog(f, 0, 60);
  const lcx = vertical ? W / 2 : W * 0.28, lcy = vertical ? H * 0.2 : H * 0.36;
  const lk = (vertical ? 0.95 : 1.15) * u;
  const lp = prog(f, 4, 30);
  const out = 1 - prog(f, 90, 14); // sale hacia la tarjeta institucional
  const phones: { n: 1 | 3 | 5; w: number; x: number; y: number; rot: number; ry: number; d: number }[] = vertical
    ? [
        { n: 1, w: 330 * u, x: W * 0.2, y: H * 0.8, rot: -9, ry: 14, d: 14 },
        { n: 5, w: 330 * u, x: W * 0.8, y: H * 0.8, rot: 9, ry: -14, d: 20 },
        { n: 3, w: 400 * u, x: W * 0.5, y: H * 0.775, rot: 0, ry: 0, d: 8 },
      ]
    : [
        { n: 1, w: 290 * u, x: W * 0.62, y: H * 0.55, rot: -8, ry: 16, d: 14 },
        { n: 5, w: 290 * u, x: W * 0.9, y: H * 0.55, rot: 8, ry: -16, d: 20 },
        { n: 3, w: 370 * u, x: W * 0.76, y: H * 0.5, rot: 0, ry: 0, d: 8 },
      ];
  const sloganSize = (vertical ? 52 : 46) * u;
  const slogans = ['Tu nutrición.', 'Tus hábitos.', 'Tu progreso.'];
  const sx = vertical ? W / 2 : lcx, sy = vertical ? lcy + 308 * lk + 36 * u : lcy + 308 * lk + 36 * u;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: lcx - 520 * u * shock, top: lcy - 520 * u * shock, width: 1040 * u * shock, height: 1040 * u * shock, borderRadius: '50%', border: `${3 * u}px solid ${C.primary}`, opacity: (1 - shock) * 0.7 }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={lcx} cy={lcy} r={330 * lk} fill="none" stroke={C.primary} strokeOpacity={0.25 * lp} strokeWidth={2 * u} strokeDasharray={`${14 * u} ${22 * u}`} transform={`rotate(${f * 0.35} ${lcx} ${lcy})`} />
      </svg>
      <Food k="orange" x={vertical ? W * 0.1 : W * 0.06} y={vertical ? H * 0.5 : H * 0.84} size={200 * u} delay={16} rot={-12} seed={1} opacity={0.9} />
      <Food k="avocado" x={vertical ? W * 0.92 : W * 0.5} y={vertical ? H * 0.52 : H * 0.88} size={230 * u} delay={22} rot={12} seed={2} opacity={0.9} />
      <Food k="leaf-a" x={vertical ? W * 0.9 : W * 0.46} y={vertical ? H * 0.06 : H * 0.12} size={150 * u} delay={26} rot={28} seed={3} opacity={0.9} />
      <Food k="strawberry" x={vertical ? W * 0.1 : W * 0.15} y={vertical ? H * 0.07 : H * 0.12} size={150 * u} delay={30} rot={-18} seed={4} opacity={0.9} />
      <Logo cx={lcx} cy={lcy} k={lk * (0.9 + 0.1 * lp)} word={1} opacity={lp} glow={0.8} />
      <div style={{ position: 'absolute', left: sx - 520 * u, width: 1040 * u, top: sy, textAlign: 'center', fontFamily: FONT }}>
        {slogans.map((s, i) => (
          <Headline key={s} text={s} size={sloganSize} start={30 + i * 14} align="center" color={i === 2 ? C.primary : C.text} italic glow={i === 2} lh={1.15} />
        ))}
      </div>
      {phones.map((p, i) => {
        const e = prog(f, p.d, 36);
        const ph = phoneHeight(p.w);
        return (
          <Phone key={i} w={p.w} shine={i === 2 ? prog(f, 50, 40, easeIO) : -1} glow={i === 2 ? 0.55 : 0.3} style={{ left: p.x - p.w / 2, top: p.y - ph / 2 + (1 - e) * 360 * u + floatY(lf, i, 8 * u), opacity: e, zIndex: i === 2 ? 3 : 1, transform: `perspective(2200px) rotateY(${p.ry}deg) rotateZ(${p.rot}deg)` }}>
            <Shot n={p.n} />
          </Phone>
        );
      })}
      <AbsoluteFill style={{ background: C.primary, opacity: flash, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

export const Institutional: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, vertical, u } = useLayout();
  const p = prog(f, 4, 30);
  const logoW = (vertical ? 640 : 560) * u;
  const logoH = logoW * (675 / 1085);
  const tx = vertical ? W / 2 : W * 0.66;
  const line = (text: string, size: number, start: number, color: string, weight = 700, italic = false) => {
    const e = prog(f, start, 24);
    return <div style={{ fontFamily: FONT, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', fontSize: size, color, opacity: e, transform: `translateY(${(1 - e) * 26 * u}px)`, textAlign: vertical ? 'center' : 'left', letterSpacing: '0.02em' }}>{text}</div>;
  };
  return (
    <AbsoluteFill style={{ opacity: prog(f, 0, 12) }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(56,196,43,0.18), rgba(2,5,4,0.96) 75%)` }} />
      <Logo cx={vertical ? W / 2 : W * 0.5} cy={vertical ? H * 0.12 : H * 0.14} k={0.34 * u} word={1} opacity={prog(f, 20, 24)} glow={0.5} style={{}} />
      <div style={{ position: 'absolute', left: vertical ? W / 2 - logoW / 2 : W * 0.3 - logoW / 2, top: vertical ? H * 0.27 : H * 0.5 - logoH / 2 - 24 * u, width: logoW, padding: `${28 * u}px ${32 * u}px`, background: '#FFFFFF', borderRadius: 36 * u, boxShadow: `0 0 ${60 * u}px rgba(137,246,42,0.28), 0 ${30 * u}px ${60 * u}px rgba(0,0,0,0.6)`, opacity: p, transform: `scale(${0.94 + 0.06 * p})` }}>
        <Img src={staticFile('brand/unapec-logo.png')} style={{ width: '100%', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', left: vertical ? 0 : W * 0.5, width: vertical ? W : W * 0.44, top: vertical ? H * 0.27 + logoH + 120 * u : H * 0.5 - 170 * u, display: 'flex', flexDirection: 'column', alignItems: vertical ? 'center' : 'flex-start', gap: 14 * u, padding: vertical ? `0 ${40 * u}px` : 0 }}>
        {line('PROYECTO ACADÉMICO', (vertical ? 46 : 40) * u, 14, C.primary, 700, true)}
        {line('Bases de Datos 1 — INF-164', (vertical ? 52 : 50) * u, 24, C.text)}
        {line('Universidad APEC · UNAPEC', (vertical ? 42 : 42) * u, 34, C.text, 500)}
        {line('2024', (vertical ? 44 : 44) * u, 44, C.primary, 700)}
        <div style={{ marginTop: 26 * u }}>{line('NutriFlow v1.5.0 · candidata a lanzamiento', 26 * u, 66, C.muted, 500)}</div>
      </div>
    </AbsoluteFill>
  );
};
