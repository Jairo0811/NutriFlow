"""Música y efectos ORIGINALES del tráiler de NutriFlow, sintetizados con NumPy/SciPy.
120 BPM, 45 s. Sin muestras ni recursos de terceros. Salida: audio/music-sfx.wav (stereo 44.1 kHz).
Uso: python3 audio/make_audio.py
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
import os

SR = 44100
DUR = 45.0
BPM = 120
BEAT = 60 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(1965)
t_all = np.arange(N) / SR

L = np.zeros(N); R = np.zeros(N)
REV_L = np.zeros(N); REV_R = np.zeros(N)

def lp(x, f, order=2): return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

def put(buf, x, start):
    i = int(start * SR)
    if i >= N: return
    j = min(N, i + len(x)); buf[i:j] += x[: j - i]

def stereo(x, start, pan=0.0, gain=1.0, rev=0.0):
    pl = np.cos((pan + 1) * np.pi / 4); pr = np.sin((pan + 1) * np.pi / 4)
    put(L, x * pl * gain, start); put(R, x * pr * gain, start)
    if rev: put(REV_L, x * pl * rev, start); put(REV_R, x * pr * rev, start)

def env(n, a=0.005, d=0.2, s=0.0, r=0.05):
    e = np.ones(n); na = max(1, int(a * SR)); nd = int(d * SR)
    e[:na] = np.linspace(0, 1, na)
    if nd and n > na:
        m = min(n - na, nd); e[na:na + m] = np.linspace(1, s, m); e[na + m:] = s
    nr = min(n, max(1, int(r * SR))); e[-nr:] *= np.linspace(1, 0, nr)
    return e

def saw(f, n, detune=(0.0,)):
    t = np.arange(n) / SR; y = np.zeros(n)
    for dt in detune:
        ff = f * 2 ** (dt / 1200); ph = (t * ff) % 1.0
        y += 2 * ph - 1
    return y / len(detune)

def kick(vol=1.0):
    n = int(0.34 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 22); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * 8.5)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t * 400) * 0.15
    return (y + click) * vol

def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t * (18 if open_ else 70)) * 0.22

def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1100, 3800)
    e = np.exp(-t * 22)
    for k in (0.0, 0.011, 0.023): e += np.exp(-np.clip(t - k, 0, None) * 60) * (t >= k) * 0.8
    return x * e * 0.22

def whoosh(dur, rising=True, vol=0.5):
    n = int(dur * SR); x = rng.standard_normal(n)
    out = np.zeros(n); steps = 24
    for i in range(steps):
        a, b = int(i * n / steps), int((i + 1) * n / steps)
        frac = (i + 1) / steps if rising else 1 - i / steps
        fc = 300 + 7000 * frac ** 2
        out[a:b] = lp(x, fc)[a:b]
    e = (np.linspace(0, 1, n) ** 2) if rising else (np.linspace(1, 0, n) ** 2)
    return out * e * vol

def bell(f, dur=1.2, vol=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d)
            for m, a, d in [(1, 1, 3.0), (2.01, .5, 4.5), (3.98, .25, 7), (5.4, .12, 9)])
    return y * vol

def pluck(f, dur=0.28, vol=0.2):
    n = int(dur * SR)
    y = lp(saw(f, n, (-7, 0, 7)), 2600 + 0 * f)
    return y * env(n, 0.002, dur * 0.9, 0.0, 0.03) * vol

# --- progresión: Am | F | C | G, cambia cada 2 s ---
chords = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]
def chord_at(t): return chords[int(t // (4 * BEAT)) % 4]

# PAD 0-45 con fade-in y fade-out final
for ci in range(int(np.ceil(DUR / (4 * BEAT)))):
    t0 = ci * 4 * BEAT
    root, notes = chords[ci % 4]
    n = int((4 * BEAT + 0.6) * SR)
    pad = np.zeros(n)
    for nt in notes:
        pad += saw(midi(nt + 12), n, (-9, 0, 9)) * 0.5
        pad += saw(midi(nt), n, (-5, 5)) * 0.35
    pad = lp(pad, 1800 + 1200 * min(1, t0 / 38))
    e = np.ones(n); a = int(0.5 * SR); r = int(0.7 * SR)
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r)
    amp = 0.085 * (0.55 + 0.45 * min(1, t0 / 10))
    stereo(pad * e, t0, 0.0, amp, rev=0.5)

# SUB BASS desde 5 s (suave) y firme desde 10 s hasta 37.5; luego 38 → 41.5
def bass_note(root, t0, dur, vol):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * midi(root - 24) * t) + 0.25 * np.sin(2 * np.pi * midi(root - 12) * t)
    stereo(y * env(n, 0.01, dur, 0.8, 0.08) * vol, t0, 0, 1)
for ci in range(int(DUR / (4 * BEAT))):
    t0 = ci * 4 * BEAT
    if 5 <= t0 < 41.5:
        vol = 0.10 if t0 < 10 else 0.22
        if 36 <= t0 < 38: vol = 0.0
        if vol: 
            for k in range(8 if t0 >= 10 else 1):
                bass_note(chords[ci % 4][0], t0 + k * BEAT * (0.5 if t0 >= 10 else 1), BEAT * 0.45 if t0 >= 10 else 4 * BEAT, vol)

# KICK, HATS, CLAPS
def groove(t_start, t_end, kick_on=True, claps_from=None):
    b = t_start
    while b < t_end - 1e-6:
        if kick_on: stereo(kick(), b, 0, 0.55)
        stereo(hat(), b + BEAT / 2, 0.25, 0.7)
        if int(round((b - t_start) / BEAT)) % 4 == 3: stereo(hat(True), b + BEAT / 2, -0.2, 0.5)
        stereo(hat(), b + BEAT / 4, -0.3, 0.35); stereo(hat(), b + 3 * BEAT / 4, 0.3, 0.35)
        if claps_from is not None and b >= claps_from and int(round((b - t_start) / BEAT)) % 2 == 1:
            stereo(clap(), b, 0, 0.7, rev=0.25)
        b += BEAT
groove(10, 36, True, claps_from=17)
groove(38, 41.5, True, claps_from=38)

# ARPEGIO (16avos) 17-36 y 38-41.5
def arp(t_start, t_end):
    step = BEAT / 2; i = 0; t = t_start
    pattern = [0, 1, 2, 1, 2, 1, 0, 2]
    while t < t_end - 1e-6:
        _, notes = chord_at(t)
        nt = notes[pattern[i % 8]] + 24
        pan = -0.5 if i % 2 else 0.5
        stereo(pluck(midi(nt)), t, pan, 1.0, rev=0.35)
        t += step; i += 1
arp(17, 36); arp(38, 41.5)
# pulso suave tipo "latido" en la escena 1-2
for k in range(0, 20): stereo(kick(), k * BEAT, 0, 0.12 if k >= 4 else 0.06)

# RISER 34.5 → 38
n = int(3.5 * SR); x = rng.standard_normal(n); out = np.zeros(n); steps = 40
for i in range(steps):
    a, b = int(i * n / steps), int((i + 1) * n / steps)
    out[a:b] = hp(x, 400 + 9000 * (i / steps) ** 2)[a:b]
out *= np.linspace(0, 1, n) ** 2.2 * 0.4
stereo(out, 34.5, 0, 1.0, rev=0.3)
# toms/golpes de redoble
for k in range(8):
    tt = 36.0 + k * BEAT / 2 * 0.5 * (1.0 if k < 4 else 1)
for k in range(16):
    tt = 36.0 + k * (2 * BEAT / 16) * 1.0
    if tt < 38: stereo(clap() * (0.4 + k / 16), tt, 0, 0.6)

# IMPACTO 38.0
n = int(3.0 * SR); t = np.arange(n) / SR
boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 6)) * t) * np.exp(-t * 1.6)
sh = hp(rng.standard_normal(n), 1500) * np.exp(-t * 3.5) * 0.35
stereo(boom * 0.9 + sh, 38.0, 0, 0.8, rev=0.35)

# WHOOSH de transición en cada corte
for cut in (5, 10, 17, 24, 31):
    d = 0.7; stereo(whoosh(d, True, 0.55), cut - d, 0, 1.0, rev=0.2)
    stereo(whoosh(0.45, False, 0.25), cut, 0, 1.0)
stereo(whoosh(0.8, True, 0.6), 41.5 - 0.8, 0, 1.0, rev=0.2)

# EFECTOS: aparición del logo (5.4), indicadores digitales y pulsos
for i, nt in enumerate([81, 84, 88, 93]): stereo(bell(midi(nt), 1.4, 0.28), 5.35 + i * 0.12, -0.2 + i * 0.15, 1.0, rev=0.5)
for t0, nt in [(10.6, 88), (11.4, 91), (12.2, 95), (13.0, 91)]: stereo(bell(midi(nt), 0.5, 0.14), t0, 0.3, 1.0, rev=0.3)
for t0 in (17.9, 19.4, 20.9): stereo(bell(midi(96), 0.18, 0.2) , t0, -0.3, 1.0)     # "bips" escáner
for t0 in (25.0, 26.5, 28.0): stereo(bell(midi(84), 0.7, 0.14), t0, 0.2, 1.0, rev=0.4)
for t0, nt in [(31.6, 84), (32.9, 88), (34.2, 91), (35.5, 96)]: stereo(bell(midi(nt), 0.6, 0.16), t0, 0, 1.0, rev=0.4)
for i, nt in enumerate([84, 88, 91, 96, 100]): stereo(bell(midi(nt), 2.0, 0.22), 38.15 + i * 0.1, -0.3 + i * 0.15, 1.0, rev=0.6)
# acorde final (resolución en La menor → La mayor suspendido) 41.5-45
n = int(3.6 * SR); fin = np.zeros(n)
for nt in (57, 64, 69, 72, 76): fin += saw(midi(nt), n, (-8, 0, 8)) * 0.3
fin = lp(fin, 2600) * env(n, 0.05, 3.2, 0.2, 1.2) * 0.14
stereo(fin, 41.5, 0, 1.0, rev=0.6)
stereo(bell(midi(93), 3.0, 0.2), 41.55, 0, 1.0, rev=0.7)

# REVERB (IR sintética) y mezcla
irn = int(2.2 * SR); ti = np.arange(irn) / SR
ir_l = hp(rng.standard_normal(irn), 200) * np.exp(-ti * 2.4)
ir_r = hp(rng.standard_normal(irn), 200) * np.exp(-ti * 2.4)
rl = fftconvolve(REV_L, ir_l)[:N] * 0.035; rr = fftconvolve(REV_R, ir_r)[:N] * 0.035
L += rl; R += rr

# fundido de entrada/salida global
fade_in = np.clip(t_all / 1.2, 0, 1); fade_out = np.clip((DUR - t_all) / 1.0, 0, 1)
L *= fade_in * fade_out; R *= fade_in * fade_out
# curva de intensidad: arranca íntima y crece hasta el clímax
curve_db = np.interp(t_all, [0, 5, 10, 17, 24, 36, 38, 41.5, 45], [-9, -6, -3, -1, 0, 0, 1.5, 0, -2])
L *= 10 ** (curve_db / 20); R *= 10 ** (curve_db / 20)
# compresión suave y normalización a -1.5 dBFS pico
mix = np.stack([L, R], axis=1)
mix = np.tanh(mix * 0.45) / 0.45
mix *= 10 ** (-3.0 / 20) / np.max(np.abs(mix))
here = os.path.dirname(os.path.abspath(__file__))
wavfile.write(os.path.join(here, 'music-sfx.wav'), SR, (mix * 32767).astype(np.int16))
print('OK music-sfx.wav', mix.shape, 'peak', np.max(np.abs(mix)))
