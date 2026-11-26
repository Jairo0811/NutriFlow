# NutriFlow — Tráiler oficial (código fuente)

Proyecto de producción audiovisual **independiente** del código de la app: vive en `trailer/` y no toca `apps/mobile`, `apps/api`, sus dependencias ni su versión.

- **Formatos**: 16:9 (1920×1080) y 9:16 (1080×1920). Cada uno tiene su propia composición, no es un recorte del otro.
- **Duración**: 45 s · 30 FPS · MP4 H.264 + AAC.
- **Herramientas**: [Remotion](https://www.remotion.dev) (React) para la imagen, NumPy/SciPy para la música y efectos, FFmpeg para mezclar y codificar.

## Cómo volver a renderizar

Requisitos: Node 20+, FFmpeg, Python 3 con `numpy` y `scipy`.

```bash
cd trailer
npm ci
./scripts/render.sh
```

Salida en `trailer/out/`:

| Archivo | Descripción |
|---|---|
| `NutriFlow-Trailer-16x9.mp4` | Horizontal, con música y efectos (sin narración) |
| `NutriFlow-Trailer-9x16.mp4` | Vertical, con música y efectos (sin narración) |
| `silent-16x9.mp4`, `silent-9x16.mp4` | Solo imagen, sin audio |

Si Remotion no puede descargar su Chromium (red restringida), indica uno local: `BROWSER=/ruta/a/chrome ./scripts/render.sh`.

Vista previa interactiva: `npx remotion studio src/index.ts`. Un fotograma suelto: `npx remotion still src/index.ts Trailer16x9 frame.png --frame=300`.

## Estructura

```
trailer/
├── src/
│   ├── theme.ts        paleta (igual que la app), FPS y tiempos de escena
│   ├── kit.tsx         fondo, teléfono, tarjetas, titulares, logo, iconos
│   ├── scenes1.tsx     escenas 1–3
│   ├── scenes2.tsx     escenas 4–7 y tarjeta institucional
│   └── Trailer.tsx     montaje y transiciones
├── audio/make_audio.py música y efectos originales (120 BPM)
├── public/             capturas reales, logos, recortes de alimentos, fuentes
├── scripts/render.sh   renderizado + mezcla
├── GUION.md            guion de narración (sin voz generada)
└── CREDITOS.md         recursos y licencias
```

## Narración

No se generó voz: el entorno de producción no dispone de un motor de síntesis con calidad humana suficiente, y el encargo prohíbe sustituirla por una voz robótica. El guion completo, con tiempos, está en [`GUION.md`](GUION.md). Para añadir una locución grabada: `ffmpeg -i out/NutriFlow-Trailer-16x9.mp4 -i locucion.wav -filter_complex "[0:a]volume=0.55[m];[m][1:a]amix=inputs=2:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac salida.mp4`.

## Honestidad del contenido

- Las pantallas de la app son **capturas reales** (`docs/screenshots/`); no se alteraron textos ni cifras. Los valores mostrados en las tarjetas (2891 kcal restantes, 5/188 g, 20/339 g, 3/100 g, 218.5 lb) son los de esas capturas.
- El escáner se muestra solo hasta la solicitud de permiso de cámara; **no se simula una lectura exitosa**. La animación del código de barras es un gráfico genérico.
- La línea del gráfico de progreso es decorativa (no representa datos reales).
- Las funciones de IA se presentan como capacidades implementadas, con la nota «requiere configurar el servicio». No se anuncia disponibilidad en Google Play ni App Store.
