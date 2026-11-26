#!/usr/bin/env bash
# Smoke de APK instalado en Android emulado, sin simular permisos de cámara.
set -euo pipefail
mkdir -p artifacts/android
APK=apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
test -s "$APK"
adb install -r "$APK"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000

pushd apps/mobile >/dev/null
CI=1 EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_API_URL=http://127.0.0.1:5000 npx expo start --offline --port 8081 --clear > ../../artifacts/android/metro.log 2>&1 &
METRO_PID=$!
popd >/dev/null
trap 'kill "$METRO_PID" 2>/dev/null || true' EXIT

ready=0
for _ in $(seq 1 50); do
  if curl -fsS http://127.0.0.1:8081/status 2>/dev/null | grep -q 'packager-status:running'; then
    ready=1
    break
  fi
  sleep 2
done
if [[ "$ready" -ne 1 ]]; then
  echo "Metro no quedó listo"
  exit 1
fi

adb shell am start -W -n com.jairomatias.nutriflow/.MainActivity
found=0
for _ in $(seq 1 25); do
  sleep 4
  adb shell uiautomator dump /sdcard/nutriflow-ui.xml >/dev/null 2>&1 || true
  adb shell cat /sdcard/nutriflow-ui.xml > artifacts/android/ui.xml 2>/dev/null || true
  if grep -q 'Bienvenido de nuevo' artifacts/android/ui.xml; then
    found=1
    break
  fi
done

adb exec-out screencap -p > artifacts/android/login.png
adb logcat -d -t 280 > artifacts/android/logcat-tail.txt 2>/dev/null || true
test -s artifacts/android/login.png
if [[ "$found" -ne 1 ]]; then
  echo "Login no visible: revisar screenshot y UI XML."
  exit 1
fi
echo "PASS: APK instalado, Android emulado arrancado y pantalla login visible"
python3 scripts/smoke-android-journey.py
