export type SubscriptionPlan = 'Free' | 'Premium';

export type UserAccessSnapshot = {
  plan: SubscriptionPlan;
  displayName: string;
  entitlements: string[];
  usageLimits: Record<string, number>;
};

export const entitlementCodes = {
  barcodeUnlimited: 'barcode.unlimited',
  historyUnlimited: 'history.unlimited',
  analyticsAdvanced: 'analytics.advanced',
  nutritionMicronutrients: 'nutrition.micronutrients',
  aiCoach: 'ai.coach',
  mealPhotoAnalysis: 'ai.meal-photo',
  voiceLogging: 'ai.voice-logging',
  mealPlanner: 'meal-planner',
  shoppingList: 'shopping-list',
  dataExport: 'data-export',
  fasting: 'fasting',
  healthAdvanced: 'health.advanced',
} as const;

export function hasEntitlement(access: UserAccessSnapshot | null | undefined, entitlement: string): boolean {
  return access?.entitlements.includes(entitlement) ?? false;
}

export function getUsageLimit(access: UserAccessSnapshot | null | undefined, key: string): number | null {
  const value = access?.usageLimits[key];
  return typeof value === 'number' ? value : null;
}
