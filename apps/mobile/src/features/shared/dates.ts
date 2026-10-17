import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Fecha local del dispositivo en formato AAAA-MM-DD (no UTC). */
export function localDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Ej.: "sábado, 17 de octubre". */
export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const text = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(year, month - 1, day));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function msUntilNextMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

/**
 * Devuelve la fecha local de hoy y se actualiza sola al pasar la medianoche
 * o al volver la app a primer plano.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => localDate());

  useEffect(() => {
    const refresh = () => setToday(localDate());
    const timer = setTimeout(refresh, msUntilNextMidnight());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [today]);

  return today;
}
