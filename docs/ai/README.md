# NutriFlow AI — Fase 15

NutriFlow AI introduce asistencia inteligente sobre el producto existente sin convertir al modelo en fuente de verdad del dominio.

## Capacidades

### AI Coach

- disponible para cuentas Free y Premium;
- reutiliza `ai.requests.monthly`: 5 solicitudes/mes para Free y 100/mes para Premium;
- recibe como contexto el consumo del día, objetivos calculados, preferencias y restricciones alimentarias;
- no escribe directamente en comidas, perfiles ni objetivos;
- ofrece orientación general y no sustituye atención médica o nutricional profesional.

### Meal Photo AI

- protegido por `ai.meal-photo`;
- Mobile toma una fotografía mediante Expo Camera y envía una versión JPEG base64 comprimida al backend;
- el proveedor devuelve alimentos y porciones mediante Structured Outputs;
- NutriFlow intenta resolver cada elemento contra el catálogo interno;
- elementos no encontrados quedan como propuestas no registrables;
- ninguna comida se registra automáticamente.

### Voice Logging

- protegido por `ai.voice-logging`;
- en esta fase Mobile utiliza el dictado del teclado del sistema para producir un transcript, evitando añadir un segundo stack nativo de audio;
- el transcript se convierte en propuestas estructuradas de alimentos y porciones;
- el flujo de confirmación es el mismo que Meal Photo AI.

## Safety boundary

La IA no puede desactivar ni sobreescribir restricciones dietarias.

Antes de confirmar una comida asistida por IA, el backend vuelve a cargar cada `Food` desde PostgreSQL y cruza `Food.AllergenCodes` contra `NutritionProfile.DietaryRestrictionCodes`. Si existe conflicto, `/api/ai/confirm-meal` rechaza el registro con `dietary_conflict`.

Esta verificación ocurre aunque el proveedor no haya detectado el conflicto. Las advertencias de seguridad nunca dependen exclusivamente de la respuesta del modelo.

## API

```text
GET  /api/ai/status
POST /api/ai/coach
POST /api/ai/meal-photo
POST /api/ai/voice-log
POST /api/ai/confirm-meal
```

Errores relevantes:

- `ai_provider_unavailable` — falta configuración del proveedor;
- `ai_provider_error` — error externo durante generación;
- `usage_limit_reached` — cuota mensual agotada;
- `premium_required` — capability Premium no disponible;
- `dietary_conflict` — confirmación bloqueada por restricciones guardadas.

## Provider architecture

`INutritionAiProvider` pertenece a Application. La implementación actual `OpenAiNutritionProvider` vive en Infrastructure y usa la Responses API por HTTP, por lo que Application no depende del SDK ni de tipos del proveedor.

Configuración server-side:

```text
OpenAI__ApiKey
OpenAI__Model=gpt-5.4
OpenAI__BaseUrl=https://api.openai.com/v1
```

La API key nunca debe utilizar el prefijo `EXPO_PUBLIC_` ni almacenarse en Mobile.

Las llamadas establecen `store=false`. Para detección de alimentos se solicita salida JSON Schema estricta y se limita la cantidad de elementos devueltos.

## Privacy and operational notes

- solo se envía al proveedor el contenido necesario para la solicitud y el contexto nutricional pertinente;
- las imágenes se procesan para análisis y no se persisten en NutriFlow en esta fase;
- los resultados generados no se persisten como historial de chat;
- una solicitud se contabiliza al iniciar una operación AI válida con proveedor configurado;
- fallos posteriores del proveedor pueden haber consumido una unidad de cuota, preservando el límite atómico ante concurrencia;
- `GET /api/ai/status` permite a Mobile mostrar configuración, capability gates y cuota restante sin invocar el modelo.

## Fuera de alcance

- memoria conversacional persistente;
- diagnóstico o tratamiento médico;
- ajuste automático de calorías/macros por decisión del modelo;
- transcripción de audio nativa dentro de la app;
- creación automática de alimentos desconocidos;
- registro automático sin confirmación del usuario.
