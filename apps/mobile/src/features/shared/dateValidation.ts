const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** true si `iso` (AAAA-MM-DD) es una fecha real, posterior a 1900 y anterior a hoy. */
export function isValidPastDate(iso: string, now: Date = new Date()): boolean {
  const match = ISO_DATE.exec(iso);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    && year >= 1900
    && date < now;
}
