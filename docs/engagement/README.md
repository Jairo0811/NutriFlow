# Fase 13 — Engagement & Retention

La Fase 13 introduce mecanismos de uso recurrente sin depender todavía de pagos, anuncios ni notificaciones push.

## Objetivos

- aumentar la frecuencia de uso diario;
- reducir fricción al repetir alimentos habituales;
- permitir recetas reutilizables;
- reforzar consistencia mediante hidratación y streaks;
- mantener la lógica de retención separada de Nutrition, Identity y Billing.

## Capacidades

### Hidratación

- registro diario en onzas;
- objetivo inicial de 64 oz/día;
- accesos rápidos de 8, 16 y 24 oz en Mobile;
- progreso diario y eliminación de registros.

El objetivo queda centralizado en `EngagementService.DefaultWaterTargetOunces` para que una fase posterior pueda hacerlo configurable por usuario.

### Favoritos

Los alimentos del catálogo pueden guardarse como favoritos por usuario. Los favoritos sirven como acceso rápido y como fuente para construir recetas desde Mobile.

La relación usa una clave compuesta `(UserId, FoodId)` para impedir duplicados a nivel de datos.

### Recetas

Una receta guarda snapshots nutricionales de sus ingredientes en el momento de creación. Esto evita que una modificación posterior del catálogo cambie silenciosamente el histórico nutricional de una receta ya creada.

Cada receta soporta:

- nombre;
- número de porciones;
- instrucciones opcionales;
- 1–20 ingredientes;
- cálculo de calorías y macros por porción.

### Streaks

La racha de Engagement se basa en actividad nutricional real. Un día cuenta como activo cuando el usuario registra al menos una de estas acciones:

- agua;
- comida;
- peso.

La racha actual puede continuar desde hoy o desde ayer, evitando romperla antes de que el usuario tenga oportunidad de registrar actividad durante el día actual.

Se calculan:

- `CurrentStreakDays`;
- `LongestStreakDays`.

La ventana inicial de análisis es de 365 días.

## API

```text
GET    /api/engagement/overview
GET    /api/engagement/water
POST   /api/engagement/water
DELETE /api/engagement/water/{entryId}

GET    /api/engagement/favorites
POST   /api/engagement/favorites/{foodId}
DELETE /api/engagement/favorites/{foodId}

GET    /api/engagement/recipes
GET    /api/engagement/recipes/{recipeId}
POST   /api/engagement/recipes
DELETE /api/engagement/recipes/{recipeId}
```

Todos los endpoints requieren autenticación.

## Persistencia

La migración `AddEngagement` añade:

- `WaterEntries`;
- `FavoriteFoods`;
- `Recipes`;
- `RecipeIngredients`.

## Mobile

La pantalla `Engagement Hub` centraliza:

- hidratación diaria;
- racha actual y récord;
- favoritos;
- creación rápida de recetas a partir de favoritos;
- listado y eliminación de recetas.

El catálogo de alimentos incorpora acciones para guardar o quitar favoritos.

## Fuera de alcance de esta fase

Se dejan para iteraciones posteriores:

- push notifications y recordatorios programados;
- objetivo de agua configurable;
- recetas compartidas/comunitarias;
- imágenes de recetas;
- meal prep y grocery list;
- badges y niveles de gamificación;
- sincronización de hábitos con Apple Health / Health Connect.

Estas capacidades podrán construirse encima del módulo `Engagement` sin modificar Identity ni Billing.
