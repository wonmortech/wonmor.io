"""The "filmed off a laptop" version of the wonmor film, built the way the Vetric reference looks:
the clean 16x9 film plays inside an editor's composition viewer on a laptop, and a phone films the
screen handheld in a warm room (screen reflections, auto exposure, defocused surroundings, sensor noise).

Usage: python film/tools/screen.py [--in out/film/wonmor_film_16x9.mp4] [--out out/film/wonmor_screen_9x16.mp4]
                                   [--audio out/audio/wonmor_sound.wav] [--frames N] [--still SECONDS]
Needs numpy, opencv-python-headless, Pillow, ffmpeg on PATH.
"""
import argparse
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ap = argparse.ArgumentParser()
ap.add_argument("--in", dest="src", default=str(ROOT / "out/film/wonmor_film_16x9.mp4"))
ap.add_argument("--out", default=str(ROOT / "out/film/wonmor_screen_9x16.mp4"))
ap.add_argument("--audio", default=str(ROOT / "out/audio/wonmor_sound.wav"))
ap.add_argument("--frames", type=int, default=0)
ap.add_argument("--still", type=float, default=-1)
A = ap.parse_args()

FPS, OW, OH = 30, 1080, 1920
SRC_W, SRC_H = 1920, 1080
rng = np.random.default_rng(13)

# ------------------------------------------------------------------ editor UI (screen texture space)
SW, SH = 2560, 1600                       # 16:10 panel
BZ = 46                                   # bezel
TW, TH = SW + 2 * BZ, SH + 2 * BZ
MENU, TOOL, TABS = 44, 60, 44
VIEW_Y0 = MENU + TOOL + TABS
FOOT_Y0 = 1300
TL_Y0, DOCK_Y0 = FOOT_Y0 + 46, 1522
COMP_W = 2098
COMP_H = round(COMP_W * SRC_H / SRC_W)
COMP_X = (SW - COMP_W) // 2
COMP_Y = VIEW_Y0 + (FOOT_Y0 - VIEW_Y0 - COMP_H) // 2

FONT = "C:/Windows/Fonts/segoeui.ttf"
FONT_SB = "C:/Windows/Fonts/seguisb.ttf"
f = lambda s, sb=False: ImageFont.truetype(FONT_SB if sb else FONT, s)

LAYERS = [("Gem spin", 0.0, 0.57, (88, 120, 220)), ("Construction", 0.57, 4.6, (164, 120, 220)),
          ("Metal mark", 4.43, 5.57, (88, 160, 200)), ("Lockup build", 6.57, 11.07, (200, 170, 90)),
          ("Giant wordmark", 12.07, 13.07, (120, 190, 120)), ("Phone", 13.07, 14.07, (210, 120, 150)),
          ("Hoodie", 14.07, 15.07, (150, 150, 160))]
DUR = 19.4


def tl_x(sec):
    return BZ + 640 + (sec / DUR) * (SW - 700)


def ui_template():
    im = Image.new("RGB", (TW, TH), (6, 6, 7))
    d = ImageDraw.Draw(im)
    o = BZ
    d.rectangle([o, o, o + SW, o + SH], fill=(24, 24, 25))
    # menu bar
    d.rectangle([o, o, o + SW, o + MENU], fill=(30, 30, 33))
    x = o + 26
    for i, t in enumerate(["\u25CF", "Motion", "File", "Edit", "Composition", "Layer", "Effect", "Animation", "View", "Window", "Help"]):
        d.text((x, o + 9), t, font=f(22, i == 1), fill=(225, 225, 228))
        x += d.textlength(t, font=f(22, i == 1)) + 30
    d.text((o + SW - 300, o + 9), "Thu 13 Nov   04:21", font=f(22), fill=(225, 225, 228))
    for k in range(4):
        d.rounded_rectangle([o + SW - 470 + k * 38, o + 13, o + SW - 448 + k * 38, o + 31], 4, outline=(200, 200, 204), width=2)
    d.rounded_rectangle([o + SW // 2 - 200, o - 4, o + SW // 2 + 200, o + 40], 18, fill=(4, 4, 5))
    # toolbar
    y = o + MENU
    d.rectangle([o, y, o + SW, y + TOOL], fill=(40, 40, 42))
    x = o + 30
    for k in range(11):
        c = (210, 210, 214) if k != 0 else (90, 150, 255)
        if k % 3 == 0:
            d.polygon([(x, y + 18), (x, y + 42), (x + 7, y + 36), (x + 13, y + 46), (x + 17, y + 44), (x + 11, y + 34), (x + 19, y + 33)], fill=c)
        elif k % 3 == 1:
            d.rounded_rectangle([x, y + 19, x + 22, y + 41], 3, outline=c, width=2)
        else:
            d.ellipse([x, y + 19, x + 22, y + 41], outline=c, width=2)
        x += 50
    d.rectangle([x + 20, y + 21, x + 38, y + 39], outline=(200, 200, 204), width=2)
    d.text((x + 50, y + 15), "Snapping", font=f(21), fill=(210, 210, 214))
    t = "Motion 2026 - wonmor_film.mproj *"
    d.text((o + SW / 2 - d.textlength(t, font=f(21)) / 2, y + 16), t, font=f(21), fill=(170, 170, 176))
    for k in range(5):
        d.text((o + SW - 520 + k * 98, y + 16), ["Default", "Review", "Learn", "Small", ">>"][k], font=f(20), fill=(150, 150, 156))
    # tabs
    y = o + MENU + TOOL
    d.rectangle([o, y, o + SW, y + TABS], fill=(30, 30, 31))
    d.text((o + 300, y + 9), "Composition", font=f(21, True), fill=(230, 230, 234))
    d.text((o + 300 + 135, y + 9), "Comp 1  \u2261", font=f(21), fill=(230, 230, 234))
    d.line([o + 296, y + TABS - 3, o + 560, y + TABS - 3], fill=(60, 120, 255), width=3)
    d.text((o + 640, y + 9), "Footage (none)", font=f(21), fill=(130, 130, 136))
    d.rectangle([o, o + VIEW_Y0, o + 240, o + FOOT_Y0], fill=(34, 34, 35))
    d.rectangle([o + SW - 240, o + VIEW_Y0, o + SW, o + FOOT_Y0], fill=(34, 34, 35))
    for k in range(9):
        yy = o + VIEW_Y0 + 30 + k * 44
        d.text((o + 22, yy), ["Info", "Audio", "Preview", "Effects", "Align", "Libraries", "Character", "Paragraph", "Tracker"][k], font=f(20), fill=(150, 150, 156))
        d.text((o + SW - 218, yy), ["Properties", "Transform", "Anchor", "Position", "Scale", "Rotation", "Opacity", "Mask", "Motion Blur"][k], font=f(20), fill=(150, 150, 156))
    d.rectangle([o + 240, o + VIEW_Y0, o + SW - 240, o + FOOT_Y0], fill=(20, 20, 21))
    # viewer footer
    y = o + FOOT_Y0
    d.rectangle([o, y, o + SW, y + 46], fill=(36, 36, 38))
    for k, t in enumerate(["\u2302", "100%", "\u2316", "Full", "\u25A3", "\u25CE"]):
        d.text((o + 300 + k * 92, y + 10), t, font=f(21), fill=(190, 190, 196))
    d.text((o + 1250, y + 10), "+0.0", font=f(21), fill=(60, 140, 255))
    # timeline
    y = o + TL_Y0
    d.rectangle([o, y, o + SW, o + DOCK_Y0], fill=(27, 27, 28))
    d.rectangle([o, y, o + 600, o + DOCK_Y0], fill=(31, 31, 32))
    for k, (name, a, b, col) in enumerate(LAYERS):
        yy = y + 34 + k * 20
        d.text((o + 60, yy - 3), f"{k + 1}   {name}", font=f(15), fill=(170, 170, 176))
        d.rectangle([tl_x(a), yy, tl_x(b), yy + 15], fill=tuple(int(c * 0.55) for c in col))
    for s in range(0, 20, 2):
        d.text((tl_x(s) - 8, y + 4), f"{s:02d}s", font=f(16), fill=(150, 150, 156))
    # dock
    y = o + DOCK_Y0
    d.rounded_rectangle([o + 260, y + 6, o + SW - 260, o + SH - 4], 22, fill=(52, 52, 58))
    cols = [(240, 240, 245), (60, 130, 250), (250, 90, 80), (250, 190, 50), (90, 200, 120), (150, 90, 230),
            (40, 40, 60), (230, 120, 40), (60, 200, 230), (240, 80, 150), (120, 120, 130), (30, 90, 200),
            (250, 220, 90), (200, 60, 60), (90, 90, 240), (230, 230, 240), (60, 170, 90), (180, 120, 60)]
    n = 26
    step = (SW - 600) / n
    for k in range(n):
        x = o + 300 + k * step
        d.rounded_rectangle([x + 8, y + 18, x + step - 18, y + step - 10], 12, fill=tuple(int(0.6 * c + 0.4 * 90) for c in cols[k % len(cols)]))
    d.rounded_rectangle([0, 0, TW - 1, TH - 1], 34, outline=(70, 70, 74), width=3)
    return np.asarray(im).copy()


# ------------------------------------------------------------------ camera geometry
def screen_homography(t):
    """Texture (bezel included) -> camera pixels, with a slow push and handheld shake."""
    s = 1.06 + 0.012 * math.sin(t * 0.21 + 0.4)
    theta = math.radians(-6.0 + 0.35 * math.sin(t * 0.37 + 1.1))
    kst = 0.13                                               # top of the lid is farther away
    ua, va = BZ + SW / 2 + 40, BZ + COMP_Y + COMP_H / 2
    ax, ay = OW / 2 + 10, OH * 0.47
    shx = 7 * math.sin(t * 1.9) + 4 * math.sin(t * 3.7 + 2) + 2.2 * math.sin(t * 7.3 + 1)
    shy = 6 * math.sin(t * 1.6 + 0.7) + 3.5 * math.sin(t * 4.1 + 0.3) + 2 * math.sin(t * 8.9)
    rot = theta + math.radians(0.25 * math.sin(t * 2.3 + 0.2) + 0.12 * math.sin(t * 5.1))
    src, dst = [], []
    for u, v in [(0, 0), (TW, 0), (TW, TH), (0, TH)]:
        k = 1 - kst * (1 - v / TH) + kst * (1 - va / TH)
        dx, dy = (u - ua) * s * k, (v - va) * s
        src.append((u, v))
        dst.append((ax + dx * math.cos(rot) - dy * math.sin(rot) + shx, ay + dx * math.sin(rot) + dy * math.cos(rot) + shy))
    return cv2.getPerspectiveTransform(np.float32(src), np.float32(dst)), (shx, shy)


# ------------------------------------------------------------------ room + reflections (camera space)
def noise(h, w, scales, seed):
    r = np.random.default_rng(seed)
    acc = np.zeros((h, w), np.float32)
    for sc, amp in scales:
        g = r.random((max(2, h // sc), max(2, w // sc))).astype(np.float32)
        acc += amp * cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
    acc -= acc.min()
    return acc / (acc.max() + 1e-6)


def build_room():
    yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
    room = np.zeros((OH, OW, 3), np.float32)
    base = 0.035 + 0.03 * (1 - yy / OH)
    room[..., 0], room[..., 1], room[..., 2] = base * 1.2, base * 1.0, base * 0.78
    strip = np.zeros((OH, OW), np.float32)
    cv2.line(strip, (360, -20), (1180, 70), 1.0, 9, cv2.LINE_AA)
    cv2.line(strip, (-40, 60), (420, 10), 0.35, 5, cv2.LINE_AA)
    bloom = cv2.GaussianBlur(strip, (0, 0), 28) * 2.2 + cv2.GaussianBlur(strip, (0, 0), 6) * 0.9 + strip * 0.4
    room += bloom[..., None] * np.array([1.0, 0.74, 0.32], np.float32)
    kb = noise(OH, OW, [(6, 0.6), (24, 0.4)], 3)
    room[OH - 260:] = room[OH - 260:] * 0.4 + (0.02 + 0.02 * kb[OH - 260:])[..., None]
    return np.clip(room, 0, 4)


def build_reflection():
    yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
    refl = np.zeros((OH, OW, 3), np.float32)
    # gilded painting on the wall behind the camera: warm ornament, soft, upper half of the glass
    n = noise(OH, OW, [(70, 0.5), (26, 0.35), (9, 0.15)], 7)
    swirl = 0.5 + 0.5 * np.sin((xx * 0.018 + n * 7.0) + np.sin(yy * 0.011) * 2.4)
    paint = 0.35 + 0.65 * swirl * n
    frame = cv2.GaussianBlur(((yy > 170) & (yy < 760)).astype(np.float32), (0, 0), 40) * np.clip(1.2 - xx / OW * 0.5, 0, 1)
    refl += (paint * frame)[..., None] * np.array([0.62, 0.42, 0.16], np.float32) * 0.30
    # warm wash from the room, blocked by the person holding the phone
    wash = np.clip(1 - (yy - 1350) ** 2 / 500 ** 2, 0, 1) * 0.035
    refl += wash[..., None] * np.array([0.9, 0.62, 0.32], np.float32)
    head = np.exp(-(((xx - 720) / 190) ** 2 + ((yy - 1180) / 170) ** 2) * 1.6)
    body = np.exp(-(((xx - 760) / 380) ** 2 + ((yy - 1560) / 260) ** 2) * 1.4)
    refl *= (1 - 0.85 * np.clip(head + body, 0, 1))[..., None]
    # cove LED reflected in the glass: a long warm streak across the lower screen
    st = np.zeros((OH, OW), np.float32)
    cv2.line(st, (-60, 1430), (1140, 1290), 1.0, 7, cv2.LINE_AA)
    st = cv2.GaussianBlur(st, (0, 0), 3) * 0.9 + cv2.GaussianBlur(st, (0, 0), 18) * 1.3
    return refl, st[..., None] * np.array([1.0, 0.78, 0.40], np.float32)


def timeline_overlay(tex, t):
    """Timecode and playhead drawn into a copy of the bottom strip of the UI."""
    y0 = BZ + FOOT_Y0
    strip = Image.fromarray(tex[y0:BZ + DOCK_Y0].copy())
    d = ImageDraw.Draw(strip)
    fr = int(round(t * FPS))
    tc = f"0:00:{fr // FPS:02d}:{fr % FPS:02d}"
    d.text((BZ + 1000, 10), tc, font=f(21), fill=(60, 140, 255))
    d.text((BZ + 80, 50), tc, font=f(24, True), fill=(60, 140, 255))
    x = tl_x(t)
    d.line([x, 46, x, DOCK_Y0 - FOOT_Y0], fill=(60, 140, 255), width=2)
    d.polygon([(x - 8, 46), (x + 8, 46), (x, 58)], fill=(60, 140, 255))
    return np.asarray(strip)


# ------------------------------------------------------------------ main loop
def main():
    tpl = ui_template()
    room = build_room()
    refl, streak = build_reflection()
    yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
    vign = (1 - 0.42 * (((xx - OW / 2) / (OW * 0.75)) ** 2 + ((yy - OH * 0.48) / (OH * 0.62)) ** 2)).clip(0.35, 1)[..., None]
    fall = np.clip((np.abs(yy - OH * 0.48) - 620) / 420, 0, 1)[..., None]
    total = int(round(DUR * FPS))
    start, frames = 0, A.frames or total
    if A.still >= 0:
        start, frames = int(round(A.still * FPS)), 1
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{start / FPS:.4f}", "-i", A.src, "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-vf", f"scale={SRC_W}:{SRC_H}", "-frames:v", str(frames), "-"], stdout=subprocess.PIPE)
    enc, tmp = None, A.out + ".video.mp4"
    if A.still < 0:
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}", "-r", str(FPS), "-i", "-",
                                "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-tune", "film", tmp], stdin=subprocess.PIPE)
    gain = None
    for i in range(frames):
        raw = dec.stdout.read(SRC_W * SRC_H * 3)
        if len(raw) < SRC_W * SRC_H * 3:
            break
        t = (start + i) / FPS
        film = np.frombuffer(raw, np.uint8).reshape(SRC_H, SRC_W, 3)
        tex = tpl.copy()
        tex[BZ + COMP_Y:BZ + COMP_Y + COMP_H, BZ + COMP_X:BZ + COMP_X + COMP_W] = cv2.resize(film, (COMP_W, COMP_H), interpolation=cv2.INTER_AREA)
        tex[BZ + FOOT_Y0:BZ + DOCK_Y0] = timeline_overlay(tex, t)
        H, (shx, shy) = screen_homography(t)
        lin = (tex.astype(np.float32) / 255.0) ** 2.2
        scr = cv2.warpPerspective(lin, H, (OW, OH), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0))
        mask = cv2.warpPerspective(np.ones((TH, TW), np.float32), H, (OW, OH), flags=cv2.INTER_LINEAR)[..., None]
        lum = cv2.resize(cv2.resize(scr.mean(axis=2), (54, 96), interpolation=cv2.INTER_AREA), (OW, OH), interpolation=cv2.INTER_CUBIC)
        # the phone's auto exposure follows the screen: a bright frame darkens everything else
        target = min(1.12, 1.0 / (0.80 + 1.5 * float(np.mean(scr[300:1500, 100:980]))))
        gain = target if gain is None else gain + (target - gain) * 0.12
        M = np.float32([[1, 0, shx * 0.55], [0, 1, shy * 0.55]])
        rf = cv2.warpAffine(refl, M, (OW, OH), borderMode=cv2.BORDER_REFLECT)
        sk = cv2.warpAffine(streak, M, (OW, OH), borderMode=cv2.BORDER_REFLECT)
        dark = np.clip(1 - lum * 2.4, 0, 1)[..., None]
        screen = scr * np.array([1.12, 1.27, 1.45], np.float32) + rf * dark * 0.8 + sk * (0.30 + 0.5 * dark)
        rm = cv2.warpAffine(room, np.float32([[1, 0, shx * 1.8], [0, 1, shy * 1.8]]), (OW, OH), borderMode=cv2.BORDER_REFLECT)
        img = screen * mask + rm * (1 - mask)
        soft = cv2.GaussianBlur(img, (0, 0), 6)
        img = img * (1 - fall) + soft * fall
        img = cv2.GaussianBlur(img, (0, 0), 0.9)
        img = img * gain * vign
        img = img * np.array([1.05, 1.0, 0.90], np.float32) + 0.006
        out = np.clip(img, 0, 1) ** (1 / 2.2)
        out = out / (1 + 0.18 * out) * 1.18
        out += rng.normal(0, 0.012, (OH // 2, OW // 2, 1)).astype(np.float32).repeat(2, 0).repeat(2, 1)
        out = (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)
        if enc is None:
            Image.fromarray(out).save(A.out)
        else:
            enc.stdin.write(out.tobytes())
        if i % 60 == 0:
            print(f"frame {i}/{frames}", flush=True)
    dec.stdout.close()
    dec.wait()
    if enc:
        enc.stdin.close()
        enc.wait()
        audio = ["-i", A.audio, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "256k", "-shortest"] if Path(A.audio).exists() else []
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, *audio, "-c:v", "copy", "-movflags", "+faststart", A.out], check=True)
        Path(tmp).unlink()
        print("wrote", A.out)


if __name__ == "__main__":
    main()
