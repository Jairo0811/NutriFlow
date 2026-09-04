# Changelog

Todos los cambios relevantes de NutriFlow se documentan en este archivo.

El proyecto utiliza versionado semántico (`MAJOR.MINOR.PATCH`).

## [Unreleased]

### Added

- Fase 11 — Freemium Foundation.
- Modelo de planes `Free` y `Premium` desacoplado de Identity.
- Catálogo centralizado de entitlements Premium.
- Límites de uso iniciales para escáner, IA e historial.
- Endpoint autenticado `GET /api/billing/access` para consultar el acceso efectivo del usuario.
- Contrato TypeScript para consumir planes, entitlements y usage limits desde Mobile.
- Documentación de arquitectura Freemium y roadmap comercial v1.1 → v2.0.
- Pruebas unitarias para la política de acceso Free y el catálogo Premium.
- Fase 12 — Usage Limits & Feature Gates.
- Persistencia PostgreSQL de cuotas mediante `UsageCounters`.
- Incremento atómico de cuotas por usuario, código y período mensual.
- Servicio `IFeatureGateService` para centralizar permisos Premium.
- Servicio `IUsageLimitService` para consultar y consumir cuotas.
- Endpoint autenticado `GET /api/billing/usage` con uso, restante y período actual.
- Manejo móvil específico para `usage_limit_reached` en el escáner.
- Pruebas de límite mensual, reinicio por período, bypass Premium y ventana de historial.
- Fase 13 — Engagement & Retention.
- Registro diario de hidratación en onzas con objetivo inicial de 64 oz.
- Alimentos favoritos persistentes por usuario.
- Recetas personales con snapshots nutricionales y cálculo de macros por porción.
- Racha actual y récord calculados desde actividad real de agua, comidas y peso.
- Endpoints autenticados `/api/engagement/*` para overview, agua, favoritos y recetas.
- `Engagement Hub` móvil con hidratación, streaks, favoritos y constructor rápido de recetas.
- Acciones de favorito integradas en el catálogo de alimentos.
- Pruebas de hidratación, streaks, favoritos idempotentes y nutrición de recetas.
- Documentación dedicada en `docs/engagement`.
- Fase 14 — Premium Analytics & Micronutrients.
- Analítica Premium para ventanas de 7, 30 y 90 días protegida por `analytics.advanced`.
- Métricas de consistencia, calorías, macros, adherencia calórica y cumplimiento del objetivo de proteína.
- Soporte estructurado de fibra, sodio, potasio, calcio, hierro, vitamina C y vitamina D.
- Snapshots de micronutrientes en `MealEntry` para preservar el histórico nutricional.
- Endpoint autenticado `GET /api/analytics/premium`.
- Endpoint autenticado `GET /api/analytics/micronutrients` protegido por `nutrition.micronutrients`.
- Nueva pantalla móvil Premium Analytics con estado bloqueado para cuentas Free.
- Migración `AddMicronutrients` para `Foods` y `MealEntries`.
- Pruebas para feature gates, períodos válidos, adherencia y promedios de micronutrientes.
- Documentación dedicada en `docs/analytics`.
- Fase 15 — NutriFlow AI.
- `AI Coach` contextual con consumo, objetivos, preferencias y restricciones del usuario.
- Cuota real `ai.requests.monthly`: 5 solicitudes Free y 100 Premium.
- `Meal Photo AI` protegido por `ai.meal-photo` con captura Expo Camera, Structured Outputs y resolución contra el catálogo.
- `Voice Logging` protegido por `ai.voice-logging` usando transcript de dictado del sistema y propuestas estructuradas.
- Confirmación explícita antes de registrar cualquier alimento sugerido por IA.
- Revalidación backend de alergias/restricciones antes de confirmar comidas asistidas por IA.
- Abstracción `INutritionAiProvider` y adaptador `OpenAiNutritionProvider` basado en Responses API.
- Endpoints autenticados `/api/ai/status`, `/coach`, `/meal-photo`, `/voice-log` y `/confirm-meal`.
- Nuevo hub móvil NutriFlow AI y flujo dedicado de fotografía de comidas.
- Pruebas para cuota Free, feature gates Premium, mapeo contra catálogo y bloqueo de conflictos dietarios.
- Documentación dedicada en `docs/ai`.

### Changed

- La API reporta `1.4.0-dev` durante el desarrollo de NutriFlow AI.
- El escáner Free aplica realmente el límite de 10 consultas mensuales desde backend.
- El historial Free de progreso se limita a los últimos 30 días; Premium queda preparado para `history.unlimited`.
- La pantalla principal enlaza Engagement Hub, Premium Analytics y NutriFlow AI.
- La creación de alimentos acepta micronutrientes opcionales sin exponerlos mediante el catálogo Free.
- La cuota de IA implementada en Fase 12 comienza a consumirse por operaciones reales de NutriFlow AI.

### Notes

- Las Fases 11–15 todavía no procesan pagos reales.
- Todas las cuentas se resuelven temporalmente como `Free` hasta conectar un proveedor de billing.
- RevenueCat se contempla como adaptador inicial para App Store y Google Play sin acoplar el dominio al proveedor.
- Push notifications, objetivo de agua configurable, recetas comunitarias y gamificación avanzada quedan fuera del alcance de la Fase 13.
- La Fase 14 no define recomendaciones clínicas ni valores objetivo personalizados de micronutrientes; presenta métricas de seguimiento derivadas del historial registrado.
- NutriFlow AI requiere `OpenAI__ApiKey` server-side; la key nunca se expone a Mobile.
- AI Coach ofrece orientación general y no diagnostica ni sustituye atención clínica.
- Meal Photo AI y Voice Logging nunca registran comidas automáticamente: el usuario confirma y el backend vuelve a aplicar las restricciones guardadas.

## [1.0.0] - 2026-08-17

Primera versión estable del roadmap técnico inicial de NutriFlow.

### Added

- Foundation del monorepo con aplicación móvil, API, PostgreSQL, Docker y CI.
- Authentication & Identity con registro, login, JWT, refresh tokens rotativos, logout, recuperación de contraseña y Google Sign-In.
- Nutritional Onboarding con datos físicos, actividad, objetivo, preferencias y restricciones.
- Experiencia de medidas en pies/pulgadas y peso en libras.
- Nutrition Engine determinístico basado en Mifflin-St Jeor para TMB, TDEE, calorías objetivo y macronutrientes.
- Food Catalog con búsqueda, detalle, barcode lookup y alimentos personalizados.
- Meal Tracking con desayuno, almuerzo, cena y snacks, porciones y snapshots nutricionales.
- Dashboard diario con calorías y macronutrientes consumidos, objetivo y restantes.
- Barcode Scanner móvil mediante Expo Camera.
- Progress con historial de peso en libras y resumen de evolución.
- Allergies & Preferences con detección de conflictos alimentarios.
- Problem Details, rate limiting, CORS configurable, HSTS y cabeceras defensivas.
- Dockerfile multi-stage para la API.
- Validación de Docker Compose y build del contenedor dentro de CI.
- Documentación del prototipo académico original en Figma.

### Quality

- 27 pruebas .NET validadas en CI para el cierre del roadmap.
- TypeScript strict/type-check validado.
- Auditoría de dependencias crítica bloqueante en Mobile.
- Build Release de la API validado.
- Build de imagen Docker de la API validado.

### Security

- PBKDF2 + SHA-256 con salt individual para contraseñas.
- JWT de corta duración.
- Refresh tokens opacos, rotativos y revocables.
- Tokens persistentes almacenados mediante hash en servidor.
- SecureStore para sesión móvil.
- Rate limiting de autenticación.
- Configuración sensible externalizada mediante variables de entorno.

### External configuration required

Para un despliegue real todavía deben configurarse por entorno:

- Google OAuth / Google Client ID.
- Proveedor transaccional de correo para recuperación de contraseña en producción.
- Secretos JWT y credenciales PostgreSQL de producción.
- `OpenAI__ApiKey` y modelo configurado para habilitar NutriFlow AI.

### Academic origin

NutriFlow deriva conceptualmente del prototipo académico creado en 2024 para Bases de Datos 1 (INF-164) en UNAPEC. Aquella entrega consistió exclusivamente en mockups; no existió aplicación móvil funcional, backend ni API. La implementación actual fue construida desde cero.
