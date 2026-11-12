"""Procedural textures: graphite pencil sketch of the mark and film-grain tiles.

Usage: python film/tools/textures.py
Reads out/data/geo.json, writes out/textures/pencil.png and out/textures/grain_*.png.
"""
import json
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out" / "textures"
OUT.mkdir(parents=True, exist_ok=True)
geo = json.loads((ROOT / "out" / "data" / "geo.json").read_text())


def pencil(size=2048, seed=7):
    rnd = random.Random(seed)
    ss = 2
    S = size * ss
    scale = S * 0.78 / 164
    ox = S * 0.11
    oy = S * 0.5 - 50 * scale
    tf = lambda p: (ox + p[0] * scale, oy + p[1] * scale)
    polys = [[tf(p) for p in c] for c in geo["polygons"]["crownW"] + geo["polygons"]["w"]]

    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    for poly in polys:
        md.polygon(poly, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(ss * 1.5))

    hatch = Image.new("L", (S, S), 0)
    hd = ImageDraw.Draw(hatch)
    for angle, spacing, alpha in ((52, 11, 190), (-38, 17, 110)):
        a = math.radians(angle)
        dx, dy = math.cos(a), math.sin(a)
        nx, ny = -dy, dx
        span = S * 1.5
        k = -span
        while k < span:
            k += spacing * ss * rnd.uniform(0.75, 1.3)
            cx, cy = S / 2 + nx * k, S / 2 + ny * k
            pts = []
            for i in range(-40, 41):
                t = i / 40 * span
                j = rnd.uniform(-1.2, 1.2) * ss
                pts.append((cx + dx * t + nx * j, cy + dy * t + ny * j))
            hd.line(pts, fill=int(alpha * rnd.uniform(0.6, 1.0)), width=int(ss * rnd.uniform(1.6, 3.2)))
    hatch = Image.fromarray((np.asarray(hatch, np.float32) * np.asarray(mask, np.float32) / 255).astype(np.uint8))

    outline = Image.new("L", (S, S), 0)
    od = ImageDraw.Draw(outline)
    for poly in polys:
        for _ in range(3):
            off = [(x + rnd.uniform(-2.5, 2.5) * ss, y + rnd.uniform(-2.5, 2.5) * ss) for x, y in poly]
            od.line(off + [off[0]], fill=rnd.randint(150, 230), width=int(ss * rnd.uniform(2.2, 3.6)), joint="curve")
        for i in range(len(poly)):
            x0, y0 = poly[i]
            x1, y1 = poly[(i + 1) % len(poly)]
            ext = rnd.uniform(8, 26) * ss
            L = math.hypot(x1 - x0, y1 - y0) or 1
            ux, uy = (x1 - x0) / L, (y1 - y0) / L
            od.line([(x1, y1), (x1 + ux * ext, y1 + uy * ext)], fill=rnd.randint(70, 130), width=int(ss * 1.6))

    g = np.maximum(np.asarray(hatch, np.float32), np.asarray(outline, np.float32))
    paper_tooth = np.random.default_rng(seed).random((S, S)).astype(np.float32)
    g = g * (0.62 + 0.38 * paper_tooth)
    img = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(ss * 0.6))
    img = img.resize((size, size), Image.LANCZOS)
    img.save(OUT / "pencil.png")


def grain(n=6, size=512, seed=11):
    rng = np.random.default_rng(seed)
    for i in range(n):
        a = rng.normal(0.5, 0.18, (size, size)).astype(np.float32)
        img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.55))
        img.save(OUT / f"grain_{i}.png")


if __name__ == "__main__":
    pencil()
    grain()
    print("textures ok")
