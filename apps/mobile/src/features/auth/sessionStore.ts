import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from './types';

const sessionKey = 'nutriflow.auth.session';

export async function loadSession(): Promise<AuthSession | null> {
  const stored = await SecureStore.getItemAsync(sessionKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    await clearSession();
    return null;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(sessionKey);
}
