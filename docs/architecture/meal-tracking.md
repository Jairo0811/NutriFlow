# Phase 5 — Meal Tracking

## Objetivo

Meal Tracking convierte el catálogo de alimentos de la Fase 4 en un diario nutricional real. El usuario puede registrar alimentos por fecha y tipo de comida, modificar la cantidad de porciones y eliminar registros sin depender de que el alimento original conserve para siempre los mismos valores nutricionales.

## Modelo de dominio

`Meal` es el agregado raíz para una combinación de usuario, fecha y tipo de comida. Los tipos iniciales son `Breakfast`, `Lunch`, `Dinner` y `Snack`.

Cada `MealEntry` captura un snapshot del alimento al momento del registro:

- `FoodId` como referencia al catálogo;
- nombre y marca;
- tamaño y unidad de porción;
- calorías por porción;
- proteína, carbohidratos y grasas por porción;
- número de porciones consumidas.

Los totales se derivan del snapshot y de la cantidad de porciones. De esta forma, una modificación posterior del catálogo no reescribe el historial nutricional del usuario.

## Persistencia

PostgreSQL incorpora las tablas `Meals` y `MealEntries`.

`Meals` mantiene un índice único por `(UserId, Date, Type)` para impedir duplicar el mismo bloque diario. `MealEntries` usa `FoodId` con borrado restringido; el catálogo desactiva alimentos en lugar de eliminarlos, preservando la trazabilidad histórica.

## API

- `GET /api/meals/?date=YYYY-MM-DD`
- `POST /api/meals/entries`
- `PUT /api/meals/entries/{entryId}`
- `DELETE /api/meals/entries/{entryId}?date=YYYY-MM-DD&mealType=Breakfast`

Todos los endpoints requieren JWT y operan exclusivamente sobre el usuario autenticado.

## Mobile

La pantalla `/(app)/meals` permite:

- consultar el consumo del día;
- visualizar calorías y macros acumulados;
- seleccionar desayuno, almuerzo, cena o snack;
- buscar alimentos en el Food Catalog con debounce;
- indicar el número de porciones;
- agregar y eliminar entradas;
- visualizar cada comida agrupada con sus subtotales.

## Límites de la fase

La Fase 5 no implementa todavía comparación contra objetivos diarios, gráficos ni progreso histórico. La comparación objetivo-versus-consumo corresponde al Dashboard de la Fase 6.

El escaneo de código de barras permanece reservado para la Fase 7 y utilizará el mismo `FoodId` y el mismo servicio de Meal Tracking, evitando duplicar lógica de registro.
