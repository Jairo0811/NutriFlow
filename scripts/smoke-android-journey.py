#!/usr/bin/env python3
"""Recorrido Android UI -> API real en emulador; sin herramientas adicionales."""
import json
import os
import re
import subprocess
import sys
import time
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

BASE = "http://127.0.0.1:5000"
OUT = Path("artifacts/android")
OUT.mkdir(parents=True, exist_ok=True)
TODAY = datetime.now(ZoneInfo("America/Santo_Domingo")).date().isoformat()
IDENTIFIER = uuid.uuid4().hex[:10]
EMAIL = f"ci-android-{IDENTIFIER}@example.invalid"
PASSWORD = "NutriFlow2026!"
FOOD_NAME = "Alimento QA Android " + IDENTIFIER
USERNAME = "Smoke Android"


def api(method, path, token=None, body=None, expected=200):
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
    req = Request(BASE + path, headers=headers, data=data, method=method)
    try:
        with urlopen(req, timeout=30) as response:
            status, raw = response.status, response.read()
    except HTTPError as error:
        status, raw = error.code, error.read()
    if status != expected:
        raise AssertionError(f"API {method} {path}: {status} (esperado {expected}): {raw[:350]!r}")
    return json.loads(raw) if raw else None


def run(*args, timeout=45):
    return subprocess.run(args, text=True, capture_output=True, timeout=timeout, check=True).stdout


def adb(*args, timeout=45):
    return run("adb", *args, timeout=timeout)


def capture(tag):
    image = OUT / f"{tag}.png"
    image.write_bytes(subprocess.check_output(["adb", "exec-out", "screencap", "-p"], timeout=30))
    if image.stat().st_size < 12000:
        raise AssertionError(f"Captura PNG sospechosamente vacía: {tag}")
    print(f"CAPTURA {image}", flush=True)


def hierarchy():
    try:
        adb("shell", "uiautomator", "dump", "/sdcard/nutriflow-journey.xml", timeout=50)
        raw = adb("shell", "cat", "/sdcard/nutriflow-journey.xml", timeout=30)
        (OUT / "journey-last-ui.xml").write_text(raw, encoding="utf-8")
        return ET.fromstring(raw)
    except Exception:
        return ET.Element("hierarchy")


def nodes(root):
    return [n.attrib for n in root.iter("node")]


def find(root, label, exact=True):
    for n in nodes(root):
        for value in (n.get("text", ""), n.get("content-desc", "")):
            if value and (value == label if exact else label in value):
                return n
    return None


def visible(root):
    return [x for n in nodes(root) if (x := n.get("text") or n.get("content-desc"))]


def wait_for(label, seconds=80, exact=True):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        root = hierarchy()
        node = find(root, label, exact)
        if node:
            return node
        time.sleep(1)
    summary = visible(root)
    print(f"NO ENCONTRADO: {label}; visibles: {summary[:65]!r}", flush=True)
    capture("error-" + re.sub(r"\W+", "-", label.lower())[:36])
    raise AssertionError("No aparece en Android: " + label)


def tap_node(node):
    bounds = node["bounds"]
    parts = [int(x) for x in re.findall(r"\d+", bounds)]
    if len(parts) != 4:
        raise AssertionError(f"Sin coordenadas: {bounds}")
    x = (parts[0] + parts[2]) // 2
    y = (parts[1] + parts[3]) // 2
    adb("shell", "input", "tap", str(x), str(y))
    time.sleep(.45)


def tap(label, seconds=35, exact=True):
    tap_node(wait_for(label, seconds, exact))


def type_into(label, value):
    tap(label)
    adb("shell", "input", "text", value, timeout=20)
    time.sleep(.5)


def swipe(direction="up"):
    if direction == "up":
        adb("shell", "input", "swipe", "540", "1830", "540", "660", "380")
    else:
        adb("shell", "input", "swipe", "540", "680", "540", "1800", "380")
    time.sleep(.6)


def scroll_and_tap(label):
    for direction in ("up", "down"):
        for _ in range(4):
            root = hierarchy()
            item = find(root, label)
            if item:
                tap_node(item)
                return
            swipe(direction)
    wait_for(label, seconds=10)


def prepare_test_user():
    session = api("POST", "/api/auth/register", expected=201, body={
        "email": EMAIL, "displayName": USERNAME, "password": PASSWORD,
    })
    token = session["accessToken"]
    api("PUT", "/api/onboarding/physical-profile", token, body={
        "dateOfBirth": "1998-06-12", "biologicalSex": "Male", "heightFeet": 5,
        "heightInches": 8, "currentWeightPounds": 220,
    })
    api("PUT", "/api/onboarding/activity", token, body={"activityLevel": "Moderate"})
    api("PUT", "/api/onboarding/goal", token, body={
        "goalType": "MaintainWeight", "targetWeightPounds": None,
    })
    api("PUT", "/api/onboarding/preferences", token, body={"codes": ["fruits"]})
    api("PUT", "/api/onboarding/restrictions", token, body={"codes": ["milk"]})
    profile = api("POST", "/api/onboarding/complete", token)
    assert profile["isCompleted"], "No se completó el perfil"
    food = api("POST", "/api/foods/", token, expected=201, body={
        "name": FOOD_NAME, "brand": "NutriFlow CI", "category": "fruit",
        "servingSize": 1, "servingUnit": "unidad", "calories": 120,
        "proteinGrams": 5, "carbohydrateGrams": 20, "fatGrams": 3,
        "barcode": None, "allergenCodes": [],
    })
    meals = api("POST", "/api/meals/entries", token, body={
        "date": TODAY, "mealType": "Breakfast", "foodId": food["id"], "servings": 1,
    })
    assert meals["calories"] == 120
    api("POST", "/api/progress/weight", token, body={
        "date": TODAY, "weightPounds": 218.5, "note": "Test Android",
    })
    print("PASS: usuario, onboarding y datos nutricionales reales preparados", flush=True)


def journey():
    wait_for("Bienvenido de nuevo")
    capture("01-login")
    type_into("Correo electrónico", EMAIL)
    type_into("Contraseña", PASSWORD)
    # Ocultar teclado para descubrir el botón completo del formulario.
    adb("shell", "input", "keyevent", "4")
    tap("Iniciar sesión")
    wait_for("Hola, Smoke Android", seconds=110)
    capture("02-home")
    print("PASS: login nativo y home con API real", flush=True)

    tap("Ver mi día")
    wait_for("Tu día nutricional")
    wait_for("120 consumidas de", exact=False)
    capture("03-dashboard")
    print("PASS: dashboard Android muestra datos persistidos", flush=True)

    tap("Registrar comida")
    wait_for("Diario de comidas")
    wait_for("120 kcal")
    capture("04-diario")
    print("PASS: diario Android refleja comida real", flush=True)

    adb("shell", "input", "keyevent", "4")
    wait_for("Tu día nutricional")
    adb("shell", "input", "keyevent", "4")
    wait_for("Hola, Smoke Android")

    scroll_and_tap("Mi progreso")
    wait_for("Tu progreso")
    wait_for("218.5 lb")
    capture("05-progreso")
    print("PASS: progreso Android refleja registro de peso", flush=True)

    adb("shell", "input", "keyevent", "4")
    wait_for("Hola, Smoke Android")
    scroll_and_tap("Escanear código de barras")
    wait_for("Escanea tus alimentos")
    capture("06-escaner")
    print("PASS: se navega al escáner en emulador (sin cámara real)", flush=True)


if __name__ == "__main__":
    try:
        prepare_test_user()
        journey()
        print("RESULTADO: recorrido Android E2E y API real aprobados", flush=True)
    except Exception as error:
        print(f"FALLO ANDROID E2E: {type(error).__name__}: {error}", file=sys.stderr, flush=True)
        try:
            capture("failure")
            root = hierarchy()
            print("Elementos visibles en fallo: " + repr(visible(root)[:90]), file=sys.stderr)
        except Exception:
            pass
        sys.exit(1)
