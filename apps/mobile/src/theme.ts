/**
 * Sistema de diseño de NutriFlow.
 * Cualquier color, espaciado o tamaño de texto debe salir de aquí.
 */
export const colors = {
  background: '#040907',
  surface: '#101C14',
  surfaceRaised: '#132718',
  primary: '#89F62A',
  primaryBorder: '#B7FF6C',
  onPrimary: '#07110B',

  text: '#F6FAF7',
  textSoft: '#DDE5DF',
  textSecondary: '#95A59B',
  textMuted: '#7E8E84',
  placeholder: '#95A59B',

  border: '#223228',
  borderInput: '#25372B',
  borderAccent: '#31533A',
  borderButton: '#36503E',

  danger: '#FF8E8E',
  dangerText: '#FF9A9A',
  dangerLight: '#FFB1B1',
  dangerPale: '#FFD4D4',
  dangerSurface: '#2A1818',
  warning: '#FFCC80',
  surfaceDeep: '#0B160F',
  successSurface: '#17331D',
  dividerSubtle: '#18251D',
  borderSoft: '#2A3C30',

  // Identidad neón (login aprobado)
  white: '#FFFFFF',
  buttonDeep: '#09130C',
  fieldSurface: '#151D1A',
  fieldBorder: '#5B7062', // ≥ 3:1 contra fondo y campo (WCAG 1.4.11)
  chipSurface: '#142119',
  chipBorder: '#1D3924',
  dividerNeon: '#415047',
  glowPrimary: '#0E3015',
  glowSecondary: '#0B2D14',
  orbit: '#193A20',
  leaf: '#214927',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 12, md: 14, lg: 18, field: 22, xl: 24, pill: 999 } as const;

export const typography = {
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  heading: { color: colors.text, fontSize: 21, fontWeight: '800' },
  body: { color: colors.textSecondary, fontSize: 15, lineHeight: 23 },
  label: { color: colors.textSoft, fontSize: 14, fontWeight: '600' },
  caption: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
} as const;

/** Brillo neón reutilizable para botones principales. */
export const neonGlow = {
  elevation: 3,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 12,
} as const;

/** Tamaño mínimo recomendado para elementos tocables. */
export const minTouchSize = 48;
