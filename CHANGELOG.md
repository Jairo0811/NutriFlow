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

### Changed

- La API reporta `1.1.0-dev` durante el desarrollo de la siguiente versión.

### Notes

- La Fase 11 no procesa pagos reales todavía.
- Todas las cuentas se resuelven temporalmente como `Free` hasta conectar un proveedor de billing.
- RevenueCat se contempla como adaptador inicial para App Store y Google Play sin acoplar el dominio al proveedor.

## [1.0.0] - 2026-08-17

Primera versión estable del roadmap técnico inicial de NutriFlow.

### Added

- Foundation del monorepo con aplicación móvil, API, PostgreSQL, Docker y CI.
- Authentication & Identity con registro, login, JWT, refresh tokens rotativos, logout, recuperación de contraseña y Google Sign-In.
- Nutritional Onboarding con datos físicos, actividad, objetivo, preferencias y restricciones.
- Experiencia de medidas en pies, pulgadas y libras.
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

### Academic origin

NutriFlow deriva conceptualmente del prototipo académico creado en 2024 para Bases de Datos 1 (INF-164) en UNAPEC. Aquella entrega consistió exclusivamente en mockups; no existió aplicación móvil funcional, backend ni API. La implementación actual fue construida desde cero.
