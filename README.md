<h1 align="center">NutriFlow</h1>

<p align="center">
  <strong>Nutrición, hábitos y progreso en una experiencia móvil moderna.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/UNAPEC-INF--164-003B70?style=for-the-badge" alt="UNAPEC INF-164">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-F5A623?style=for-the-badge" alt="Estado en desarrollo">
  <img src="https://img.shields.io/badge/Versión-0.1.0-22C55E?style=for-the-badge" alt="Versión 0.1.0">
  <img src="https://img.shields.io/badge/Fase-Foundation-111827?style=for-the-badge" alt="Fase Foundation">
</p>

<p align="center">
  <a href="https://github.com/Jairo0811/NutriFlow/actions/workflows/ci.yml">
    <img src="https://github.com/Jairo0811/NutriFlow/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <img src="https://img.shields.io/badge/arquitectura-Clean%20Architecture-0F172A" alt="Clean Architecture">
  <img src="https://img.shields.io/badge/base%20de%20datos-PostgreSQL%2017-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 17">
</p>

<p align="center">
  <strong>React Native · Expo · TypeScript · ASP.NET Core · PostgreSQL · Docker · GitHub Actions</strong>
</p>

> 🎓 **Origen académico:** NutriFlow parte de un conjunto de mockups desarrollado durante la asignatura **Bases de Datos 1 (INF-164)** de la **Universidad APEC (UNAPEC)**, en el período **Mayo - Agosto 2024**. En esa etapa no se desarrolló una aplicación funcional. La versión actual toma aquel prototipo como referencia conceptual y visual y construye por primera vez el producto como una aplicación móvil full-stack.

---

## 📖 Descripción

**NutriFlow** es una aplicación móvil de seguimiento nutricional orientada a ayudar a las personas a registrar su alimentación, visualizar calorías y macronutrientes, establecer objetivos personales y analizar su progreso desde una experiencia clara y consistente.

El proyecto actual **no es una migración ni una refactorización de una aplicación anterior**. La entrega académica de 2024 consistió exclusivamente en **mockups de prototipo** que representaban cómo podría funcionar una futura aplicación de nutrición.

En 2026 se retoma esa idea para convertirla en software real, creando desde cero:

- una aplicación móvil con React Native y Expo;
- una API con ASP.NET Core;
- persistencia relacional con PostgreSQL;
- autenticación y seguridad;
- lógica nutricional;
- integración con cámara y códigos de barras;
- analítica de progreso;
- infraestructura reproducible y CI.

La meta es evolucionar el concepto académico hasta convertirlo en un proyecto de portafolio con calidad suficiente para continuar hacia un producto real.

---

## 🕰️ Evolución del proyecto

```text
2024 — UNAPEC · INF-164
        │
        ├── Concepto de producto
        ├── Flujo de usuario
        └── Mockups de prototipo
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
        ├── PostgreSQL
        ├── Docker
        └── GitHub Actions
                │
                ▼
        Aplicación móvil full-stack
```

Esta separación permite conservar el valor histórico del trabajo universitario sin atribuirle implementaciones que no existieron en la entrega original.

---

## 🎓 Origen académico

El concepto que da origen a NutriFlow fue preparado como proyecto de **Bases de Datos 1 (INF-164)** en la **Universidad APEC (UNAPEC)**.

Durante aquella etapa el equipo produjo **mockups que definían visualmente la propuesta**, incluyendo pantallas para registro, perfil físico, nivel de actividad, preferencias alimentarias, objetivos, dashboard nutricional, comidas, escaneo y progreso.

Esas pantallas eran una **representación de funcionalidades propuestas**, no funcionalidades implementadas en software.

### 📚 Información académica

| Información | Detalle |
|---|---|
| 📖 Asignatura | Bases de Datos 1 (INF-164) |
| 👨‍🏫 Profesor | Ing. Pedro José Ramirez Rodriguez |
| 🏫 Institución | Universidad APEC (UNAPEC) |
| 📅 Período académico | Mayo - Agosto 2024 |
| 📁 Entrega original | Prototipo mediante mockups |
| 💻 Aplicación funcional en 2024 | No |
| 📱 Implementación actual | Aplicación móvil full-stack desarrollada desde cero |

### 👥 Equipo académico original

| 👤 Integrante | 🆔 Matrícula |
|---|---|
| Luis Alberto Jimenez Perez | A00102205 |
| Charlie de Leon Duran | A00108707 |
| Francisca Mariela Hernández Melo | A00113127 |
| Francis Jairo Matías Rosario | A00115261 |

---

## 🧩 Funcionalidades representadas en los mockups originales

El prototipo académico planteaba una experiencia de seguimiento nutricional compuesta por:

- registro e inicio de sesión;
- captura de sexo, fecha de nacimiento, altura y peso;
- selección del nivel de actividad física;
- preferencias alimentarias;
- alergias y restricciones;
- selección de alimentos;
- objetivos para perder grasa, mantener peso o aumentar masa muscular;
- dashboard de calorías y macronutrientes;
- organización de desayuno, almuerzo, cena y otras comidas;
- concepto de escaneo de alimentos;
- seguimiento de peso y progreso.

> Estas características describen lo **representado en los mockups de 2024**. Su implementación real forma parte del desarrollo actual de NutriFlow.

---

## 🎯 Visión del producto actual

NutriFlow busca resolver cinco necesidades principales:

| Necesidad | Respuesta de NutriFlow |
|---|---|
| Registrar lo que se consume diariamente | Diario estructurado de comidas, alimentos y porciones |
| Entender calorías y macronutrientes | Dashboard con objetivos, consumo y valores restantes |
| Adaptar la nutrición al usuario | Perfil físico, actividad, objetivo, alergias y preferencias |
| Registrar productos con rapidez | Búsqueda y escaneo mediante código de barras |
| Medir la evolución | Historial, peso, adherencia y analítica temporal |

### Principios del producto

- **Mobile-first:** la experiencia principal está diseñada para teléfonos.
- **Datos estructurados:** los cálculos nutricionales no dependen de texto libre.
- **Privacidad por diseño:** los datos personales y de salud requieren controles adecuados.
- **Dominio independiente:** las reglas de negocio no dependen de frameworks o persistencia.
- **Evolución incremental:** cada capacidad se incorpora mediante fases y pull requests.
- **Mantenibilidad:** Clean Code, SOLID, DRY, KISS y separación de responsabilidades.

---

## ✨ Alcance funcional de la nueva aplicación

### Núcleo de la primera versión estable

- autenticación y gestión de sesiones;
- perfil físico y nutricional;
- onboarding de objetivos;
- cálculo de TMB y TDEE;
- objetivos diarios de calorías y macronutrientes;
- catálogo de alimentos;
- registro de comidas y porciones;
- dashboard diario;
- escaneo de código de barras;
- historial de peso y progreso;
- alergias, restricciones y preferencias.

### Evolución posterior

- hidratación diaria;
- recetas y comidas frecuentes;
- favoritos y duplicación de comidas;
- creación manual de alimentos y recetas;
- historial y calendario nutricional;
- seguimiento de micronutrientes;
- comparación de productos;
- lista de compras;
- recomendaciones según macros restantes;
- objetivos intermedios;
- reportes y exportación de datos;
- funcionamiento offline y sincronización;
- integración futura con profesionales de nutrición.

> La inteligencia artificial, si se incorpora en etapas futuras, será una capa complementaria. Los cálculos de calorías, macronutrientes, TMB, TDEE y restricciones permanecerán basados en reglas determinísticas y datos estructurados.

---

## 🧱 Stack tecnológico

### 📱 Aplicación móvil

<p>
  <img src="https://skillicons.dev/icons?i=react,ts" alt="React y TypeScript">
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57">
</p>

| Área | Tecnología |
|---|---|
| Framework | React Native 0.86 |
| Plataforma | Expo SDK 57 |
| Lenguaje | TypeScript 6 |
| Navegación | Expo Router |
| Organización | Feature-based modular |

### ⚙️ Backend

<p>
  <img src="https://skillicons.dev/icons?i=dotnet,cs" alt=".NET y C#">
</p>

| Área | Tecnología |
|---|---|
| Plataforma | .NET 10 |
| API | ASP.NET Core Web API |
| Arquitectura | Clean Architecture |
| Contrato HTTP | OpenAPI |
| Observabilidad inicial | Health Checks |
| Persistencia | Entity Framework Core + Npgsql, planificado |

### 🗄️ Datos e infraestructura

<p>
  <img src="https://skillicons.dev/icons?i=postgres,docker,git,github,githubactions" alt="PostgreSQL, Docker, Git, GitHub y GitHub Actions">
</p>

- **PostgreSQL 17:** base de datos relacional principal.
- **Docker Compose:** infraestructura local reproducible.
- **Git:** control de versiones.
- **GitHub:** repositorio y colaboración.
- **GitHub Actions:** integración continua.

---

## 🏗️ Arquitectura

NutriFlow utiliza un monorepo que separa la aplicación móvil, la API y la documentación técnica.

```text
┌──────────────────────────────┐
│ React Native + Expo          │
│ NutriFlow Mobile             │
└──────────────┬───────────────┘
               │ HTTPS / JSON
               ▼
┌──────────────────────────────┐
│ ASP.NET Core Web API         │
│ NutriFlow.Api                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Application                  │
│ Casos de uso y contratos     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Domain                       │
│ Entidades y reglas           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Infrastructure               │
│ EF Core / PostgreSQL         │
└──────────────────────────────┘
```

### Dependencias del backend

```text
NutriFlow.Api
   ├── NutriFlow.Application
   └── NutriFlow.Infrastructure

NutriFlow.Infrastructure
   ├── NutriFlow.Application
   └── NutriFlow.Domain

NutriFlow.Application
   └── NutriFlow.Domain
```

`NutriFlow.Domain` permanece independiente de HTTP, persistencia, frameworks y servicios externos.

La documentación arquitectónica se encuentra en [`docs/architecture`](docs/architecture/README.md).

---

## 📂 Estructura del repositorio

```text
NutriFlow/
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   └── package.json
│   │
│   └── api/
│       └── src/
│           ├── NutriFlow.Api/
│           ├── NutriFlow.Application/
│           ├── NutriFlow.Domain/
│           └── NutriFlow.Infrastructure/
│
├── docs/
│   └── architecture/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .editorconfig
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## ✅ Estado actual

NutriFlow se encuentra en **Fase 0 — Foundation**.

| Componente | Estado |
|---|:---:|
| Concepto y mockups académicos de referencia | ✅ |
| Identidad NutriFlow | ✅ |
| Repositorio y estrategia Git | ✅ |
| Monorepo inicial | ✅ |
| React Native + Expo | ✅ |
| TypeScript | ✅ |
| Expo Router | ✅ |
| ASP.NET Core 10 | ✅ |
| Clean Architecture base | ✅ |
| Endpoint raíz de API | ✅ |
| Health check | ✅ |
| OpenAPI | ✅ |
| PostgreSQL 17 con Docker Compose | ✅ |
| GitHub Actions | ✅ |
| Persistencia con EF Core | ⏳ |
| Autenticación y sesiones | ⏳ |
| Onboarding nutricional | ⏳ |
| Motor nutricional | ⏳ |
| Catálogo de alimentos | ⏳ |
| Diario de comidas | ⏳ |
| Dashboard funcional | ⏳ |
| Escáner de código de barras | ⏳ |
| Seguimiento de progreso | ⏳ |

> **Leyenda:** ✅ disponible · 🔄 en progreso · ⏳ planificado

---

## 🗺️ Hoja de ruta

### Fase 0 — Foundation

- [x] Inicializar el repositorio.
- [x] Crear la aplicación móvil con Expo y TypeScript.
- [x] Crear el backend ASP.NET Core.
- [x] Definir `Api`, `Application`, `Domain` e `Infrastructure`.
- [x] Configurar PostgreSQL mediante Docker Compose.
- [x] Incorporar health checks y OpenAPI.
- [x] Configurar GitHub Actions.
- [x] Documentar arquitectura y origen académico.

### Fase 1 — Authentication & Identity

- [ ] Registro de usuarios.
- [ ] Inicio y cierre de sesión.
- [ ] JWT de corta duración.
- [ ] Refresh tokens rotativos.
- [ ] Revocación de sesiones.
- [ ] Recuperación de contraseña.
- [ ] Google Sign-In.

### Fase 2 — Nutritional Onboarding

- [ ] Datos físicos y demográficos.
- [ ] Nivel de actividad.
- [ ] Preferencias y restricciones.
- [ ] Selección de objetivo.

### Fase 3 — Nutrition Engine

- [ ] TMB y TDEE.
- [ ] Déficit, mantenimiento y superávit.
- [ ] Objetivos de calorías y macronutrientes.
- [ ] Recalibración ante cambios importantes de peso.

### Fase 4 — Food Catalog

- [ ] Catálogo nutricional.
- [ ] Búsqueda y filtros.
- [ ] Favoritos.
- [ ] Alimentos personalizados.
- [ ] Base para códigos de barras.

### Fase 5 — Meal Tracking

- [ ] Desayuno, almuerzo, cena y snacks.
- [ ] Porciones y cantidades.
- [ ] Totales diarios automáticos.
- [ ] Comidas frecuentes y duplicación.

### Fase 6 — Dashboard

- [ ] Calorías consumidas y restantes.
- [ ] Proteína, carbohidratos y grasas.
- [ ] Cumplimiento del objetivo diario.
- [ ] Accesos rápidos.

### Fase 7 — Barcode Scanner

- [ ] Escaneo mediante cámara.
- [ ] Resolución de productos por código.
- [ ] Selección de porción.
- [ ] Registro inmediato en el diario.

### Fase 8 — Progress

- [ ] Registro de peso.
- [ ] Gráficas semanales y mensuales.
- [ ] Objetivos intermedios.
- [ ] Historial de adherencia.

### Fase 9 — Allergies & Preferences

- [ ] Gestión de alergias.
- [ ] Exclusiones alimentarias.
- [ ] Advertencias de incompatibilidad.
- [ ] Preferencias configurables.

### Fase 10 — Production Readiness

- [ ] Pruebas automatizadas.
- [ ] Seguridad y hardening.
- [ ] Telemetría y observabilidad.
- [ ] Documentación operativa.
- [ ] Pipeline de release.
- [ ] Primera versión estable `v1.0.0`.

---

## 🚀 Ejecución local

### Requisitos

- .NET SDK 10.
- Node.js y npm.
- Docker Desktop o Docker Engine con Docker Compose.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jairo0811/NutriFlow.git
cd NutriFlow
```

### 2. Levantar PostgreSQL

```bash
docker compose up -d
```

### 3. Ejecutar la API

```bash
dotnet restore apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj
dotnet run --project apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj
```

Health check:

```text
/health
```

### 4. Ejecutar la aplicación móvil

```bash
cd apps/mobile
npm install
npm start
```

Expo permitirá abrir el proyecto en un dispositivo compatible, emulador o entorno soportado durante el desarrollo.

---

## 🔐 Seguridad y privacidad

NutriFlow manejará información personal y potencialmente sensible relacionada con hábitos, características físicas y objetivos del usuario. Por ello, la arquitectura contempla desde el inicio:

- autenticación robusta;
- contraseñas almacenadas mediante hashing seguro;
- access tokens de corta duración;
- refresh tokens rotativos y revocables;
- validación de entrada en backend;
- autorización aplicada en servidor;
- configuración sensible mediante variables de entorno;
- ausencia de secretos reales en el repositorio;
- minimización de los datos almacenados;
- trazabilidad para operaciones sensibles cuando corresponda.

> NutriFlow es una herramienta de seguimiento y organización nutricional. No sustituye evaluación, diagnóstico ni tratamiento proporcionado por profesionales de salud.

---

## 🌿 Filosofía de desarrollo

El proyecto se desarrolla de forma incremental bajo los siguientes criterios:

- Clean Code;
- principios SOLID;
- DRY;
- KISS;
- arquitectura modular;
- separación de responsabilidades;
- seguridad por diseño;
- pruebas automatizadas progresivas;
- pull requests pequeños y revisables;
- CI antes de integrar cambios en `main`.

Flujo de ramas previsto:

```text
main
 └── feature/*
```

Cada fase debe mantener el repositorio ejecutable y documentado antes de avanzar a la siguiente.

---

## 👨‍💻 Evolución y mantenimiento

La nueva implementación de **NutriFlow** es desarrollada y mantenida por **Francis Jairo Matías Rosario**, retomando el concepto creado junto al equipo académico de 2024 y llevándolo por primera vez a una implementación móvil funcional.

---

## 🙏 Créditos

- **Universidad:** Universidad APEC (UNAPEC)
- **Asignatura:** Bases de Datos 1
- **Código:** INF-164
- **Período:** Mayo - Agosto 2024
- **Profesor:** Ing. Pedro José Ramirez Rodriguez
- **Entrega original:** prototipo mediante mockups
- **Equipo original:** Luis Alberto Jimenez Perez, Charlie de Leon Duran, Francisca Mariela Hernández Melo y Francis Jairo Matías Rosario
- **Implementación móvil actual y mantenimiento:** Francis Jairo Matías Rosario

---

<p align="center">
  <strong>De prototipo académico a aplicación móvil real.</strong>
</p>
