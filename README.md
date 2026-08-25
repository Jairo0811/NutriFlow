<p align="center">
  <img src="branding/cover.png" alt="NutriFlow — Nutrición, hábitos y progreso" width="720" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/UNAPEC-INF--164-003B70?style=for-the-badge" alt="UNAPEC INF-164">
</p>

<p align="center">
  <strong>Nutrición, hábitos y progreso en una experiencia móvil moderna.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Estable-22C55E?style=for-the-badge" alt="Estado estable">
  <img src="https://img.shields.io/badge/Versión-1.0.0-22C55E?style=for-the-badge" alt="Versión 1.0.0">
  <img src="https://img.shields.io/badge/Roadmap-Fases%200--10%20completadas-111827?style=for-the-badge" alt="Roadmap completado">
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

> 🎓 **Origen académico:** NutriFlow parte de un conjunto de mockups desarrollado durante la asignatura **Bases de Datos 1 (INF-164)** de la **Universidad APEC (UNAPEC)**, en el período **Mayo - Agosto 2024**. En aquella etapa no se desarrolló una aplicación funcional. La implementación actual toma ese prototipo como referencia conceptual y visual y construye, por primera vez, una aplicación móvil full-stack real.

---

## 📖 Descripción

**NutriFlow** es una aplicación móvil de seguimiento nutricional que permite registrar alimentación, calcular objetivos diarios, visualizar calorías y macronutrientes, escanear productos, gestionar restricciones alimentarias y medir el progreso de peso.

La versión **v1.0.0** representa la primera versión estable del roadmap técnico inicial. El producto actual fue desarrollado desde cero y no es una migración de una aplicación anterior: el trabajo académico de 2024 consistió exclusivamente en **mockups y prototipo visual**.

### Capacidades principales

- autenticación y sesiones seguras;
- onboarding nutricional personalizado;
- altura en **pies/pulgadas** y peso en **libras** en la experiencia del usuario;
- cálculo determinístico de TMB, TDEE, calorías objetivo y macronutrientes;
- catálogo de alimentos;
- registro diario de comidas y porciones;
- dashboard de consumo y valores restantes;
- escáner de códigos de barras mediante cámara;
- historial de peso y progreso;
- alergias, restricciones y preferencias;
- advertencias de incompatibilidad entre alimentos y restricciones;
- API REST documentada mediante OpenAPI;
- PostgreSQL + EF Core;
- Docker Compose;
- CI con build, tests, type-check, auditoría crítica y build del contenedor.

---

## 🕰️ Evolución del proyecto

```text
2024 — UNAPEC · INF-164
        │
        ├── Concepto de producto
        ├── Flujo de usuario
        └── Mockups / prototipo
                │
                │ Sin aplicación funcional
                │ Sin backend
                │ Sin API
                │ Sin implementación móvil
                ▼
2026 — NutriFlow
        │
        ├── React Native + Expo
        ├── ASP.NET Core
        ├── Clean Architecture
        ├── EF Core + PostgreSQL
        ├── Docker
        └── GitHub Actions
                │
                ▼
             v1.0.0
        Aplicación móvil full-stack
```

---

## 🎓 Origen académico

El concepto original fue preparado como proyecto de **Bases de Datos 1 (INF-164)** en la **Universidad APEC (UNAPEC)**.

| Información | Detalle |
|---|---|
| 📖 Asignatura | Bases de Datos 1 (INF-164) |
| 👨‍🏫 Profesor | Ing. Pedro José Ramirez Rodriguez |
| 🏫 Institución | Universidad APEC (UNAPEC) |
| 📅 Período académico | Mayo - Agosto 2024 |
| 📁 Entrega original | Prototipo mediante mockups |
| 🎨 Prototipo | [Figma — Daiet](https://www.figma.com/proto/Ww6fj3ebznHPc88hr48FSg/Daiet?node-id=0-1&t=U2MHmy9fFjnzx23I-1) |
| 💻 Aplicación funcional en 2024 | No |
| 📱 Implementación actual | Aplicación móvil full-stack desarrollada desde cero |

### 👥 Equipo académico original

| Integrante | Matrícula |
|---|---|
| Luis Alberto Jimenez Perez | A00102205 |
| Charlie de Leon Duran | A00108707 |
| Francisca Mariela Hernández Melo | A00113127 |
| Francis Jairo Matías Rosario | A00115261 |

---

## 🎨 Prototipo académico original en Figma

Los mockups originales de 2024 se conservan en Figma y funcionan como referencia visual primaria del concepto académico.

Entre las pantallas del prototipo se encuentran:

| Pantalla | Propósito conceptual |
|---|---|
| `Inicio` | Presentación y entrada al flujo |
| `Log in` | Inicio de sesión |
| `Sign in` | Creación de cuenta |
| `Actividad física` | Datos físicos, demográficos y nivel de actividad |
| `Alimentos` | Preferencias alimentarias |
| `Alimentos v2` | Concepto de escaneo de alimentos |
| `Objetivo` | Perder grasa, mantener peso o ganar músculo |
| `Main Page` | Dashboard de calorías, macros y comidas |
| `Alergias y preferencias` | Restricciones y alimentos no recomendados |
| `Progreso` | Peso, objetivo y evolución |

> El prototipo académico representa funcionalidades propuestas. No existió una aplicación funcional en 2024.

---

## 🧭 Continuidad académica

NutriFlow constituye el primer punto de una continuidad docente de **tres proyectos** con el profesor **Ing. Pedro José Ramirez Rodriguez** dentro de la trayectoria documentada en la Universidad APEC (UNAPEC).

| Orden | Asignatura | Proyecto | Período |
|---:|---|---|---|
| 1 | Bases de Datos 1 (INF-164) | **NutriFlow** | Mayo - Agosto 2024 |
| 2 | Fundamentos de Seguridad de Software (ISO-915) | [CertiChain](https://github.com/Jairo0811/CertiChain) | Septiembre - Diciembre 2025 |
| 3 | Desarrollo de Software con Tecnología Propietaria 2 (ISO-710) | [Digital Sanctuary](https://github.com/Jairo0811/DigitalSanctuary) | Mayo - Agosto 2026 |

La secuencia es **formativa y cronológica**: comienza con fundamentos de datos y modelado, continúa con seguridad de software y blockchain, y posteriormente llega al desarrollo de una aplicación Android nativa. Los tres proyectos son independientes y no constituyen versiones ni dependencias técnicas entre sí.

---

## ✨ Alcance de NutriFlow v1.0.0

| Módulo | Estado |
|---|:---:|
| Foundation / monorepo | ✅ |
| Authentication & Identity | ✅ |
| Nutritional Onboarding | ✅ |
| Nutrition Engine | ✅ |
| Food Catalog | ✅ |
| Meal Tracking | ✅ |
| Dashboard | ✅ |
| Barcode Scanner | ✅ |
| Progress | ✅ |
| Allergies & Preferences | ✅ |
| Production Readiness | ✅ |

### Flujo principal

```text
Crear cuenta / iniciar sesión
          ↓
Onboarding nutricional
          ↓
Perfil físico + actividad + objetivo
          ↓
Nutrition Engine
          ↓
Objetivos diarios de calorías y macros
          ↓
Catálogo / escáner / comidas
          ↓
Dashboard diario
          ↓
Seguimiento de peso y progreso
```

---

## ⚙️ Nutrition Engine

El motor nutricional utiliza reglas determinísticas y datos estructurados. La fórmula base implementada es **Mifflin-St Jeor**.

```text
Perfil físico
   ↓
TMB / energía en reposo
   ↓
Factor de actividad
   ↓
TDEE
   ↓
Objetivo nutricional
   ↓
Calorías objetivo
   ↓
Proteína · Carbohidratos · Grasas
```

La interfaz utiliza **ft / in / lb**. Cuando una fórmula requiere unidades métricas, la conversión se realiza internamente dentro del dominio.

> Los resultados son estimaciones y no sustituyen una evaluación nutricional profesional.

---

## 🧱 Stack tecnológico

### 📱 Mobile / Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react,ts" alt="React Native y TypeScript" />
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 57" />
</p>

| Área | Tecnología |
|---|---|
| Framework | React Native 0.86 |
| Plataforma | Expo SDK 57 |
| Lenguaje | TypeScript 6 |
| Navegación | Expo Router |
| Cámara / Barcode | Expo Camera |
| Sesión local | Expo SecureStore |
| OAuth | Expo AuthSession |
| Organización | Feature-based modular |

### ⚙️ Backend

<p>
  <img src="https://skillicons.dev/icons?i=cs,dotnet" alt="C# y .NET" />
</p>

| Área | Tecnología |
|---|---|
| Plataforma | .NET 10 |
| API | ASP.NET Core Web API |
| Arquitectura | Clean Architecture |
| Persistencia | Entity Framework Core + Npgsql |
| Autenticación | JWT + refresh tokens rotativos |
| Federación | Google ID token verification |
| Contrato HTTP | OpenAPI |
| Health | ASP.NET Core Health Checks |

### 🗄️ Datos

<p>
  <img src="https://skillicons.dev/icons?i=postgres" alt="PostgreSQL" />
</p>

- PostgreSQL 17
- Entity Framework Core + Npgsql

### 🧰 Infraestructura y DevOps

<p>
  <img src="https://skillicons.dev/icons?i=docker,git,github,githubactions" alt="Docker, Git, GitHub y GitHub Actions" />
</p>

- Docker Compose
- Git y GitHub
- GitHub Actions

---

## 🏗️ Arquitectura

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
```

`NutriFlow.Domain` permanece independiente de HTTP, persistencia, frameworks y servicios externos.

Documentación adicional: [`docs/architecture`](docs/architecture/README.md).

---

## 🔌 API principal

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

### Onboarding y nutrición

```text
GET  /api/onboarding/
PUT  /api/onboarding/physical-profile
PUT  /api/onboarding/activity
PUT  /api/onboarding/goal
PUT  /api/onboarding/preferences
PUT  /api/onboarding/restrictions
POST /api/onboarding/complete
GET  /api/nutrition/targets
```

### Alimentos, comidas y producto

```text
GET  /api/foods/
GET  /api/foods/{id}
GET  /api/foods/barcode/{barcode}
POST /api/foods/
GET  /api/meals/
POST /api/meals/entries
PUT  /api/meals/entries/{entryId}
DELETE /api/meals/entries/{entryId}
GET  /api/dashboard/?date=YYYY-MM-DD
```

Los módulos de progreso y compatibilidad alimentaria también están expuestos mediante endpoints autenticados dentro de la API.

---

## 🧪 Calidad y CI

La integración final del roadmap se validó con CI antes de fusionarse a `main`.

- restore y build Release de la API;
- **27 tests .NET**;
- validación de Docker Compose;
- build de la imagen Docker de la API;
- instalación de dependencias Mobile;
- reporte de advisories high del toolchain;
- bloqueo de vulnerabilidades críticas;
- TypeScript strict/type-check.

Los advisories high conocidos del toolchain Expo continúan documentados y monitoreados; no se fuerza un downgrade incompatible únicamente para silenciarlos. Consulta [`SECURITY.md`](SECURITY.md).

---

## 🔐 Seguridad

NutriFlow incluye:

- PBKDF2 + SHA-256 con salt individual para contraseñas;
- JWT de corta duración;
- refresh tokens opacos, rotativos y revocables;
- almacenamiento de hashes de tokens persistentes en servidor;
- SecureStore para la sesión móvil;
- tokens de recuperación de un solo uso;
- validación de Google ID tokens en backend;
- rate limiting en autenticación;
- Problem Details y manejo global de excepciones;
- CORS configurable;
- HSTS fuera de Development;
- forwarded headers con configuración conservadora;
- cabeceras HTTP defensivas;
- secretos y configuración sensible mediante variables de entorno;
- auditoría de dependencias mediante CI.

### Configuración externa pendiente por entorno

La aplicación incluye la implementación necesaria, pero algunos servicios requieren credenciales externas antes de un despliegue real:

- Google OAuth / Google Client ID;
- entrega transaccional de correos para recuperación de contraseña en producción;
- secretos JWT y credenciales de PostgreSQL de producción.

---

## 🚀 Ejecución local

### Requisitos

- .NET SDK 10;
- Node.js 24 + npm;
- Docker Desktop o Docker Engine con Docker Compose.

### 1. Clonar

```bash
git clone https://github.com/Jairo0811/NutriFlow.git
cd NutriFlow
```

### 2. Configurar entorno

Usa `.env.example` como referencia y nunca publiques secretos reales.

Variables principales:

```text
ConnectionStrings__NutriFlow=Host=localhost;Port=5432;Database=NutriFlowDb;Username=nutriflow;Password=<password>
Jwt__SigningKey=<secreto-aleatorio-de-al-menos-32-bytes>
Jwt__GoogleClientIds__0=<google-client-id>
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
```

### 3. Levantar infraestructura y API

```bash
docker compose up -d

dotnet restore apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj
dotnet run --project apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj
```

Health check:

```text
http://localhost:5000/health
```

### 4. Ejecutar Mobile

```bash
cd apps/mobile
npm install
npm start
```

> En un dispositivo físico, configura `EXPO_PUBLIC_API_URL` con una dirección accesible desde el teléfono; `localhost` apunta al propio dispositivo.

---

## 🗺️ Roadmap inicial

```text
Fase 0   Foundation                    ✅
Fase 1   Authentication & Identity    ✅
Fase 2   Nutritional Onboarding       ✅
Fase 3   Nutrition Engine             ✅
Fase 4   Food Catalog                 ✅
Fase 5   Meal Tracking                ✅
Fase 6   Dashboard                    ✅
Fase 7   Barcode Scanner              ✅
Fase 8   Progress                     ✅
Fase 9   Allergies & Preferences      ✅
Fase 10  Production Readiness         ✅
```

El roadmap técnico inicial está **completado** desde v1.0.0.

### Evolución posterior

- hidratación;
- recetas y comidas frecuentes;
- favoritos y duplicación;
- micronutrientes;
- calendario nutricional;
- comparación de productos;
- lista de compras;
- recomendaciones según macros restantes;
- **¿Qué puedo comer ahora?** basado en presupuesto restante y restricciones;
- exportaciones PDF/CSV;
- funcionamiento offline y sincronización;
- integración con profesionales de nutrición.

---

## 📦 Versionado

La primera versión estable es **NutriFlow v1.0.0**.

La API y la aplicación móvil reportan la versión `1.0.0`. Las notas de esta versión se encuentran en [`CHANGELOG.md`](CHANGELOG.md).

---

## 👨‍💻 Evolución y mantenimiento

La implementación actual de NutriFlow es desarrollada y mantenida por **Francis Jairo Matías Rosario**, retomando el concepto creado junto al equipo académico de 2024 y llevándolo por primera vez a una implementación móvil funcional.

---

## 🙏 Créditos

- **Universidad:** Universidad APEC (UNAPEC)
- **Asignatura:** Bases de Datos 1
- **Código:** INF-164
- **Período:** Mayo - Agosto 2024
- **Profesor:** Ing. Pedro José Ramirez Rodriguez
- **Entrega original:** prototipo mediante mockups
- **Prototipo:** [Figma — Daiet](https://www.figma.com/proto/Ww6fj3ebznHPc88hr48FSg/Daiet?node-id=0-1&t=U2MHmy9fFjnzx23I-1)
- **Equipo original:** Luis Alberto Jimenez Perez, Charlie de Leon Duran, Francisca Mariela Hernández Melo y Francis Jairo Matías Rosario
- **Implementación actual y mantenimiento:** Francis Jairo Matías Rosario

---

<p align="center">
  <strong>De prototipo académico a aplicación móvil real.</strong>
</p>