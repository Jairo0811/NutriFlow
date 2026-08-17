# NutriFlow — Fases 6 a 10

Este documento describe el cierre del roadmap técnico inicial de NutriFlow. Las fases se implementan sobre el núcleo ya integrado: autenticación, onboarding nutricional, motor de objetivos, catálogo de alimentos y registro de comidas.

## Fase 6 — Dashboard

El dashboard agrega objetivos diarios y consumo real en una única lectura. El backend combina `INutritionCalculationService` e `IMealTrackingService` sin duplicar reglas de negocio. El endpoint `GET /api/dashboard/?date=YYYY-MM-DD` devuelve calorías objetivo, consumidas y restantes, progreso de proteína/carbohidratos/grasas y las comidas del día.

## Fase 7 — Barcode Scanner

La aplicación móvil usa `expo-camera` para leer códigos EAN/UPC/Code128 y consulta el catálogo mediante `GET /api/foods/barcode/{barcode}`. El escáner no crea alimentos de forma implícita: un código desconocido se reporta como no encontrado para preservar la calidad del catálogo.

## Fase 8 — Progress

`WeightEntry` registra el peso histórico en libras. PostgreSQL impone unicidad por usuario y fecha. Los endpoints permiten consultar el historial, registrar un peso y eliminar una entrada. La aplicación muestra peso actual, objetivo, cambio acumulado y una visualización ligera de tendencia sin introducir una dependencia gráfica adicional.

## Fase 9 — Allergies & Preferences

Las restricciones se amplían a gluten, trigo, leche, huevos, pescado, mariscos, maní, frutos secos, soya y sésamo. Los alimentos pueden declarar `AllergenCodes`. `FoodCompatibilityService` compara los alérgenos del alimento con las restricciones del usuario y devuelve conflictos explícitos. El escáner muestra una advertencia cuando existe coincidencia.

Las advertencias de NutriFlow son una ayuda de software y no sustituyen la revisión de etiquetas, indicaciones médicas ni una evaluación clínica.

## Fase 10 — Production Readiness

La API incorpora `ProblemDetails`, manejo global de excepciones, HSTS fuera de Development, cabeceras defensivas, CORS configurable, soporte de forwarded headers y rate limiting para autenticación. Los secretos y orígenes de producción se configuran mediante variables de entorno.

Docker Compose incluye PostgreSQL y la API. La API usa una imagen multi-stage de .NET 10 y health checks. CI valida restore, build, tests, TypeScript, auditoría crítica, `docker compose config` y construcción del contenedor de API.

## Resultado

El roadmap técnico inicial queda cubierto de extremo a extremo:

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

> La numeración histórica del repositorio comienza en Fase 0, por lo que Production Readiness corresponde a la Fase 10.
