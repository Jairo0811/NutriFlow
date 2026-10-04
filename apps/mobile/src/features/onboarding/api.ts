const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type BiologicalSex = 'Female' | 'Male';
export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'High';
export type NutritionGoalType = 'LoseFat' | 'MaintainWeight' | 'GainMuscle';
export type FoodPreferenceCode = 'protein' | 'carbohydrates' | 'fats' | 'dairy' | 'fruits';
export type DietaryRestrictionCode = 'gluten' | 'wheat' | 'milk' | 'eggs' | 'fish' | 'shellfish' | 'peanuts' | 'tree_nuts' | 'soy' | 'sesame';

export type NutritionProfile = {
  userId: string;
  dateOfBirth?: string | null;
  biologicalSex?: BiologicalSex | null;
  heightFeet?: number | null;
  heightInches?: number | null;
  currentWeightPounds?: number | null;
  activityLevel?: ActivityLevel | null;
  goalType?: NutritionGoalType | null;
  targetWeightPounds?: number | null;
  foodPreferenceCodes: FoodPreferenceCode[];
  dietaryRestrictionCodes: DietaryRestrictionCode[];
  isCompleted: boolean;
};

async function request<T>(path: string, accessToken: string | undefined, init?: RequestInit): Promise<T> {
  if (!accessToken) throw new Error('Tu sesión no está disponible. Inicia sesión nuevamente.');

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { error?: string; detail?: string; title?: string } | null;
    throw new Error(problem?.error ?? problem?.detail ?? problem?.title ?? 'No fue posible guardar tu perfil nutricional.');
  }

  return response.json() as Promise<T>;
}

export const onboardingApi = {
  get: (accessToken: string | undefined) => request<NutritionProfile>('/api/onboarding/', accessToken),
  savePhysicalProfile: (accessToken: string | undefined, data: { dateOfBirth: string; biologicalSex: BiologicalSex; heightFeet: number; heightInches: number; currentWeightPounds: number }) =>
    request<NutritionProfile>('/api/onboarding/physical-profile', accessToken, { method: 'PUT', body: JSON.stringify(data) }),
  saveActivity: (accessToken: string | undefined, activityLevel: ActivityLevel) =>
    request<NutritionProfile>('/api/onboarding/activity', accessToken, { method: 'PUT', body: JSON.stringify({ activityLevel }) }),
  saveGoal: (accessToken: string | undefined, goalType: NutritionGoalType, targetWeightPounds: number | null) =>
    request<NutritionProfile>('/api/onboarding/goal', accessToken, { method: 'PUT', body: JSON.stringify({ goalType, targetWeightPounds }) }),
  savePreferences: (accessToken: string | undefined, codes: FoodPreferenceCode[]) =>
    request<NutritionProfile>('/api/onboarding/preferences', accessToken, { method: 'PUT', body: JSON.stringify({ codes }) }),
  saveRestrictions: (accessToken: string | undefined, codes: DietaryRestrictionCode[]) =>
    request<NutritionProfile>('/api/onboarding/restrictions', accessToken, { method: 'PUT', body: JSON.stringify({ codes }) }),
  complete: (accessToken: string | undefined) => request<NutritionProfile>('/api/onboarding/complete', accessToken, { method: 'POST' }),
};
