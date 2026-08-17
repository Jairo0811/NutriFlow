# Nutrition Engine

## Purpose

Phase 3 converts a completed `NutritionProfile` into deterministic daily energy and macronutrient targets.

## Input contract

The product continues to expose imperial units to the user:

- height: feet + inches;
- weight: pounds.

Metric conversion is internal to `NutritionEngine` because the Mifflin-St Jeor equation uses kilograms and centimeters.

## Calculation pipeline

1. Validate that onboarding is complete.
2. Restrict the current engine to adults 18+.
3. Convert pounds to kilograms and inches to centimeters internally.
4. Estimate resting energy using Mifflin-St Jeor.
5. Apply the configured activity multiplier to estimate total daily energy expenditure.
6. Apply the goal multiplier.
7. Split target calories into protein, carbohydrate and fat grams.
8. Return a versioned result using `mifflin-st-jeor-v1`.

## Product coefficients

Activity multipliers and goal/macro presets are centralized inside the engine so future versions can replace them without leaking calculation rules into API or mobile layers.

The current goal multipliers are deliberately conservative product defaults: 90% of estimated TDEE for fat loss, 100% for maintenance, and 110% for muscle gain. Macro percentages are also product defaults and are not intended to represent individualized clinical nutrition prescriptions.

## Safety boundary

NutriFlow surfaces these values as estimates, not medical advice. The engine rejects minors in this version and the mobile screen explicitly states that estimates do not replace professional nutritional evaluation.

Future versions should support configurable clinical rules, pregnancy/medical exclusions, recalculation history, and dietitian-reviewed presets before broader production use.
