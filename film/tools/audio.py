"""Sound design for the wonmor film, synthesised (no samples). Cue times follow film/tools/timeline.mjs.

Usage: python film/tools/audio.py  -> out/audio/wonmor_sound_raw.wav (then ffmpeg loudnorm to -16 LUFS)
"""
import wave
from pathlib import Path

import numpy as np

SR = 48000
DUR = 19.4
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(3)
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)


def env(n, a, d, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def bandsweep(n, f0, f1):
    """Noise through a resonant band that sweeps f0 -> f1 (state-variable filter)."""
    x = rng.standard_normal(n)
    f = np.geomspace(f0, f1, n)
    lp = bp = 0.0
    q = 0.35
    y = np.empty(n)
    for i in range(n):
        g = 2 * np.sin(np.pi * f[i] / SR)
        hp = x[i] - lp - q * bp
        bp += g * hp
        lp += g * bp
        y[i] = bp
    return y / (np.abs(y).max() + 1e-9)


def add(t, sig, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def whoosh(t, dur=0.32, up=True, gain=0.5, pan=0.0):
    n = int(dur * SR)
    s = bandsweep(n, 300 if up else 3500, 3500 if up else 300)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    add(t - dur * 0.6, s * e, gain, pan)


def click(t, gain=0.25, freq=2400, pan=0.0):
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * tt) * env(n, 0.0005, 0.01, 6) + rng.standard_normal(n) * env(n, 0.0002, 0.004, 6) * 0.4
    add(t, s, gain, pan)


def hit(t, gain=0.8, f=58):
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    pitch = f * (1 + 1.5 * np.exp(-tt * 30))
    body = np.sin(2 * np.pi * np.cumsum(pitch) / SR) * env(n, 0.002, 0.9, 5)
    air = lowpass(rng.standard_normal(n), 2500) * env(n, 0.001, 0.12, 8) * 0.6
    add(t, body + air, gain)


def swell(t0, t1, gain=0.35, f=55):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    e = (tt / tt[-1]) ** 2.2
    s = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.01 * tt) + 0.25 * np.sin(2 * np.pi * f * 3 * tt)) * e
    s += lowpass(rng.standard_normal(n), 900) * e * 0.5
    add(t0, s, gain)


def shimmer(t, dur=0.9, gain=0.12):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) for f in (1760, 2217, 2637, 3520)) / 4
    add(t, s * env(n, 0.05, dur, 3), gain, 0.2)


# bed: low pad with slow movement
tt = np.arange(N) / SR
bed = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 82.4 * tt) * 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * tt))
bed += lowpass(rng.standard_normal(N), 400) * 0.25
fade = np.minimum(1, np.minimum(tt / 0.4, (DUR - tt) / 0.4))
L += bed * 0.05 * fade
R += bed * 0.05 * fade

# construction: clicks on anchors and cursor actions
for t in (0.10, 0.60, 0.95, 1.36, 1.70, 2.05, 2.36, 2.44, 2.54, 2.95, 3.10, 3.25):
    click(t, 0.22, 2200 + rng.integers(-300, 300), rng.uniform(-0.3, 0.3))
whoosh(0.57, 0.22, gain=0.25)
whoosh(1.0, 0.45, gain=0.3)
whoosh(3.56, 0.55, gain=0.45, pan=-0.2)
swell(3.6, 4.43, 0.35)
hit(4.43, 0.9)
shimmer(4.65, 0.8, 0.1)
whoosh(4.85, 0.35, up=False, gain=0.35)
for t in (5.57, 6.57, 11.07, 12.07):
    whoosh(t, 0.25, gain=0.4)
# letters
for i in range(6):
    click(7.42 + i * 0.36, 0.18, 1800 + i * 120, -0.4 + i * 0.16)
hit(10.03, 0.55, 70)
whoosh(10.1, 0.35, up=False, gain=0.35)
swell(12.4, 12.95, 0.25, 65)
whoosh(13.07, 0.3, gain=0.5)
whoosh(14.07, 0.3, gain=0.45, pan=0.2)
hit(15.07, 0.45, 62)
for t in (15.57, 16.07, 16.57, 17.07, 17.33, 17.57, 17.83):
    whoosh(t, 0.16, gain=0.35, pan=rng.uniform(-0.4, 0.4))
    click(t, 0.12, 900)
hit(18.07, 0.7, 52)
whoosh(18.12, 0.3, gain=0.5)
shimmer(18.15, 1.0, 0.12)
whoosh(18.93, 0.25, up=False, gain=0.3)

mix = np.stack([L, R], 1)
mix /= np.abs(mix).max() / 0.89
with wave.open(str(OUT / "wonmor_sound_raw.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("audio ok", N / SR, "s")
