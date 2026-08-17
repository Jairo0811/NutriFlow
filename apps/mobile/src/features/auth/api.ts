import type {
  AuthCredentials,
  AuthSession,
  ForgotPasswordResponse,
  RegistrationData,
} from './types';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
    throw new Error(problem?.detail ?? problem?.title ?? 'No fue posible completar la solicitud.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  register: (data: RegistrationData) => request<AuthSession>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: AuthCredentials) => request<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  refresh: (refreshToken: string) => request<AuthSession>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }),

  logout: (refreshToken: string) => request<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }),

  forgotPassword: (email: string) => request<ForgotPasswordResponse>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (token: string, newPassword: string) => request<void>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),

  google: (idToken: string) => request<AuthSession>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  }),
};
