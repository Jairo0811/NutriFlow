import type { UsageSnapshot, UserAccessSnapshot } from './access';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

async function request<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { error?: string; detail?: string; title?: string } | null;
    throw new Error(problem?.error ?? problem?.detail ?? problem?.title ?? 'No fue posible consultar el acceso de NutriFlow.');
  }

  return response.json() as Promise<T>;
}

export const billingApi = {
  getAccess: (accessToken: string) => request<UserAccessSnapshot>('/api/billing/access', accessToken),
  getUsage: (accessToken: string) => request<UsageSnapshot[]>('/api/billing/usage', accessToken),
};
