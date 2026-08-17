# Arquitectura de NutriFlow

NutriFlow se organiza como un monorepo con dos aplicaciones principales: una app móvil en React Native/Expo y una API ASP.NET Core.

## Principios

- Clean Architecture en backend.
- Arquitectura modular por features en mobile.
- Separación estricta de responsabilidades.
- SOLID, DRY y KISS.
- Configuración sensible mediante variables de entorno.
- Integración continua desde el inicio.

## Backend

```text
NutriFlow.Api
  -> NutriFlow.Application
  -> NutriFlow.Infrastructure

NutriFlow.Application
  -> NutriFlow.Domain

NutriFlow.Infrastructure
  -> NutriFlow.Application
```

### Responsabilidades

- `NutriFlow.Domain`: entidades, value objects y reglas de dominio puras.
- `NutriFlow.Application`: casos de uso, contratos y orquestación de negocio.
- `NutriFlow.Infrastructure`: persistencia, integraciones externas y servicios técnicos.
- `NutriFlow.Api`: composición, endpoints HTTP, middleware y configuración.

## Mobile

La app utilizará Expo Router y crecerá por features: autenticación, onboarding, alimentos, comidas, scanner, dashboard, progreso, preferencias y reportes.

## Persistencia

PostgreSQL será la base de datos principal. La integración con EF Core y Npgsql se incorporará en la fase de persistencia, evitando acoplar el dominio al ORM.

## Roadmap arquitectónico

1. Foundation
2. Authentication & Identity
3. Nutritional Onboarding
4. Nutrition Engine
5. Food Catalog
6. Meal Tracking
7. Dashboard
8. Barcode Scanner
9. Progress
10. Allergies & Preferences
11. Production Readiness
