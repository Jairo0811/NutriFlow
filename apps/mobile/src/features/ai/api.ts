const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type UsageSnapshot = {
  code: string;
  limit?: number | null;
  used: number;
  remaining?: number | null;
  isUnlimited: boolean;
  periodStartUtc?: string | null;
  periodEndUtc?: string | null;
};

export type AiStatus = {
  providerConfigured: boolean;
  provider: string;
  mealPhotoEnabled: boolean;
  voiceLoggingEnabled: boolean;
  aiUsage?: UsageSnapshot | null;
};

export type AiCoachResult = {
  answer: string;
  provider: string;
  usage: UsageSnapshot;
};

export type AiFoodProposal = {
  foodId?: string | null;
  detectedName: string;
  catalogName?: string | null;
  servings: number;
  confidence: number;
  hasCatalogMatch: boolean;
  hasDietaryConflict: boolean;
  conflictingRestrictionCodes: string[];
};

export type AiMealAnalysis = {
  source: 'meal-photo' | 'voice';
  provider: string;
  items: AiFoodProposal[];
  usage: UsageSnapshot;
};

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export class AiApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly entitlement?: string,
    public readonly usage?: UsageSnapshot,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as {
      error?: string;
      message?: string;
      detail?: string;
      title?: string;
      entitlement?: string;
      usage?: UsageSnapshot;
    } | null;

    throw new AiApiError(
      problem?.message ?? problem?.detail ?? problem?.title ?? 'NutriFlow AI no pudo completar la solicitud.',
      response.status,
      problem?.error,
      problem?.entitlement,
      problem?.usage,
    );
  }

  return response.json() as Promise<T>;
}

export const aiApi = {
  getStatus: (accessToken: string) => request<AiStatus>('/api/ai/status', accessToken),

  askCoach: (accessToken: string, message: string, date?: string) =>
    request<AiCoachResult>('/api/ai/coach', accessToken, {
      method: 'POST',
      body: JSON.stringify({ message, date }),
    }),

  analyzeMealPhoto: (accessToken: string, imageDataUrl: string, date?: string) =>
    request<AiMealAnalysis>('/api/ai/meal-photo', accessToken, {
      method: 'POST',
      body: JSON.stringify({ imageDataUrl, date }),
    }),

  parseVoiceLog: (accessToken: string, transcript: string, date?: string) =>
    request<AiMealAnalysis>('/api/ai/voice-log', accessToken, {
      method: 'POST',
      body: JSON.stringify({ transcript, date }),
    }),

  confirmMeal: (
    accessToken: string,
    mealType: MealType,
    items: Array<{ foodId: string; servings: number }>,
    date: string,
  ) => request<unknown>('/api/ai/confirm-meal', accessToken, {
    method: 'POST',
    body: JSON.stringify({ date, mealType, items }),
  }),
};
