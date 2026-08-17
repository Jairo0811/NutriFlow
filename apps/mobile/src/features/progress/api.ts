const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type WeightEntry = {
  id: string;
  date: string;
  weightPounds: number;
  note?: string | null;
};

export type ProgressSummary = {
  startingWeightPounds?: number | null;
  currentWeightPounds?: number | null;
  targetWeightPounds?: number | null;
  changePounds?: number | null;
  entries: WeightEntry[];
};

async function request<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { error?: string; detail?: string } | null;
    throw new Error(problem?.error ?? problem?.detail ?? 'No fue posible actualizar tu progreso.');
  }

  return response.json() as Promise<T>;
}

export const progressApi = {
  get: (accessToken: string) => request<ProgressSummary>('/api/progress/', accessToken),
  logWeight: (accessToken: string, date: string, weightPounds: number, note?: string) =>
    request<ProgressSummary>('/api/progress/weight', accessToken, {
      method: 'POST',
      body: JSON.stringify({ date, weightPounds, note: note?.trim() || null }),
    }),
  removeWeight: (accessToken: string, date: string) =>
    request<ProgressSummary>(`/api/progress/weight/${encodeURIComponent(date)}`, accessToken, { method: 'DELETE' }),
};
