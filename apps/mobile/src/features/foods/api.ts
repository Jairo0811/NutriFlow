const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

export type Food = {
  id: string;
  name: string;
  brand?: string | null;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  barcode?: string | null;
  source: 'System' | 'User' | 'External';
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
    throw new Error(problem?.error ?? problem?.detail ?? problem?.title ?? 'No fue posible consultar el catálogo.');
  }

  return response.json() as Promise<T>;
}

export const foodCatalogApi = {
  search: (accessToken: string, query: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    params.set('take', '50');
    return request<Food[]>(`/api/foods/?${params.toString()}`, accessToken);
  },
  getByBarcode: (accessToken: string, barcode: string) =>
    request<Food>(`/api/foods/barcode/${encodeURIComponent(barcode)}`, accessToken),
};
