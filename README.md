# NutriFlow

NutriFlow es una aplicación móvil de nutrición y seguimiento de hábitos alimenticios. El proyecto nace de una propuesta académica desarrollada en UNAPEC y se reconstruye como una aplicación full-stack moderna, mantenible y preparada para evolucionar a producto.

## Estado

**Fase actual:** `v0.1.0 — Foundation`

La base técnica inicial incluye aplicación móvil, API, arquitectura modular, PostgreSQL con Docker y CI.

## Origen académico

**Universidad:** UNAPEC  
**Materia:** Bases de Datos 1 (INF-164)  
**Periodo académico:** Mayo - Agosto 2024  
**Profesor:** Ing. Pedro José Ramirez Rodriguez

### Grupo original

| Integrante | Matrícula |
|---|---|
| Francis Jairo Matías Rosario | A00115261 |
| Charlie de Leon Duran | A00108707 |
| Francisca Mariela Hernández Melo | A00113127 |
| Luis Alberto Jimenez Perez | A00102205 |

## Visión del producto

NutriFlow permitirá registrar la alimentación diaria, controlar calorías y macronutrientes, establecer objetivos nutricionales, gestionar alergias y preferencias, escanear productos y visualizar la evolución del usuario.

La reconstrucción amplía el concepto académico para incorporar progresivamente historial nutricional, recetas, hidratación, recomendaciones, analítica, reportes y otras funcionalidades orientadas a una experiencia real de seguimiento nutricional.

## Stack

### Mobile

- React Native
- Expo SDK 57
- TypeScript
- Expo Router

### Backend

- ASP.NET Core 10 Web API
- .NET 10
- Clean Architecture
- OpenAPI
- Health Checks

### Datos e infraestructura

- PostgreSQL
- Entity Framework Core / Npgsql (siguiente etapa de persistencia)
- Docker Compose
- GitHub Actions

## Estructura

```text
NutriFlow/
├── apps/
│   ├── mobile/
│   └── api/
│       └── src/
│           ├── NutriFlow.Api/
│           ├── NutriFlow.Application/
│           ├── NutriFlow.Domain/
│           └── NutriFlow.Infrastructure/
├── docs/
│   └── architecture/
├── .github/
│   └── workflows/
├── .editorconfig
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Arquitectura

El backend sigue Clean Architecture para mantener las reglas de negocio independientes de frameworks, persistencia e infraestructura. La aplicación móvil crecerá mediante módulos por feature.

La documentación arquitectónica se encuentra en [`docs/architecture`](docs/architecture/README.md).

## Ejecución local

### Base de datos

```bash
docker compose up -d
```

### API

```bash
dotnet run --project apps/api/src/NutriFlow.Api/NutriFlow.Api.csproj
```

Health check:

```text
/health
```

### Mobile

```bash
cd apps/mobile
npm install
npm start
```

## Roadmap inicial

1. Foundation
2. Authentication & Identity
3. Nutritional Onboarding
4. Nutrition Engine
5. Food Catalog
6. Meal Tracking
7. Dashboard
8. Barcode Scanner
9. Progress
10. Allergies & Preferences
11. Production Readiness

## Desarrollo

Se utilizarán cambios incrementales mediante ramas `feature/*` y pull requests hacia `main`, manteniendo Clean Code, SOLID, DRY, KISS, separación de responsabilidades y revisión continua mediante CI.
