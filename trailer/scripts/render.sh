#!/usr/bin/env bash
# Renderiza los dos tráilers (16:9 y 9:16), genera/actualiza la música y los mezcla.
# Requisitos: Node 20+, FFmpeg, Python 3 con numpy y scipy.
# Variable opcional: BROWSER=/ruta/a/chrome  (si no se define, Remotion descarga su propio Chromium).
set -euo pipefail
cd "$(dirname "$0")/.."
BROWSER_ARGS=()
if [[ -n "${BROWSER:-}" ]]; then BROWSER_ARGS=(--browser-executable="$BROWSER" --chrome-mode=chrome-for-testing); fi
mkdir -p out
[[ -d node_modules ]] || npm ci
[[ -f audio/music-sfx.wav ]] || python3 audio/make_audio.py

for pair in "Trailer16x9:16x9" "Trailer9x16:9x16"; do
  comp="${pair%%:*}"; tag="${pair##*:}"
  echo "▶ Renderizando $comp (video sin audio)…"
  npx remotion render src/index.ts "$comp" "out/silent-$tag.mp4" --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=2 "${BROWSER_ARGS[@]}"
  echo "▶ Mezclando audio ($tag)…"
  ffmpeg -y -loglevel error -i "out/silent-$tag.mp4" -i audio/music-sfx.wav \
    -c:v copy -c:a aac -b:a 192k -ar 44100 \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11,apad" -t 45 -shortest -movflags +faststart \
    "out/NutriFlow-Trailer-$tag.mp4"
done
echo "✔ Listo: out/NutriFlow-Trailer-16x9.mp4 y out/NutriFlow-Trailer-9x16.mp4"
