<p align="center">
  <img src="branding/cover.png" alt="NutriFlow — Nutrición, hábitos y progreso" width="720" />
</p>

<p align="center">
  <strong>Nutrición, hábitos y progreso en una experiencia móvil full-stack.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Congelado%20para%20portafolio-64748B?style=for-the-badge" alt="Congelado para portafolio">
  <img src="https://img.shields.io/badge/Versión-1.4.0-22C55E?style=for-the-badge" alt="Versión 1.4.0">
  <img src="https://img.shields.io/badge/UNAPEC-INF--164-003B70?style=for-the-badge" alt="UNAPEC INF-164">
</p>

<p align="center">
  <a href="https://github.com/Jairo0811/NutriFlow/actions/workflows/ci.yml">
    <img src="https://github.com/Jairo0811/NutriFlow/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <img src="https://img.shields.io/badge/arquitectura-Clean%20Architecture-0F172A" alt="Clean Architecture">
  <img src="https://img.shields.io/badge/base%20de%20datos-PostgreSQL%2017-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 17">
</p>

<p align="center">
  <strong>React Native · Expo · TypeScript · ASP.NET Core · EF Core · PostgreSQL · Docker · GitHub Actions</strong>
</p>

> **Snapshot de portafolio:** NutriFlow v1.4.0 queda congelado como versión funcional y demostrable del proyecto. No representa un lanzamiento comercial en App Store/Google Play ni implica que billing, credenciales externas o infraestructura productiva estén conectados.

---

## Descripción

**NutriFlow** es una aplicación móvil de seguimiento nutricional que permite crear un perfil nutricional, calcular objetivos diarios, registrar comidas, consultar calorías y macronutrientes, escanear productos, gestionar alergias y restricciones, seguir el progreso corporal y utilizar funciones asistidas por IA.

La aplicación actual fue desarrollada como implementación full-stack real a partir de un **prototipo académico de 2024** que originalmente consistía en mockups y flujo visual, sin backend ni aplicación funcional.

---

## Alcance congelado — v1.4.0

| Área | Estado |
|---|:---:|
| Authentication & Identity | ✅ |
| Onboarding nutricional obligatorio | ✅ |
| Nutrition Engine | ✅ |
| Food Catalog | ✅ |
| Meal Tracking | ✅ |
| Dashboard diario | ✅ |
| Barcode Scanner | ✅ |
| Progress / historial de peso | ✅ |
| Allergies & Preferences | ✅ |
| Freemium Foundation | ✅ |
| Usage Limits & Feature Gates | ✅ |
| Engagement & Retention | ✅ |
| Premium Analytics | ✅ |
| Micronutrients | ✅ |
| NutriFlow AI | ✅ |
| Icono + splash nativo | ✅ |
| EAS Build configuration | ✅ |
| CI API + Mobile | ✅ |

### Funciones principales

- registro e inicio de sesión con JWT + refresh tokens;
- Google authentication soportada mediante backend;
- onboarding nutricional con reanudación si queda incompleto;
- cálculo de TMB, TDEE, calorías objetivo y macronutrientes;
- unidades de interfaz en pies/pulgadas y libras;
- catálogo de alimentos y porciones;
- registro y edición de comidas;
- iconos por tipo de comida;
- dashboard diario de consumo y valores restantes;
- cámara para escaneo de códigos de barras;
- progreso de peso e historial;
- alergias, restricciones y preferencias alimentarias;
- advertencias de seguridad alimentaria no bloqueadas por paywall;
- engagement y métricas premium;
- análisis de micronutrientes;
- NutriFlow AI con Coach, Meal Photo y Voice Logging;
- confirmación explícita antes de registrar comidas propuestas por IA;
- validación de alimentos sugeridos por IA contra alergias/restricciones;
- branding nativo con icono y splash;
- perfiles EAS `preview` y `production`.

---

## NutriFlow AI

La IA se integra **del lado del servidor**. La aplicación móvil nunca recibe una API key de OpenAI.

Capacidades de la versión congelada:

- **AI Coach** para consultas nutricionales contextuales;
- **Meal Photo AI** para extraer alimentos desde una imagen;
- **Voice Logging** a partir de texto dictado por el usuario;
- mapeo de alimentos detectados hacia el catálogo interno;
- validación de seguridad antes del registro;
- confirmación del usuario antes de persistir una comida.

Cuotas configuradas:

| Plan | AI requests / mes |
|---|---:|
| Free | 5 |
| Premium | 100 |

> La arquitectura de planes está implementada, pero el proveedor de billing no está conectado en este snapshot; las cuentas reales permanecen en el plan Free hasta integrar un proveedor de suscripciones.

---

## 🧱 Stack tecnológico

### 📱 Mobile / Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,ts" alt="React Native y TypeScript" />
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 57" />
  <img src="https://img.shields.io/badge/Expo%20Router-Navegación-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo Router" />
  <img src="https://img.shields.io/badge/EAS-Build-4630EB?style=flat-square&logo=expo&logoColor=white" alt="EAS Build" />
</p>

| Área | Tecnología |
|---|---|
| Framework | React Native 0.86 |
| Plataforma | Expo SDK 57 |
| Lenguaje | TypeScript 6 |
| Navegación | Expo Router |
| Cámara | Expo Camera |
| Sesión local | Expo SecureStore |
| OAuth | Expo AuthSession |
| Iconos | `@expo/vector-icons` |
| Builds | EAS Build |

### ⚙️ Backend / API

<p>
  <img src="https://skillicons.dev/icons?i=cs,dotnet" alt="C# y .NET" />
  <img src="https://img.shields.io/badge/ASP.NET%20Core-Web%20API-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt="ASP.NET Core Web API" />
  <img src="https://img.shields.io/badge/EF%20Core-Persistencia-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt="Entity Framework Core" />
  <img src="https://img.shields.io/badge/OpenAPI-Contrato%20HTTP-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="OpenAPI" />
</p>

| Área | Tecnología |
|---|---|
| Plataforma | .NET 10 |
| API | ASP.NET Core Web API |
| Arquitectura | Clean Architecture |
| Persistencia | Entity Framework Core + Npgsql |
| Autenticación | JWT + refresh tokens rotativos |
| IA | OpenAI Responses API vía proveedor server-side |
| Contrato HTTP | OpenAPI |

### 🤖 IA e integraciones

<p>
  <img src="https://img.shields.io/badge/OpenAI-Responses%20API-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI Responses API" />
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Google-OAuth-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google OAuth" />
</p>

- OpenAI Responses API integrada exclusivamente desde el backend;
- AI Coach, Meal Photo y Voice Logging;
- Google authentication con validación server-side;
- JWT + refresh tokens rotativos;
- feature gates y cuotas de uso por plan.

### 🗄️ Datos

<p>
  <img src="https://skillicons.dev/icons?i=postgres" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Npgsql-EF%20Core-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="Npgsql" />
</p>

- PostgreSQL 17;
- Entity Framework Core + Npgsql;
- migraciones EF Core;
- persistencia de identidad, nutrición, comidas, progreso, engagement, analytics, micronutrientes y cuotas.

### 🧰 Infraestructura, builds y CI

<p>
  <img src="https://skillicons.dev/icons?i=docker,git,github,githubactions" alt="Docker, Git, GitHub y GitHub Actions" />
  <img src="https://img.shields.io/badge/Docker%20Compose-Orquestación-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/EAS-Mobile%20Builds-4630EB?style=flat-square&logo=expo&logoColor=white" alt="EAS mobile builds" />
</p>

- Docker Compose;
- Git + GitHub;
- GitHub Actions;
- configuración mediante variables de entorno;
- EAS `preview` y `production` para builds móviles.

---

## Arquitectura

```text
React Native + Expo
        │
        │ HTTPS / JSON
        ▼
NutriFlow.Api
        │
        ▼
Application
        │
        ▼
Domain
        ▲
        │
Infrastructure
   EF Core / PostgreSQL
        │
        └── OpenAI provider / integrations
```

`NutriFlow.Domain` permanece independiente de HTTP, persistencia y proveedores externos.

Documentación adicional: [`docs/architecture`](docs/architecture/README.md).

---

## API destacada

### Identity

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Nutrición y seguimiento

```text
GET  /api/onboarding/
PUT  /api/onboarding/physical-profile
PUT  /api/onboarding/activity
PUT  /api/onboarding/goal
PUT  /api/onboarding/preferences
PUT  /api/onboarding/restrictions
POST /api/onboarding/complete
GET  /api/nutrition/targets
GET  /api/foods/
GET  /api/foods/barcode/{barcode}
GET  /api/meals/
POST /api/meals/entries
GET  /api/dashboard/?date=YYYY-MM-DD
```

### IA

```text
GET  /api/ai/status
POST /api/ai/coach
POST /api/ai/meal-photo
POST /api/ai/voice-log
POST /api/ai/confirm-meal
```

---

## Calidad y CI

El pipeline de GitHub Actions valida ambos lados del sistema antes de integrar cambios en `main`.

### API

- restore;
- build Release;
- tests automatizados;
- validación de Docker Compose;
- build de la imagen Docker.

### Mobile

- instalación reproducible con `npm ci`;
- reporte de advisories high del toolchain;
- bloqueo de vulnerabilidades críticas;
- TypeScript type-check.

Los advisories conocidos del ecosistema Expo se revisan sin forzar upgrades incompatibles. Consulta [`SECURITY.md`](SECURITY.md).

---

## Branding y build móvil

La configuración de Expo incluye:

- `apps/mobile/icon.png` como icono de aplicación;
- `apps/mobile/splash-icon.png` mediante `expo-splash-screen`;
- `apps/mobile/eas.json` con perfiles `preview` y `production`;
- bundle identifier iOS: `com.jairomatias.nutriflow`;
- package Android: `com.jairomatias.nutriflow`.

El perfil `preview` está preparado para distribución interna. Un build instalable en un iPhone físico requiere las credenciales y el aprovisionamiento correspondientes de Apple.

---

## Ejecución local

### Requisitos

- .NET SDK 10;
- Node.js 24 + npm;
- PostgreSQL 17 o Docker;
- Expo compatible con SDK 57.

### Mobile

```bash
cd apps/mobile
npm ci
npx expo-doctor@latest
npm run typecheck
npx expo start -c
```

### Configuración

Usa `.env.example` como referencia y nunca publiques secretos reales.

Variables relevantes incluyen:

```text
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
ConnectionStrings__NutriFlow=
Jwt__SigningKey=
OpenAI__ApiKey=
OpenAI__Model=
```

`OpenAI__ApiKey` es exclusivamente server-side y nunca debe exponerse mediante variables `EXPO_PUBLIC_*`.

---

## Origen académico

NutriFlow nació como proyecto de **Bases de Datos 1 (INF-164)** en la **Universidad APEC (UNAPEC)** durante el período **mayo–agosto de 2024**.

| Información | Detalle |
|---|---|
| Asignatura | Bases de Datos 1 (INF-164) |
| Profesor | Ing. Pedro José Ramirez Rodriguez |
| Institución | Universidad APEC (UNAPEC) |
| Período | Mayo - Agosto 2024 |
| Entrega original | Mockups / prototipo visual |
| Aplicación funcional en 2024 | No |
| Implementación actual | Aplicación móvil full-stack desarrollada desde cero |
| Prototipo | [Figma — Daiet](https://www.figma.com/proto/Ww6fj3ebznHPc88hr48FSg/Daiet?node-id=0-1&t=U2MHmy9fFjnzx23I-1) |

### Equipo académico original

| Integrante | Matrícula |
|---|---|
| Luis Alberto Jimenez Perez | A00102205 |
| Charlie de Leon Duran | A00108707 |
| Francisca Mariela Hernández Melo | A00113127 |
| Francis Jairo Matías Rosario | A00115261 |

---

## Estado del proyecto

**NutriFlow v1.4.0 está congelado como snapshot de portafolio.**

Esto significa que el alcance actual se considera cerrado y estable para demostración, documentación académica y portafolio técnico. Las siguientes ideas quedan fuera de este snapshot y podrían retomarse únicamente como una evolución futura:

- Meal Planner + Shopping List;
- RevenueCat / billing real;
- publicación en App Store / Google Play;
- Apple Health / Health Connect;
- módulos para profesionales de nutrición.

No forman parte del cierre de v1.4.0.

---

## Licencia y uso

Proyecto de portafolio y evolución académica. Revisa el repositorio antes de reutilizar código, assets o branding en otros productos.
