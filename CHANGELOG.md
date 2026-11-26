# Changelog

Todos los cambios relevantes de NutriFlow se documentan en este archivo.

El proyecto utiliza versionado semántico (`MAJOR.MINOR.PATCH`).

## [Unreleased]

_Sin cambios pendientes de lanzar._

## [1.5.0] — 2026-11-26 — candidata a lanzamiento

> **Estado:** preparada pero **no congelada**. El congelamiento del proyecto queda pendiente de la validación en dispositivo físico descrita en [`docs/mobile-qa-checklist.md`](docs/mobile-qa-checklist.md). Todas las comprobaciones automatizadas descritas abajo se ejecutan en CI.

### Interfaz neón coherente

- Inicio de sesión con la identidad aprobada: fondo `#040907`, verde neón `#89F62A`, isotipo PNG transparente, destellos decorativos y accesos reales a registro y recuperación de contraseña.
- La paleta neón pasa a `src/theme.ts` y se aplica a toda la app: color primario, fondo, campos, botones en forma de píldora con brillo y bordes verdes en acciones secundarias. No quedan colores hexadecimales fuera del tema.
- Botones y campos compartidos (`Button`, `Input`, `DateField`) con el mismo lenguaje visual que el login.
- Los botones hechos a mano de las pantallas de IA y hábitos se sustituyen por el componente compartido `Button`.
- Los emojis usados como iconos (💧 ⭐ 🥗 📚 🔒 ⚠️ ✓ ★) se reemplazan por iconos Ionicons mediante el nuevo `IconLabel`, para que se vean igual en Android e iOS.
- El color de fondo del splash nativo coincide con el fondo de la app.
- No se añaden funcionalidades ni se reconstruyen módulos terminados.

### Accesibilidad

- Los mensajes de error se anuncian a lectores de pantalla (`ErrorText`, rol `alert` y región en vivo) en todas las pantallas que los muestran.
- El borde de los campos pasa de 2.2:1 a más de 3:1 de contraste (WCAG 1.4.11).
- Ningún texto queda por debajo de 12 px; los textos secundarios de 11–12 px suben a 13 px.
- El botón de eliminar del diario alcanza 44 px táctiles.
- Favoritos del catálogo y selección de ingredientes anuncian su estado (`selected`/`checked`) y usan etiquetas descriptivas.
- Los iconos decorativos se ocultan del árbol de accesibilidad.

### Calidad y pruebas

- Nueva auditoría automatizada de accesibilidad (`__tests__/accessibility-audit-test.tsx`, 223 comprobaciones sobre las 33 pantallas y componentes): rol en todo `Pressable`, etiqueta en todo `TextInput` e `Image`, ausencia de colores sueltos y de emojis, tamaño mínimo de texto, anuncio de errores y contraste WCAG AA de toda la paleta.
- La API reporta la versión `1.5.0`; Mobile (`app.json` y `package.json`) también.
- Auditoría de dependencias de producción de Mobile: 0 vulnerabilidades críticas (el CI las bloquea). Quedan 6 altas y 8 moderadas en dependencias transitivas de Expo (`node-forge`, `zod`, `decode-uri-component`, `uuid`…); corregirlas exige `npm audit fix --force`, que implica saltos de versión mayores, y queda fuera del alcance de esta versión.


### QA móvil con backend real

- Nuevo recorrido de Android emulado con servidor API y PostgreSQL de prueba: login, Home, dashboard, diario de comidas, progreso y acceso al escáner.
- Capturas y jerarquía accesible exportadas como artefactos temporales de GitHub Actions; sin imágenes simuladas.
- Pruebas de cámara física, permisionado avanzado, accesibilidad manual e iOS siguen fuera del alcance de ese smoke.


### Calidad e integración real

- Smoke HTTP automatizado de 21 verificaciones contra API ASP.NET Core y PostgreSQL 17 con contenedores efímeros, incluyendo autenticación, onboarding, alérgenos, comidas, peso, agua, recetas y permisos Premium.
- Corregido el registro de las migraciones `AddWeightProgress`, `AddFoodAllergens`, `AddEngagement` y `AddMicronutrients` en Entity Framework Core: sin los atributos `Migration` y `DbContext` no se aplicaban al iniciar una base limpia.
- Prueba xUnit para impedir que las migraciones dejen de ser descubiertas en futuras refactorizaciones.
- Se conserva el pendiente de QA visual y de cámara en un dispositivo real antes de congelar v1.5.0.


### Mejoras del frontend móvil (2026-11-17)

- Migración de nueve pantallas a `Screen` con estilos y navegación coherentes.
- Arreglo de gráfica sin entradas, fecha local reactiva en IA, búsqueda sin respuestas obsoletas y escáner con cámara de altura definida.
- Confirmaciones en operaciones destructivas, etiquetas de accesibilidad y acciones de recuperación de errores.
- Edición de porciones en el diario usando el endpoint `PUT` existente, sin nuevas migraciones de backend.
- Tests sin dependencias adicionales para calendario, validación y composición de fechas; CI también exporta Expo web.
- Pruebas de componentes con `jest-expo` y React Native Testing Library 13, fijadas al SDK 57; validación añadida a CI.
- Centralización de colores y refuerzo del contraste de placeholders.
- QA presencial en dispositivo físico pendiente antes de congelar la versión 1.5.0.

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
