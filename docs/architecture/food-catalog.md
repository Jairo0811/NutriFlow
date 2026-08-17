# Food Catalog — Phase 4

## Purpose

Phase 4 introduces the structured food catalog that will become the source of truth for meal logging, barcode lookup, dashboard aggregation and later recommendation features.

The catalog is deliberately separated from the nutrition target engine. A `Food` describes nutritional data for one serving; it does not contain user-specific goals or consumption state.

## Domain model

`Food` contains:

- stable `Id`;
- `Name` and optional `Brand`;
- normalized `Category`;
- `ServingSize` and `ServingUnit`;
- calories;
- protein, carbohydrate and fat grams;
- optional barcode;
- source (`System`, `User`, `External`);
- active/inactive state and audit timestamps.

Domain validation prevents empty names, invalid serving sizes, negative energy values and negative macronutrients.

## Persistence

PostgreSQL stores foods in `Foods` with indexes for:

- name;
- category;
- unique barcode when present.

Search uses PostgreSQL `ILIKE` for case-insensitive matching on name and brand, with exact barcode matching. Results are bounded to a maximum of 100 records per request.

## API

Authenticated endpoints:

- `GET /api/foods/?q=&category=&take=` — search/list;
- `GET /api/foods/{id}` — retrieve one food;
- `GET /api/foods/barcode/{barcode}` — barcode lookup;
- `POST /api/foods/` — create a custom food.

Custom foods are marked with `FoodSource.User`. External provider ingestion is intentionally not coupled to the domain or API contract in this phase.

## Mobile

The React Native application provides a searchable food catalog screen with:

- debounced search;
- serving information;
- calories;
- protein, carbohydrate and fat values;
- category display;
- explicit empty/loading/error states.

## Architectural boundary

Phase 4 does **not** implement meal logging. That belongs to Phase 5. It also does not bind NutriFlow to a third-party food database. A future external provider can implement an ingestion/synchronization boundary while keeping `Food` and the application contracts stable.

This separation keeps the catalog reusable by meal tracking, barcode scanning and recommendation modules without duplicating nutrition data.
