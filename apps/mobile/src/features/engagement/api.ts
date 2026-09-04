const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type WaterEntry = {
  id: string;
  date: string;
  amountOunces: number;
  createdAtUtc: string;
};

export type WaterSummary = {
  date: string;
  targetOunces: number;
  consumedOunces: number;
  remainingOunces: number;
  percentComplete: number;
  entries: WaterEntry[];
};

export type FavoriteFood = {
  foodId: string;
  name: string;
  brand?: string | null;
  category: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  favoritedAtUtc: string;
};

export type RecipeIngredient = {
  foodId: string;
  foodName: string;
  brand?: string | null;
  servings: number;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
};

export type Recipe = {
  id: string;
  name: string;
  servings: number;
  instructions?: string | null;
  caloriesPerServing: number;
  proteinGramsPerServing: number;
  carbohydrateGramsPerServing: number;
  fatGramsPerServing: number;
  ingredients: RecipeIngredient[];
  createdAtUtc: string;
};

export type EngagementOverview = {
  water: WaterSummary;
  currentStreakDays: number;
  longestStreakDays: number;
  favoriteFoods: number;
  recipes: number;
};

export type CreateRecipeInput = {
  name: string;
  servings: number;
  instructions?: string | null;
  ingredients: Array<{ foodId: string; servings: number }>;
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
    throw new Error(problem?.error ?? problem?.detail ?? problem?.title ?? 'No fue posible actualizar tus hábitos.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const engagementApi = {
  getOverview: (accessToken: string) => request<EngagementOverview>('/api/engagement/overview', accessToken),
  getWater: (accessToken: string) => request<WaterSummary>('/api/engagement/water', accessToken),
  addWater: (accessToken: string, amountOunces: number) => request<WaterSummary>('/api/engagement/water', accessToken, {
    method: 'POST',
    body: JSON.stringify({ amountOunces }),
  }),
  removeWater: (accessToken: string, entryId: string) => request<WaterSummary>(`/api/engagement/water/${entryId}`, accessToken, { method: 'DELETE' }),
  getFavorites: (accessToken: string) => request<FavoriteFood[]>('/api/engagement/favorites', accessToken),
  addFavorite: (accessToken: string, foodId: string) => request<FavoriteFood[]>(`/api/engagement/favorites/${foodId}`, accessToken, { method: 'POST' }),
  removeFavorite: (accessToken: string, foodId: string) => request<FavoriteFood[]>(`/api/engagement/favorites/${foodId}`, accessToken, { method: 'DELETE' }),
  getRecipes: (accessToken: string) => request<Recipe[]>('/api/engagement/recipes', accessToken),
  createRecipe: (accessToken: string, input: CreateRecipeInput) => request<Recipe>('/api/engagement/recipes', accessToken, {
    method: 'POST',
    body: JSON.stringify(input),
  }),
  removeRecipe: (accessToken: string, recipeId: string) => request<void>(`/api/engagement/recipes/${recipeId}`, accessToken, { method: 'DELETE' }),
};
