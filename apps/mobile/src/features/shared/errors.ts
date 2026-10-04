export function toUserFacingError(cause: unknown, fallback: string): string {
  const message = cause instanceof Error ? cause.message.trim() : '';
  if (!message) return fallback;

  const normalized = message.toLowerCase();

  if (
    normalized.includes('fetch failed')
    || normalized.includes('failed to fetch')
    || normalized.includes('network request failed')
    || normalized.includes('could not connect to the server')
    || normalized.includes('networkerror')
    || normalized.includes('expomodulescore')
    || normalized.includes('promise.swift')
  ) {
    return 'No pudimos conectar con NutriFlow. Verifica tu conexión e inténtalo nuevamente.';
  }

  if (
    normalized.includes('an error occurred while processing your request')
    || normalized.includes('unexpectedexception')
    || normalized.includes('internal server error')
  ) {
    return fallback;
  }

  if (
    normalized.includes('nutritional profile not found')
    || normalized.includes('nutritional profile is incomplete')
    || normalized.includes('profile is incomplete')
  ) {
    return 'Completa tu perfil nutricional para continuar.';
  }

  if (normalized.includes('weight entry already exists')) {
    return 'Ya registraste tu peso para esta fecha.';
  }

  if (normalized.includes('weight entry was not found')) {
    return 'Ese registro de peso ya no está disponible.';
  }

  if (normalized.includes('food was not found')) {
    return 'El alimento seleccionado ya no está disponible.';
  }

  if (normalized.includes('meal was not found')) {
    return 'La comida seleccionada ya no está disponible.';
  }

  return message;
}
