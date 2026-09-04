const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type DailyNutritionPoint = {
  date: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
};

export type AdvancedAnalytics = {
  periodDays: number;
  startDate: string;
  endDate: string;
  loggedDays: number;
  loggingRatePercent: number;
  averageCalories: number;
  averageProteinGrams: number;
  averageCarbohydrateGrams: number;
  averageFatGrams: number;
  targetCalories?: number | null;
  calorieAdherencePercent?: number | null;
  proteinTargetHitRatePercent?: number | null;
  daily: DailyNutritionPoint[];
};

export type MicronutrientAnalytics = {
  periodDays: number;
  startDate: string;
  endDate: string;
  loggedDays: number;
  averageFiberGrams: number;
  averageSodiumMilligrams: number;
  averagePotassiumMilligrams: number;
  averageCalciumMilligrams: number;
  averageIronMilligrams: number;
  averageVitaminCMilligrams: number;
  averageVitaminDMicrograms: number;
};

export class AnalyticsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly entitlement?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as {
      error?: string;
      message?: string;
      detail?: string;
      title?: string;
      entitlement?: string;
    } | null;

    throw new AnalyticsApiError(
      problem?.message ?? problem?.detail ?? problem?.title ?? 'No fue posible cargar la analítica.',
      response.status,
      problem?.error,
      problem?.entitlement,
    );
  }

  return response.json() as Promise<T>;
}

export const analyticsApi = {
  getAdvanced: (accessToken: string, days: 7 | 30 | 90) =>
    request<AdvancedAnalytics>(`/api/analytics/premium?days=${days}`, accessToken),
  getMicronutrients: (accessToken: string, days: 7 | 30 | 90) =>
    request<MicronutrientAnalytics>(`/api/analytics/micronutrients?days=${days}`, accessToken),
};
