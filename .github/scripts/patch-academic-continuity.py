from pathlib import Path
import re

path = Path('README.md')
text = path.read_text(encoding='utf-8')
section = '''## 🧭 Continuidad académica

**NutriFlow** documenta su continuidad académica mediante relaciones verificables entre estudiantes y profesores. En la colección actual no se ha identificado un compañero recurrente del equipo original, pero sí existe una **continuidad docente** con [**Digital Sanctuary**](https://github.com/Jairo0811/DigitalSanctuary).

### 👥 Continuidad por estudiante

Dentro de los proyectos académicos actualmente documentados en este portafolio no se ha verificado que **Luis Alberto Jimenez Perez (A00102205)**, **Charlie de Leon Duran (A00108707)** o **Francisca Mariela Hernández Melo (A00113127)** vuelvan a coincidir con Francis Jairo Matías Rosario en otro equipo por **mismo nombre completo y misma matrícula**.

Por ello, NutriFlow no presenta una continuidad estudiantil directa con otro proyecto de la colección en este momento.

### 👨‍🏫 Continuidad por profesor

El profesor **Ing. Pedro José Ramirez Rodriguez** aparece en dos momentos diferentes de la trayectoria académica documentada en UNAPEC. La secuencia comienza en **Bases de Datos 1 (INF-164)** con NutriFlow y reaparece dos años después en **Desarrollo de Software con Tecnología Propietaria 2 (ISO-710)** con Digital Sanctuary.

| Orden | Asignatura | Proyecto | Período | Profesor recurrente |
|---:|---|---|---|---|
| 1 | Bases de Datos 1 (INF-164) | **NutriFlow** | Mayo - Agosto 2024 | **Ing. Pedro José Ramirez Rodriguez** |
| 2 | Desarrollo de Software con Tecnología Propietaria 2 (ISO-710) | [**Digital Sanctuary**](https://github.com/Jairo0811/DigitalSanctuary) | Mayo - Agosto 2026 | **Ing. Pedro José Ramirez Rodriguez** |

La relación es **formativa y cronológica**: los proyectos son independientes y la continuidad se fundamenta en el mismo profesor en dos etapas diferentes de la carrera.
'''
pattern = r'## 🧭 Continuidad académica.*?(?=\n---\n\n## 🧩 Funcionalidades representadas)'
new = re.sub(pattern, section.rstrip(), text, flags=re.S)
if new == text:
    raise SystemExit('Continuity section not found')
path.write_text(new, encoding='utf-8')
