const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type FoodCompatibility = {
  foodId: string;
  hasConflict: boolean;
  conflictingRestrictionCodes: string[];
};

export async function checkFoodCompatibility(accessToken: string, foodId: string): Promise<FoodCompatibility> {
  const response = await fetch(`${apiUrl}/api/preferences/foods/${encodeURIComponent(foodId)}/compatibility`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('No fue posible validar las restricciones del alimento.');
  return response.json() as Promise<FoodCompatibility>;
}
