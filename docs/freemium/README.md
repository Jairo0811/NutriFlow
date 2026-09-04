# NutriFlow Freemium

NutriFlow evoluciona desde v1.0.0 hacia un producto freemium sin degradar la experiencia nutricional básica.

## Principios

- Free debe seguir siendo útil para registrar alimentación, calorías, macros y progreso.
- Las advertencias de alergias y restricciones nunca se bloquean por suscripción.
- Premium monetiza automatización, análisis avanzado, personalización e IA.
- El backend es la fuente de verdad de acceso; la app móvil solo consume entitlements.
- El dominio de identidad no contiene `IsPremium` ni lógica específica de proveedores de pago.

## Planes iniciales

### NutriFlow Free

- cálculo de objetivos nutricionales;
- registro de comidas;
- dashboard diario;
- progreso de peso;
- restricciones y compatibilidad alimentaria;
- 10 escaneos de código de barras al mes;
- 5 consultas de IA al mes cuando NutriFlow AI esté disponible;
- historial de 30 días.

### NutriFlow Premium

Incluye todos los beneficios Free y habilita:

- escáner ilimitado;
- historial ilimitado;
- analítica avanzada;
- micronutrientes;
- NutriFlow AI Coach;
- análisis de comida por fotografía;
- registro por voz;
- planificador de comidas;
- lista de compras;
- exportación de datos;
- ayuno;
- integraciones avanzadas de salud.

## Arquitectura

```text
App móvil
   |
   | GET /api/billing/access
   v
NutriFlow.Api
   |
   v
ISubscriptionAccessService
   |
   v
Plan + Entitlements + Usage Limits
```

La Fase 11 no conecta todavía un proveedor de pagos. Todas las cuentas se resuelven como `Free` hasta que RevenueCat/App Store/Google Play se integren como fuente de verdad.

## Entitlements

Los permisos Premium se representan mediante códigos estables, por ejemplo:

```text
barcode.unlimited
history.unlimited
analytics.advanced
nutrition.micronutrients
ai.coach
ai.meal-photo
ai.voice-logging
meal-planner
shopping-list
data-export
fasting
health.advanced
```

Las funcionalidades deben consultar entitlements en lugar de usar condicionales dispersos como `if (user.IsPremium)`.

## Siguiente fase de billing

La integración comercial añadirá:

1. persistencia de suscripciones y eventos de billing;
2. RevenueCat como adaptador inicial para App Store y Google Play;
3. webhooks firmados e idempotentes;
4. reconciliación periódica de entitlements;
5. trial y restauración de compras;
6. métricas de conversión y churn;
7. feature gates y contadores de uso persistentes.

## Roadmap de producto

- v1.1: Freemium Foundation.
- v1.2: Engagement, agua, recetas y hábitos.
- v1.3: Premium Analytics y micronutrientes.
- v1.4: NutriFlow AI.
- v1.5: Meal Planner y lista de compras.
- v1.6: Apple Health / Health Connect.
- v2.0: NutriFlow Professionals.
