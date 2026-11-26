// Paleta del tráiler: idéntica a src/theme.ts de la app (fondo #040907, primario #89F62A).
export const C = {
  bg: '#040907',
  bgDeep: '#020504',
  surface: '#151D1A',
  primary: '#89F62A',
  primaryBorder: '#B7FF6C',
  leaf: '#38C42B',
  text: '#F4F8F2',
  muted: '#9DB1A2',
  line: '#5B7062',
};
export const FPS = 30;
export const DURATION = 45 * FPS; // 1350 fotogramas
// Escenas (segundos): 5, 5, 7, 7, 7, 7, 7  (la última incluye la tarjeta institucional)
export const SCENES = [
  { name: 'decision', from: 0, to: 5 },
  { name: 'presentacion', from: 5, to: 10 },
  { name: 'nutricion', from: 10, to: 17 },
  { name: 'registro', from: 17, to: 24 },
  { name: 'progreso', from: 24, to: 31 },
  { name: 'ia', from: 31, to: 38 },
  { name: 'final', from: 38, to: 45 },
] as const;
