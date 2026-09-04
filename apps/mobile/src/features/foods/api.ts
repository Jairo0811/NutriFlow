import type { UsageSnapshot } from '../billing/access';

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
  allergenCodes: string[];
  source: 'System' | 'User' | 'External';
};

export class FoodCatalogApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly usage?: UsageSnapshot,
  ) {
    super(message);
    this.name = 'FoodCatalogApiError';
  }
}

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
    const problem = await response.json().catch(() => null) as {
      error?: string;
      message?: string;
      detail?: string;
      title?: string;
      usage?: UsageSnapshot;
    } | null;

    throw new FoodCatalogApiError(
      problem?.message ?? problem?.detail ?? problem?.title ?? problem?.error ?? 'No fue posible consultar el catálogo.',
      response.status,
      problem?.error,
      problem?.usage,
    );
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
