const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type MealEntry = {
  id: string;
  foodId: string;
  foodName: string;
  brand?: string | null;
  servingSize: number;
  servingUnit: string;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
};

export type Meal = {
  id: string;
  date: string;
  type: MealType;
  entries: MealEntry[];
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
};

export type DailyMealSummary = {
  date: string;
  meals: Meal[];
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
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
    const problem = await response.json().catch(() => null) as { error?: string; detail?: string; title?: string } | null;
    throw new Error(problem?.error ?? problem?.detail ?? problem?.title ?? 'No fue posible actualizar tu diario de comidas.');
  }

  return response.json() as Promise<T>;
}

export const mealTrackingApi = {
  getDay: (accessToken: string, date: string) =>
    request<DailyMealSummary>(`/api/meals/?date=${encodeURIComponent(date)}`, accessToken),

  addEntry: (accessToken: string, date: string, mealType: MealType, foodId: string, servings: number) =>
    request<DailyMealSummary>('/api/meals/entries', accessToken, {
      method: 'POST',
      body: JSON.stringify({ date, mealType, foodId, servings }),
    }),

  updateEntry: (accessToken: string, entryId: string, date: string, mealType: MealType, servings: number) =>
    request<DailyMealSummary>(`/api/meals/entries/${entryId}`, accessToken, {
      method: 'PUT',
      body: JSON.stringify({ date, mealType, servings }),
    }),

  removeEntry: (accessToken: string, entryId: string, date: string, mealType: MealType) =>
    request<DailyMealSummary>(
      `/api/meals/entries/${entryId}?date=${encodeURIComponent(date)}&mealType=${mealType}`,
      accessToken,
      { method: 'DELETE' },
    ),
};
