from pathlib import Path
import re

path = Path("README.md")
text = path.read_text(encoding="utf-8")

section = """## 🧭 Continuidad académica

**NutriFlow** representa el primer punto documentado de una continuidad académica con el profesor **Ing. Pedro José Ramirez Rodriguez** en la Universidad APEC (UNAPEC). La relación con [**Digital Sanctuary**](https://github.com/Jairo0811/DigitalSanctuary) es **formativa y cronológica**: son proyectos independientes desarrollados en asignaturas distintas, pero conectados por la presencia del mismo docente en dos etapas diferentes de la carrera.

La secuencia comenzó en **Mayo - Agosto de 2024** con **Bases de Datos 1 (INF-164)**, donde surgió el prototipo académico que dio origen a NutriFlow. Dos años después, en **Mayo - Agosto de 2026**, la continuidad docente reapareció en **Desarrollo de Software con Tecnología Propietaria 2 (ISO-710)** con Digital Sanctuary.

| Orden | Código | Asignatura | Proyecto | Período | Enfoque académico |
|---:|---|---|---|---|---|
| 1 | INF-164 | Bases de Datos 1 | **NutriFlow** | Mayo - Agosto 2024 | Fundamentos de datos, modelado y prototipado de una solución nutricional |
| 2 | ISO-710 | Desarrollo de Software con Tecnología Propietaria 2 | [**Digital Sanctuary**](https://github.com/Jairo0811/DigitalSanctuary) | Mayo - Agosto 2026 | Construcción y evolución de una aplicación Android a partir de un prototipo con IA |

Vistos en conjunto, ambos proyectos muestran una evolución desde fundamentos de datos y diseño conceptual hacia la construcción de software móvil moderno. Cada repositorio conserva su identidad académica original; la continuidad se fundamenta en el **mismo profesor**, no en una dependencia técnica entre las aplicaciones."""

updated = re.sub(
    r"## 🔗 Continuidad académica.*?(?=\n\n---\n\n## 🧩 Funcionalidades)",
    section,
    text,
    flags=re.S,
)
if updated == text:
    raise SystemExit("Continuity block not found")
path.write_text(updated, encoding="utf-8")
