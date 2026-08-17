# Security Policy

## Supported development line

NutriFlow se encuentra en desarrollo activo. Antes de `v1.0.0`, las correcciones de seguridad se aplican sobre `main` y sobre las ramas de fase activas cuando corresponda.

## Principios

- No versionar secretos, credenciales ni claves de firma reales.
- Las contraseñas se almacenan únicamente como hashes derivados con salt individual.
- Los refresh tokens y tokens de recuperación se almacenan únicamente como hashes.
- Los tokens de acceso tienen vida corta y los refresh tokens se rotan.
- Los cambios de autenticación deben pasar compilación, pruebas y revisión de dependencias en CI.

## Dependencias móviles: advisories conocidos

A fecha **2026-08-17**, `npm audit` reporta vulnerabilidades de severidad alta en `image-size`, dependencia transitiva de Metro/Expo. Los advisories `GHSA-w3rx-r6r6-pgpr` y `GHSA-5p2g-fcmc-qvqq` afectan a `image-size <= 2.0.2` y actualmente no tienen una versión corregida publicada.

`npm audit fix --force` propone degradar Expo a una versión incompatible con la línea tecnológica actual, por lo que NutriFlow no aplicará automáticamente cambios disruptivos que rompan el SDK móvil.

CI mantiene el reporte visible y bloquea vulnerabilidades **críticas**. Este riesgo debe revisarse cuando Expo/Metro o `image-size` publiquen una ruta de actualización compatible.

## Reporte de vulnerabilidades

No publiques secretos, tokens, credenciales ni detalles explotables de una vulnerabilidad en issues públicos. Para un despliegue comercial se deberá habilitar un canal privado de reporte antes de publicar `v1.0.0`.
