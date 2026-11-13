"""wonmor logo generator built on Vetric's own geometry.

Usage: python -I make_wonmor.py <assets/wonmor dir>

Main logo = variant B (V2 shifted 9.4 on the 32 grid). The letter w in the wordmark
uses the same union rule as the mark, scaled to the Vetric v (17.7469 / 22.5).
History variants "wide" (arms coincide, 16.643) and "a" (11.264) are written with a prefix.
"""
import os, sys, json

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
BLUE, INK, WHITE = "#2969FF", "#0E1027", "#FFFFFF"
f = lambda v: f"{v:.4f}".rstrip("0").rstrip(".")

MAIN = "b"
VARIANTS = {"wide": 21.3932 - 4.75, "a": 11.264, "b": 9.4}
LETTER_K = 17.7469 / 22.5
TOP_Y, TIP_Y = 12.3411, 29.0206


def intersect(p1, p2, p3, p4):
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
    return x1 + t * (x2 - x1), y1 + t * (y2 - y1)


# ---------- mark (32 grid) ----------
def crown(o):
    return (f"M9.3704 3H{f(22.6265+o)}C{f(23.8941+o)} 3 {f(25.0353+o)} 3.7685 {f(25.5119+o)} 4.94317"
            f"L{f(27.25+o)} 9.22751H4.75L6.48432 4.94496C6.93972 3.82046 8.00401 3.06766 9.20572 3.00434L9.3704 3Z")


def notch(o):
    return (f"H{f(10.6056+o)}C{f(11.6407+o)} 12.3411 {f(12.6081+o)} 12.8555 {f(13.187+o)} 13.7136"
            f"L{f(16+o)} 17.8836L{f(18.8115+o)} 13.7141C{f(19.3904+o)} 12.8557 {f(20.3579+o)} 12.3411 {f(21.3932+o)} 12.3411")


def chevron(o):
    return f"M{f(4.75+o)} {TOP_Y}" + notch(o) + f"H{f(27.25+o)}L{f(16+o)} {TIP_Y}Z"


def w_mark(o):
    c = intersect((27.25, TOP_Y), (16, TIP_Y), (4.75 + o, TOP_Y), (16 + o, TIP_Y))
    if o >= 21.3932 - 4.75 - 1e-6:   # arms coincide: both notches stay whole
        body = f"M4.75 {TOP_Y}" + notch(0) + notch(o)
    else:                             # V2 arm cuts V1's notch into a slanted slit (and mirror)
        q = intersect((16, 17.8836), (18.8115, 13.7141), (4.75 + o, TOP_Y), (16 + o, TIP_Y))
        qm = (32 + o - q[0], q[1])
        body = (f"M4.75 {TOP_Y}H10.6056C11.6407 12.3411 12.6081 12.8555 13.187 13.7136L16 17.8836"
                f"L{f(q[0])} {f(q[1])}L{f(4.75+o)} {TOP_Y}H27.25L{f(qm[0])} {f(qm[1])}L{f(16+o)} 17.8836"
                f"L{f(18.8115+o)} 13.7141C{f(19.3904+o)} 12.8557 {f(20.3579+o)} 12.3411 {f(21.3932+o)} 12.3411")
    chev = body + f"H{f(27.25+o)}L{f(16+o)} {TIP_Y}L{f(c[0])} {f(c[1])}L16 {TIP_Y}Z"
    slit = (o - 7.5115) / (1 + 0.6745 ** 2) ** 0.5 if o < 13.1 else None
    return crown(o), chev, c, slit


# ---------- wordmark (Vetric 103x24 metrics) ----------
S, TOP, BASE = 4.2262, 6.6303, 23.0068
IN_Y, R_O, R_I = 10.3282, 6.3393, 2.1131
KO, KI = 3.5011, 1.1670
V_W, V_ARM, V_IN, V_BOT_L, V_BOT_R, V_NOTCH_Y = 17.7469, 4.6256, 8.8735, 6.6563, 11.0938, 17.3575


def w_letter(x, d):
    # two Vetric v's, the second shifted by d (13.1213 = arms coincide)
    c = intersect((x + V_W, TOP), (x + V_BOT_R, BASE), (x + d, TOP), (x + d + V_BOT_L, BASE))
    tail = (f"H{f(x+d+V_W)}L{f(x+d+V_BOT_R)} {BASE}H{f(x+d+V_BOT_L)}L{f(c[0])} {f(c[1])}"
            f"L{f(x+V_BOT_R)} {BASE}H{f(x+V_BOT_L)}Z")
    if d >= 13.1213 - 1e-6:
        return (f"M{f(x)} {TOP}H{f(x+V_ARM)}L{f(x+V_IN)} {V_NOTCH_Y}L{f(x+d)} {TOP}H{f(x+V_W)}"
                f"L{f(x+d+V_IN)} {V_NOTCH_Y}L{f(x+d+13.1213)} {TOP}" + tail), d + V_W
    q = intersect((x + V_IN, V_NOTCH_Y), (x + 13.1213, TOP), (x + d, TOP), (x + d + V_BOT_L, BASE))
    qm = (2 * x + d + V_W - q[0], q[1])
    return (f"M{f(x)} {TOP}H{f(x+V_ARM)}L{f(x+V_IN)} {V_NOTCH_Y}L{f(q[0])} {f(q[1])}L{f(x+d)} {TOP}"
            f"H{f(x+V_W)}L{f(qm[0])} {f(qm[1])}L{f(x+d+V_IN)} {V_NOTCH_Y}L{f(x+d+13.1213)} {TOP}" + tail), d + V_W


def o_letter(x):
    rx, ry, cyy = 8.4524, 8.7165, 14.8186
    irx, iry = rx - S, ry - 3.6979
    c = x + rx
    ring = lambda a, b, sw: (f"M{f(c-a)} {f(cyy)}A{f(a)} {f(b)} 0 1 {sw} {f(c+a)} {f(cyy)}"
                             f"A{f(a)} {f(b)} 0 1 {sw} {f(c-a)} {f(cyy)}Z")
    return ring(rx, ry, 1) + ring(irx, iry, 0), 2 * rx


# Vetric rule (t, r): only the LEFT side of a top corner is cut; the right side stays square.
def outer(x, xr):
    return (f"M{f(x)} {BASE}V{f(TOP+R_O)}C{f(x)} {f(TOP+R_O-KO)} {f(x+R_O-KO)} {TOP} {f(x+R_O)} {TOP}"
            f"H{f(xr)}V{BASE}")


def up_from(xs):
    return f"H{f(xs)}V{IN_Y}"


def down_to(xs):
    return f"H{f(xs+R_I)}C{f(xs+R_I-KI)} {IN_Y} {f(xs)} {f(IN_Y+R_I-KI)} {f(xs)} {f(IN_Y+R_I)}V{BASE}"


def n_letter(x, w=15.8):
    xr = x + w
    return outer(x, xr) + up_from(xr - S) + down_to(x + S) + "Z", w


def m_letter(x, w1=15.8):
    W = 2 * w1 - S
    xr, xm = x + W, x + w1 - S
    return outer(x, xr) + up_from(xr - S) + down_to(xm + S) + up_from(xm) + down_to(x + S) + "Z", W


def r_letter(x):
    return (f"M{f(x)} {BASE}H{f(x+S)}V12.4413C{f(x+S)} 11.2743 {f(x+5.1722)} {IN_Y} {f(x+6.3393)} {IN_Y}"
            f"H{f(x+8.4524)}V{TOP}H{f(x+6.3393)}C{f(x+2.8382)} {TOP} {f(x)} 9.46851 {f(x)} 12.9696V{BASE}Z"), 8.4524


K = 15.2692 / 22.5
TY = 5.87695 - 3 * K
GAP = {"dr": 0.6, "rs": 0.8, "ss": 2.1131}


def build(o):
    cr, ch, crotch, slit = w_mark(o)
    d = min(13.1213, o * LETTER_K) if o < 16.6 else 13.1213
    x = (27.25 + o - 4.75) * K + (20.2695 - 15.2692)
    parts, spans = [], []
    for fn, g in [(lambda x: w_letter(x, d), "dr"), (o_letter, "rs"), (n_letter, "ss"),
                  (m_letter, "rs"), (o_letter, "rs"), (r_letter, None)]:
        p, w = fn(x)
        parts.append(p)
        spans.append([x, x + w])
        x += w + (GAP[g] if g else 0)
    return {"o": o, "letter_d": d, "crown": cr, "chev": ch, "crotch": crotch, "slit": slit,
            "mark_w": 27.25 + o + 4.75, "lock_w": x + 1.6, "word": "".join(parts),
            "letters": [{"ch": c, "d": p, "x0": a, "x1": b} for c, p, (a, b) in zip("wonmor", parts, spans)]}


def lockup(v, mc, tc):
    g = f'<g transform="translate({f(-4.75*K)} {f(TY)}) scale({f(K)})">'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 {f(v["lock_w"])} 24" fill="none">'
            f'{g}<path d="{v["crown"]}" fill="{mc}"/><path d="{v["chev"]}" fill="{mc}"/></g>'
            f'<path d="{v["word"]}" fill="{tc}"/></svg>\n')


def mark(v, col):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 {f(v["mark_w"])} 32" fill="none">'
            f'<path d="{v["crown"]}" fill="{col}"/><path d="{v["chev"]}" fill="{col}"/></svg>\n')


def mark_large(v, col):
    # tight box like vetric-mark-large (no side margin)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="4.75 3 {f(v["mark_w"]-9.5)} 26.0206" fill="none">'
            f'<path d="{v["crown"]}" fill="{col}"/><path d="{v["chev"]}" fill="{col}"/></svg>\n')


def webclip(v, col):
    # 256 square like vetric-webclip; the wider W is scaled to keep a 26px side margin
    s = min(8.0, 204 / (v["mark_w"] - 9.5))
    tx = (256 - (v["mark_w"] - 9.5) * s) / 2 - 4.75 * s
    ty = (256 - 26.0206 * s) / 2 - 3 * s
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none">'
            f'<g transform="translate({f(tx)} {f(ty)}) scale({f(s)})"><path d="{v["crown"]}" fill="{col}"/>'
            f'<path d="{v["chev"]}" fill="{col}"/></g></svg>\n')


def write(prefix, v):
    files = {
             f"{prefix}mark-large.svg": mark_large(v, BLUE),
             f"{prefix}webclip.svg": webclip(v, BLUE),f"{prefix}logo-full.svg": lockup(v, BLUE, INK),
             f"{prefix}logo-full-white.svg": lockup(v, BLUE, WHITE),
             f"{prefix}logo-full-mono-dark.svg": lockup(v, INK, INK),
             f"{prefix}logo-full-mono-white.svg": lockup(v, WHITE, WHITE),
             f"{prefix}mark.svg": mark(v, BLUE),
             f"{prefix}mark-white.svg": mark(v, WHITE)}
    for n, s in files.items():
        open(os.path.join(OUT, n), "w", encoding="utf-8").write(s)


built = {k: build(o) for k, o in VARIANTS.items()}
write("wonmor-", built[MAIN])
for k, v in built.items():
    write(f"wonmor-{k}-", v)

json.dump({"main": MAIN, "K": K, "TY": TY, "vCrown": crown(0), "vChev": chevron(0),
           "v2Chev": {k: chevron(o) for k, o in VARIANTS.items()}, "variants": built},
          open(os.path.join(OUT, "_geometry.json"), "w"), indent=1)
for k, v in built.items():
    print(k, "o", round(v["o"], 3), "letter_d", round(v["letter_d"], 3), "mark_w", round(v["mark_w"], 2),
          "slit", v["slit"] and round(v["slit"], 2), "crotch", [round(c, 2) for c in v["crotch"]], "lock_w", round(v["lock_w"], 2))
