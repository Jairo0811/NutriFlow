# NutriFlow Premium Analytics & Micronutrients

La Fase 14 convierte el historial nutricional en una capa de análisis Premium sin mover lógica de acceso al cliente móvil.

## Entitlements

| Función | Entitlement |
|---|---|
| Analítica 7/30/90 días | `analytics.advanced` |
| Micronutrientes | `nutrition.micronutrients` |

El backend valida ambos permisos mediante `IFeatureGateService`. Mobile no decide si una cuenta es Premium.

## Endpoints

```text
GET /api/analytics/premium?days=7|30|90
GET /api/analytics/micronutrients?days=7|30|90
```

Los endpoints requieren autenticación. Una cuenta sin el entitlement correspondiente recibe `403` con `premium_required`.

## Analítica avanzada

El servicio calcula, para ventanas de 7, 30 o 90 días:

- días con registro;
- porcentaje de consistencia de logging;
- promedio de calorías;
- promedio de proteína, carbohidratos y grasas;
- adherencia calórica cuando existe un perfil nutricional completo;
- tasa de días que alcanzan al menos 90% del objetivo de proteína;
- serie diaria para visualización móvil.

Los días sin registros se conservan dentro de la serie para que las tendencias no oculten huecos de seguimiento.

## Micronutrientes

Food y MealEntry soportan:

- fibra (g);
- sodio (mg);
- potasio (mg);
- calcio (mg);
- hierro (mg);
- vitamina C (mg);
- vitamina D (µg).

Los micronutrientes se copian al `MealEntry` cuando se registra un alimento. Esto mantiene el historial inmutable aunque el alimento del catálogo cambie posteriormente.

La respuesta Premium muestra promedios de los días que tienen registros. No establece diagnósticos ni sustituye una evaluación profesional.

## Persistencia

La migración `AddMicronutrients` añade las columnas necesarias a `Foods` y `MealEntries` con valor inicial `0` para preservar datos existentes.

## Mobile

La pantalla `analytics`:

- permite alternar 7, 30 y 90 días;
- muestra consistencia, calorías y adherencia;
- muestra macros promedio;
- muestra micronutrientes promedio;
- presenta actividad reciente;
- muestra una vista bloqueada Premium cuando el backend devuelve `premium_required`.

Mientras el proveedor de billing no esté conectado, todas las cuentas reales continúan resolviéndose como Free y por tanto verán la vista bloqueada. La funcionalidad queda preparada para activarse automáticamente cuando una cuenta reciba los entitlements Premium desde la futura fuente de verdad de billing.
