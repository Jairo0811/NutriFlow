const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type MacroProgress = {
  target: number;
  consumed: number;
  remaining: number;
  progressPercent: number;
};

export type DashboardMeal = {
  id: string;
  date: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
};

export type DailyDashboard = {
  date: string;
  targetCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  calorieProgressPercent: number;
  protein: MacroProgress;
  carbohydrates: MacroProgress;
  fat: MacroProgress;
  meals: DashboardMeal[];
};

export async function getDailyDashboard(accessToken: string, date: string): Promise<DailyDashboard> {
  const response = await fetch(`${apiUrl}/api/dashboard/?date=${encodeURIComponent(date)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { error?: string; detail?: string } | null;
    throw new Error(problem?.error ?? problem?.detail ?? 'No fue posible cargar el dashboard.');
  }

  return response.json() as Promise<DailyDashboard>;
}
