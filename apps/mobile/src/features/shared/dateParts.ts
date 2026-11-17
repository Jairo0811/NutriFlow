export type DateParts = { day: string; month: string; year: string };

/** Convierte tres casillas del calendario en una fecha ISO o cadena vacía. */
export function composeDateParts({ day, month, year }: DateParts): string {
  if (year.length !== 4 || !day || !month) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function digitsOnly(text: string, max: number): string {
  return text.replace(/\D/g, '').slice(0, max);
}
