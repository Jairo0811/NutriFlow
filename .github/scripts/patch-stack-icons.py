from pathlib import Path

p = Path('README.md')
s = p.read_text(encoding='utf-8')
s = s.replace('### 📱 Mobile\n\n', '### 📱 Mobile / Frontend\n\n<p>\n  <img src="https://skillicons.dev/icons?i=react,ts" alt="React Native y TypeScript" />\n  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK 57" />\n</p>\n\n')
s = s.replace('### ⚙️ Backend\n\n', '### ⚙️ Backend\n\n<p>\n  <img src="https://skillicons.dev/icons?i=cs,dotnet" alt="C# y .NET" />\n</p>\n\n')
old = '''### 🗄️ Datos e infraestructura

- PostgreSQL 17;
- Docker Compose;
- Git y GitHub;
- GitHub Actions.
'''
new = '''### 🗄️ Datos

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
'''
if old not in s:
    raise SystemExit('NutriFlow data block not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')
