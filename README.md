<p align="center">
  <strong style="font-size: 2rem;">NutriFlow</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/UNAPEC-INF--164-003B70?style=for-the-badge" alt="UNAPEC INF-164">
</p>

<p align="center">
  <strong>Nutrición, hábitos y progreso en una sola experiencia móvil.</strong><br>
  Reconstrucción profesional de un proyecto académico de Bases de Datos 1, evolucionado como aplicación móvil full-stack.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-F5A623?style=for-the-badge" alt="Estado en desarrollo">
  <img src="https://img.shields.io/badge/Versión-0.1.0-22C55E?style=for-the-badge" alt="Versión 0.1.0">
  <img src="https://img.shields.io/badge/Fase-Foundation-111827?style=for-the-badge" alt="Fase Foundation">
  <img src="https://img.shields.io/badge/Proyecto-Académico%20%2B%20Portafolio-7C3AED?style=for-the-badge" alt="Proyecto académico y portafolio">
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

> 🎓 Proyecto académico originado en **Bases de Datos 1 (INF-164)** de la **Universidad APEC (UNAPEC)** durante el período **Mayo - Agosto 2024**, impartido por el **Ing. Pedro José Ramirez Rodriguez**. La versión actual reconstruye y amplía aquella propuesta con una arquitectura moderna orientada a producto.

---

## 📖 Descripción

**NutriFlow** es una aplicación móvil para el seguimiento nutricional y de hábitos alimenticios. Su objetivo es ayudar al usuario a registrar lo que consume, comprender su distribución de calorías y macronutrientes, definir objetivos personales y visualizar su evolución de forma clara.

El concepto nace de un proyecto académico de UNAPEC cuyo prototipo contemplaba registro e inicio de sesión, captura de datos físicos, selección de nivel de actividad, preferencias alimentarias, alergias, objetivos de composición corporal, registro de alimentos, escaneo de productos, dashboard nutricional y seguimiento de progreso.

La reconstrucción profesional conserva ese núcleo funcional y lo transforma en un producto full-stack preparado para incorporar persistencia real, seguridad, analítica, recomendaciones, reportes e integraciones móviles.

### Principios del producto

- experiencia móvil simple y centrada en el usuario;
- cálculos nutricionales determinísticos y auditables;
- separación estricta entre dominio, infraestructura y presentación;
- seguridad y privacidad por diseño;
- arquitectura modular y preparada para crecer;
- código mantenible siguiendo Clean Code, SOLID, DRY y KISS;
- evolución incremental mediante ramas, pull requests y CI.

---

## 🎯 Problema y propuesta de valor

| Necesidad | Respuesta de NutriFlow |
|---|---|
| Dificultad para saber cuánto se consume realmente | Registro estructurado de alimentos, porciones, calorías y macros |
| Objetivos nutricionales poco claros | Metas calculadas a partir del perfil físico, actividad y objetivo |
| Seguimiento disperso entre notas y aplicaciones distintas | Dashboard diario, historial y progreso centralizados |
| Productos sin información inmediata | Escaneo de código de barras y consulta nutricional |
| Alergias y restricciones alimentarias | Preferencias, exclusiones y advertencias durante el registro |
| Poca visibilidad del avance | Evolución de peso, adherencia y métricas semanales/mensuales |

---

## 🎓 Origen del proyecto

La primera propuesta de NutriFlow fue desarrollada como proyecto académico de la asignatura **Bases de Datos 1 (INF-164)** en la **Universidad APEC (UNAPEC)**.

La versión de 2024 definió el concepto funcional y los mockups de la aplicación. La versión actual utiliza ese trabajo como referencia histórica y de producto, pero se reconstruye desde cero con una nueva base de código, arquitectura, stack tecnológico e identidad visual.

### 👥 Equipo académico original

| 👤 Integrante | 🆔 Matrícula |
|---|---|
| Luis Alberto Jimenez Perez | A00102205 |
| Charlie de Leon Duran | A00108707 |
| Francisca Mariela Hernández Melo | A00113127 |
| Francis Jairo Matías Rosario | A00115261 |

### 📚 Información académica

| Información | Detalle |
|---|---|
| 📖 Asignatura | Bases de Datos 1 (INF-164) |
| 👨‍🏫 Profesor | Ing. Pedro José Ramirez Rodriguez |
| 🏫 Institución | Universidad APEC (UNAPEC) |
| 📅 Período académico | Mayo - Agosto 2024 |
| 📁 Tipo de proyecto | Proyecto académico de aplicación móvil / base de datos |

---

## ✨ Alcance funcional

### Funcionalidades heredadas del concepto académico

- registro e inicio de sesión;
- captura de sexo, fecha de nacimiento, altura y peso;
- nivel de actividad física;
- selección de alimentos y preferencias;
- alergias y restricciones;
- objetivos: perder grasa, mantener peso o aumentar masa muscular;
- dashboard de calorías y macronutrientes;
- registro de desayuno, almuerzo, cena y otras comidas;
- escaneo de alimentos mediante código de barras;
- seguimiento de peso y progreso.

### Evolución planificada

- cálculo de TMB, TDEE y objetivos nutricionales;
- historial y calendario nutricional;
- hidratación diaria;
- recetas y comidas frecuentes;
- favoritos y duplicación de comidas;
- creación manual de alimentos y recetas;
- lista de compras;
- comparación de productos;
- seguimiento de micronutrientes;
- recomendaciones basadas en macros restantes;
- reportes y exportación de datos;
- integración futura con profesionales de nutrición;
- funcionamiento offline y sincronización posterior.

> La inteligencia artificial, cuando se incorpore, será complementaria. Los cálculos de calorías, macronutrientes y objetivos permanecerán basados en reglas y datos estructurados.

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
| UI base | React Native |

La aplicación móvil crecerá siguiendo una organización **feature-based**, evitando acoplar navegación, lógica de negocio y acceso a servicios externos.

### ⚙️ Backend

<p>
  <img src="https://skillicons.dev/icons?i=dotnet,cs" alt=".NET y C#">
</p>

| Área | Tecnología |
|---|---|
| Plataforma | .NET 10 |
| API | ASP.NET Core Web API |
| Contrato HTTP | OpenAPI |
| Arquitectura | Clean Architecture |
| Observabilidad inicial | Health Checks |
| ORM | Entity Framework Core / Npgsql, planificado para persistencia |

### 🗄️ Datos e infraestructura

<p>
  <img src="https://skillicons.dev/icons?i=postgres,docker,git,github,githubactions" alt="PostgreSQL, Docker, Git, GitHub y GitHub Actions">
</p>

- **PostgreSQL 17:** base de datos relacional principal.
- **Docker Compose:** entorno local reproducible para infraestructura.
- **Git y GitHub:** control de versiones y colaboración.
- **GitHub Actions:** integración continua para backend y aplicación móvil.

---

## 🏗️ Arquitectura

NutriFlow utiliza un monorepo con separación explícita entre cliente móvil, backend y documentación.

```text
┌──────────────────────────────┐
│ React Native + Expo          │
│ NutriFlow Mobile             │
└──────────────┬───────────────┘
               │ HTTPS / JSON
               ▼
┌──────────────────────────────┐
│ ASP.NET Core Web API         │
│ Presentation / API           │
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

El dominio no debe depender de frameworks, almacenamiento, HTTP ni detalles de infraestructura.

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

| Componente | Estado |
|---|:---:|
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
| Dashboard real | ⏳ |
| Escáner de código de barras | ⏳ |
| Seguimiento de progreso | ⏳ |

> **Leyenda:** ✅ implementado · 🔄 en progreso · ⏳ planificado

---

## 🗺️ Hoja de ruta

### Fase 0 — Foundation

- [x] Inicializar repositorio.
- [x] Crear aplicación móvil con Expo y TypeScript.
- [x] Crear backend ASP.NET Core.
- [x] Definir proyectos `Api`, `Application`, `Domain` e `Infrastructure`.
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
- [ ] Integración de Google Sign-In.

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
- [ ] Búsqueda, filtros y favoritos.
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
- Docker Desktop o Docker Engine con Compose.
- Git.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jairo0811/NutriFlow.git
cd NutriFlow
```

### 2. Iniciar PostgreSQL

```bash
docker compose up -d
```

La configuración local crea la base `NutriFlowDb` sobre PostgreSQL 17.

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

Desde Expo se podrá abrir el proyecto en Android, iOS o web según el entorno disponible.

> Las credenciales incluidas en `docker-compose.yml` son exclusivamente para desarrollo local y deberán sustituirse por secretos administrados antes de cualquier despliegue real.

---

## 🔄 Flujo de desarrollo

```text
main
 └── feature/*
       ↓
 Pull Request
       ↓
 GitHub Actions
       ↓
 revisión
       ↓
 merge
```

Las funcionalidades se incorporarán mediante cambios pequeños y verificables, evitando integrar trabajo incompleto directamente en `main`.

---

## 🔐 Consideraciones de seguridad

La evolución del proyecto deberá mantener como mínimo:

- contraseñas almacenadas únicamente mediante hash fuerte;
- access tokens de corta duración;
- refresh tokens revocables y almacenados de forma segura;
- validación de entradas en backend;
- secretos fuera del repositorio;
- autorización aplicada en API y nunca delegada solo a la interfaz;
- límites y validaciones para archivos o imágenes futuras;
- minimización de datos personales y nutricionales almacenados;
- exportación y eliminación controlada de información del usuario.

---

## 👨‍💻 Evolución y mantenimiento

**Francis Jairo Matías Rosario**  
🎓 Ingeniería de Software — Universidad APEC (UNAPEC)  
🆔 Matrícula: **A00115261**

La reconstrucción, evolución técnica y mantenimiento de esta versión de **NutriFlow** se realizan como proyecto de portafolio a partir del concepto académico original desarrollado por el equipo de INF-164.

---

## 🙏 Créditos

- **Universidad:** Universidad APEC (UNAPEC)
- **Asignatura:** Bases de Datos 1
- **Código:** INF-164
- **Profesor:** Ing. Pedro José Ramirez Rodriguez
- **Período académico:** Mayo - Agosto 2024
- **Equipo académico original:** Luis Alberto Jimenez Perez, Charlie de Leon Duran, Francisca Mariela Hernández Melo y Francis Jairo Matías Rosario
- **Evolución y mantenimiento de NutriFlow:** Francis Jairo Matías Rosario

---

<p align="center">
  Desarrollado con ❤️ como evolución de un proyecto académico de UNAPEC.
</p>
