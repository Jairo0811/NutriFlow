# Nutritional Onboarding — Phase 2

## Purpose

Phase 2 turns the nutritional onboarding represented in the 2024 academic Figma prototype into a persistent, authenticated mobile flow.

The prototype remains a conceptual and visual reference. The current implementation is new software and does not imply that these capabilities existed in the 2024 academic delivery.

## Units policy

NutriFlow presents body measurements using the imperial system:

- height: feet (`ft`) and inches (`in`);
- current weight: pounds (`lb`);
- target weight: pounds (`lb`).

Height is stored canonically as total inches. Any metric conversion required by metabolic formulas must be contained inside the future Nutrition Engine and must not leak into the mobile UX or onboarding API contract.

## Flow

1. Physical and demographic data.
2. Activity level.
3. Nutrition goal and target weight when applicable.
4. Food preferences.
5. Dietary restrictions.

Each step is persisted incrementally so the server owns the canonical profile state.

## Domain boundary

`NutritionProfile` is independent from `User` identity. Identity answers who the authenticated account is; the nutritional profile contains the data required for personalization and future nutrition calculations.

The current profile captures:

- date of birth;
- biological sex used for metabolic calculation;
- height in total inches;
- current weight in pounds;
- activity level;
- goal type;
- target weight in pounds;
- food preference codes;
- dietary restriction codes;
- onboarding completion state.

## Figma mapping

The implementation is informed by these original concepts:

- `Actividad física`: physical data and four activity levels;
- `Objetivo`: lose fat, maintain weight, gain muscle;
- `Alimentos`: proteins, carbohydrates, fats, beverages/dairy and fruits;
- `Alergias y preferencias`: gluten and shellfish exclusions.

The mobile UI modernizes hierarchy, spacing, accessibility and interaction while preserving the intent of those prototype screens.

## Deferred behavior

Phase 2 stores preference and restriction data only. Ingredient-level allergen matching, incompatibility warnings and food recommendation filtering belong to later phases after a structured food catalog exists.
