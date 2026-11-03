/**
 * Sistema de diseño de NutriFlow.
 * Cualquier color, espaciado o tamaño de texto debe salir de aquí.
 */
export const colors = {
  background: '#07110B',
  surface: '#101C14',
  surfaceRaised: '#132718',
  primary: '#62E62C',
  onPrimary: '#07110B',

  text: '#F6FAF7',
  textSoft: '#DDE5DF',
  textSecondary: '#95A59B',
  textMuted: '#7E8E84',
  placeholder: '#637268',

  border: '#223228',
  borderInput: '#25372B',
  borderAccent: '#31533A',
  borderButton: '#36503E',

  danger: '#FF8E8E',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 12, md: 14, lg: 18, xl: 24, pill: 999 } as const;

export const typography = {
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  heading: { color: colors.text, fontSize: 21, fontWeight: '800' },
  body: { color: colors.textSecondary, fontSize: 15, lineHeight: 23 },
  label: { color: colors.textSoft, fontSize: 14, fontWeight: '600' },
  caption: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
} as const;

/** Tamaño mínimo recomendado para elementos tocables. */
export const minTouchSize = 48;
