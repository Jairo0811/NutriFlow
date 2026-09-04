# NutriFlow Freemium

NutriFlow evoluciona desde v1.0.0 hacia un producto freemium sin degradar la experiencia nutricional básica.

## Principios

- Free debe seguir siendo útil para registrar alimentación, calorías, macros y progreso.
- Las advertencias de alergias y restricciones nunca se bloquean por suscripción.
- Premium monetiza automatización, análisis avanzado, personalización e IA.
- El backend es la fuente de verdad de acceso y cuotas; la app móvil solo representa el estado recibido.
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

## Arquitectura Freemium

```text
App móvil
   |
   | GET /api/billing/access
   | GET /api/billing/usage
   v
NutriFlow.Api
   |
   +--> ISubscriptionAccessService
   |        |
   |        v
   |    Plan + Entitlements + Limits
   |
   +--> IFeatureGateService
   |
   +--> IUsageLimitService
            |
            v
      UsageCounters
      PostgreSQL
```

La Fase 11 creó el modelo de acceso. La **Fase 12** hace efectivas las reglas en servidor y persiste las cuotas de uso. Todas las cuentas todavía se resuelven como `Free` hasta que un proveedor de billing se convierta en la fuente de verdad del plan.

## Entitlements

Los permisos Premium se representan mediante códigos estables:

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

Las funcionalidades consultan entitlements mediante `IFeatureGateService`; no se dispersan condicionales como `if (user.IsPremium)` por la aplicación.

## Usage limits

Los límites iniciales se representan con códigos independientes de los entitlements:

```text
barcode.scans.monthly
ai.requests.monthly
history.days
```

### Reglas implementadas en Fase 12

- `barcode.scans.monthly`: Free consume una cuota persistente de 10 escaneos por mes calendario UTC.
- `barcode.unlimited`: Premium omite el contador de barcode.
- `history.days`: Free solo recibe los últimos 30 días del historial de progreso.
- `history.unlimited`: Premium omite el recorte de historial.
- `ai.requests.monthly`: la infraestructura de cuota queda preparada para 5 solicitudes Free y 100 Premium cuando NutriFlow AI se implemente.

Los contadores se almacenan en PostgreSQL por usuario, código y período. El incremento de una cuota se realiza de forma atómica mediante `INSERT ... ON CONFLICT DO UPDATE`, evitando que reinicios de la API o cambios de dispositivo reinicien el consumo.

## Contrato HTTP

### Acceso efectivo

```text
GET /api/billing/access
```

Devuelve plan, entitlements y límites configurados.

### Consumo del período actual

```text
GET /api/billing/usage
```

Devuelve para cada cuota consumible:

- límite;
- uso acumulado;
- restante;
- si es ilimitada;
- inicio y fin del período UTC.

Cuando una cuota se agota, el backend responde `429 Too Many Requests` con `error = usage_limit_reached` y el snapshot de consumo para que Mobile pueda mostrar una experiencia de upgrade coherente.

## Siguiente fase de billing

La integración comercial añadirá:

1. persistencia de suscripciones y eventos de billing;
2. RevenueCat como adaptador inicial para App Store y Google Play;
3. webhooks firmados e idempotentes;
4. reconciliación periódica de entitlements;
5. trial y restauración de compras;
6. métricas de conversión y churn.

## Roadmap de producto

- v1.1: Freemium Foundation + Usage Limits & Feature Gates.
- v1.2: Engagement, agua, recetas y hábitos.
- v1.3: Premium Analytics y micronutrientes.
- v1.4: NutriFlow AI.
- v1.5: Meal Planner y lista de compras.
- v1.6: Apple Health / Health Connect.
- v2.0: NutriFlow Professionals.
