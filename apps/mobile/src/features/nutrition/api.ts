const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type NutritionTargets = {
  restingEnergyCalories: number;
  totalDailyEnergyCalories: number;
  targetCalories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  formulaVersion: string;
};

export async function getNutritionTargets(accessToken: string): Promise<NutritionTargets> {
  const response = await fetch(`${apiUrl}/api/nutrition/targets`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { error?: string; detail?: string } | null;
    throw new Error(problem?.error ?? problem?.detail ?? 'No fue posible calcular tus objetivos nutricionales.');
  }

  return response.json() as Promise<NutritionTargets>;
}
