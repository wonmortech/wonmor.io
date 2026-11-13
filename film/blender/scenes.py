"""wonmor film: every 3D and photoreal shot, built procedurally in Blender (Cycles).

Run:  blender -b --factory-startup -P film/blender/scenes.py -- <shot> [--aspect 9x16|16x9] [--samples N] [--scale 1.0] [--frames a:b] [--save-blend]
Shots: gem, glassblue, float, dark3d, metal, phone, hoodie, embroidery, notebook
Output: film/out/render/<shot>[_16x9]/####.png (+ <shot>.blend with --save-blend, + avatar.json for phone).
"""
import bpy
import bmesh
import json
import math
import sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ROOT = Path(__file__).resolve().parents[1]
GEO = json.loads((ROOT / "out" / "data" / "geo.json").read_text())
TEX = ROOT / "out" / "textures"

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SHOT = argv[0] if argv else "gem"


def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default


ASPECT = opt("--aspect", "9x16")
SAMPLES = int(opt("--samples", "96"))
SCALE = float(opt("--scale", "1"))
FRAMES = opt("--frames", None)
SAVE_BLEND = "--save-blend" in argv


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


C = {k: srgb(v) for k, v in GEO["colors"].items()}


# ---------------------------------------------------------------- scene setup
def reset(res, transparent=False, view="Standard", samples=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples or SAMPLES
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.max_bounces = 16
    sc.cycles.transmission_bounces = 16
    sc.cycles.glossy_bounces = 8
    sc.cycles.caustics_reflective = True
    sc.cycles.caustics_refractive = True
    sc.cycles.blur_glossy = 0.5
    sc.render.resolution_x = int(res[0] * SCALE)
    sc.render.resolution_y = int(res[1] * SCALE)
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = transparent
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    sc.render.image_settings.color_depth = "8"
    sc.view_settings.view_transform = view
    sc.view_settings.look = "None"
    sc.render.fps = 30
    world = bpy.data.worlds.new("World")
    sc.world = world
    world.use_nodes = True
    return sc


def set_world(color, strength=1.0):
    bg = bpy.context.scene.world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength


NAMES = {
    "color": "Base Color", "metallic": "Metallic", "rough": "Roughness", "ior": "IOR",
    "trans": "Transmission Weight", "coat": "Coat Weight", "coat_rough": "Coat Roughness",
    "sheen": "Sheen Weight", "sheen_rough": "Sheen Roughness", "aniso": "Anisotropic",
    "film": "Thin Film Thickness", "film_ior": "Thin Film IOR", "spec": "Specular IOR Level", "disp": "Dispersion",
}


def mat(name, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    for k, v in kw.items():
        n = NAMES[k]
        if n not in b.inputs:
            print(f"[warn] {n} missing", flush=True)
            continue
        b.inputs[n].default_value = (*v, 1) if k == "color" else v
    return m


def bsdf(m):
    return m.node_tree.nodes["Principled BSDF"]


def area(name, loc, rot, size, energy, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = energy
    d.color = color
    d.size = size
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = [math.radians(a) for a in rot]
    o.visible_camera = False
    return o


GLOSSY_ONLY_STRIPS = SHOT.startswith("avatar")


def strip(name, loc, rot, w, h, strength, color=(1, 1, 1)):
    """Emissive softbox seen only in reflections and refractions."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = (w, h, 1)
    o.rotation_euler = [math.radians(a) for a in rot]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = (*color, 1)
    e.inputs["Strength"].default_value = strength
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if GLOSSY_ONLY_STRIPS:
        # light only through reflections: diffuse surfaces (backdrops) stay dark
        lp = nt.nodes.new("ShaderNodeLightPath")
        mx = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Glossy Ray"], mx.inputs[0])
        nt.links.new(e.outputs[0], mx.inputs[2])
        nt.links.new(mx.outputs[0], out.inputs[0])
    else:
        nt.links.new(e.outputs[0], out.inputs[0])
    o.data.materials.append(m)
    o.visible_camera = False
    o.visible_shadow = False
    o.visible_diffuse = False
    return o


def camera(loc, look, lens=50, ortho=None, dof=None):
    d = bpy.data.cameras.new("Cam")
    d.lens = lens
    d.sensor_width = 36
    if ortho:
        d.type = "ORTHO"
        d.ortho_scale = ortho
    o = bpy.data.objects.new("Cam", d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(look) - o.location).to_track_quat("-Z", "Y").to_euler()
    if dof:
        d.dof.use_dof = True
        d.dof.focus_distance = (Vector(look) - Vector(loc)).length
        d.dof.aperture_fstop = dof
    bpy.context.scene.camera = o
    return o


# ---------------------------------------------------------------- geometry
def polys_to_mesh(name, polys, depth, bevel=0.0, seg=3, unit=0.01, center=None):
    """Mark polygons (mark units, y down) -> extruded mesh, front face +Z, centred on origin."""
    center = center or (GEO["mark"]["w"] / 2, GEO["mark"]["h"] / 2)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    for pts in polys:
        if len(pts) > 2 and math.dist(pts[0], pts[-1]) < 1e-6:
            pts = pts[:-1]
        vs = [bm.verts.new(((x - center[0]) * unit, (center[1] - y) * unit, 0)) for x, y in pts]
        f = bm.faces.new(vs)
        f.normal_update()
        if f.normal.z < 0:
            f.normal_flip()
    res = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces))
    moved = [e for e in res["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, -depth), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bmesh.ops.translate(bm, vec=(0, 0, depth / 2), verts=list(bm.verts))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if bevel:
        m = o.modifiers.new("Bevel", "BEVEL")
        m.width = bevel
        m.segments = seg
        m.limit_method = "ANGLE"
        m.angle_limit = math.radians(30)
        m.harden_normals = True
    return o


def assign_by_normal(o, front, side, back=None):
    for m in (front, side, back or front):
        o.data.materials.append(m)
    for p in o.data.polygons:
        z = p.normal.z
        p.material_index = 0 if z > 0.9 else (2 if z < -0.9 else 1)


def mark_object(depth, bevel, front, side, back=None, seg=3):
    o = polys_to_mesh("Mark", GEO["polygons"]["crownW"] + GEO["polygons"]["w"], depth, bevel, seg)
    assign_by_normal(o, front, side, back)
    return o


def gem(name="Gem"):
    pts = []

    def ring(n, rad, z, rot=0.0):
        for i in range(n):
            a = 2 * math.pi * i / n + rot
            pts.append((rad * math.cos(a), rad * math.sin(a), z))
    ring(8, 0.56, 0.34)
    ring(8, 0.80, 0.19, math.pi / 8)
    ring(16, 1.0, 0.035, math.pi / 16)
    ring(16, 1.0, -0.035, math.pi / 16)
    ring(8, 0.56, -0.47, math.pi / 8)
    pts.append((0, 0, -0.86))
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in pts]
    bmesh.ops.convex_hull(bm, input=vs)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return o


def rounded_rect(w, h, r, n=10):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def slab(name, pts2d, depth, bevel=0.0, seg=4):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y, 0)) for x, y in pts2d])
    f.normal_update()
    if f.normal.z < 0:
        f.normal_flip()
    res = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=(0, 0, -depth), verts=[e for e in res["geom"] if isinstance(e, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if bevel:
        m = o.modifiers.new("Bevel", "BEVEL")
        m.width = bevel
        m.segments = seg
        m.limit_method = "ANGLE"
        m.harden_normals = True
    return o


def image_node(nt, path, colorspace="sRGB"):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(str(path))
    n.image.colorspace_settings.name = colorspace
    n.extension = "CLIP"
    return n


def bump_from(nt, height_socket, strength, distance=0.002):
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = strength
    b.inputs["Distance"].default_value = distance
    nt.links.new(height_socket, b.inputs["Height"])
    return b


# ---------------------------------------------------------------- render loop
def out_dir():
    d = ROOT / "out" / "render" / (SHOT + ("" if ASPECT == "9x16" else "_" + ASPECT))
    d.mkdir(parents=True, exist_ok=True)
    return d


def render_frames(n, update):
    d = out_dir()
    a, b = (0, n) if not FRAMES else [int(x) for x in FRAMES.split(":")]
    if SAVE_BLEND:
        update(0, n)
        bpy.ops.wm.save_as_mainfile(filepath=str(d / f"{SHOT}.blend"))
    for f in range(a, b):
        update(f, n)
        bpy.context.scene.render.filepath = str(d / f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"[{SHOT}] frame {f + 1}/{n}", flush=True)


def plate_res():
    return (1080, 1920) if ASPECT == "9x16" else (1920, 1080)


# ---------------------------------------------------------------- 3D shots
def glass_rig(k=1.0):
    strip("SoftboxTop", (0, -0.6, 3.2), (12, 0, 0), 3.0, 1.2, 14 * k)
    strip("StripL", (-2.6, -1.0, 0.6), (0, -70, 20), 0.35, 3.2, 22 * k, (0.85, 0.93, 1.0))
    strip("StripR", (2.6, -0.6, 0.9), (0, 70, -15), 0.3, 3.0, 18 * k, (0.7, 0.9, 1.0))
    strip("Floor", (0, 0, -2.6), (0, 0, 0), 5, 5, 1.6 * k, (0.45, 0.62, 1.0))
    area("Key", (-2.2, -2.8, 3.0), (55, 0, -35), 2.2, 260 * k)
    area("Rim", (2.5, 2.2, 1.6), (-60, 0, 135), 1.4, 180 * k, (0.7, 0.85, 1.0))


def shot_gem():
    """Small blue glass brilliant on ink. 31 frames = 45 deg of an 8-fold cut: frame 31 == frame 0."""
    reset((640, 640))
    set_world(C["ink"])
    g = gem()
    g.data.materials.append(mat("BlueGlass", color=(0.10, 0.42, 1.0), trans=1.0, ior=2.05, rough=0.0, disp=0.02))
    glass_rig(1.0)
    camera((0, -5.4, 1.0), (0, 0, -0.18), lens=60)
    render_frames(31, lambda f, n: setattr(g, "rotation_euler", (math.radians(4), 0, math.radians(45 * f / n))))


def shot_glassblue():
    reset((1000, 1000))
    set_world(C["blue"])
    g = gem()
    g.data.materials.append(mat("ClearGlass", color=(0.96, 0.98, 1.0), trans=1.0, ior=1.75, rough=0.0, disp=0.04))
    glass_rig(1.3)
    camera((0, -5.6, 0.85), (0, 0, -0.15), lens=55)

    def upd(f, n):
        t = f / (n - 1)
        g.rotation_euler = (math.radians(14 - 10 * t), math.radians(-6 + 8 * t), math.radians(10 + 62 * t))
    render_frames(24, upd)


def shot_float():
    reset((1000, 1000), transparent=True)
    set_world(C["blue"], 0.9)
    front = mat("Front", color=(0.86, 0.95, 1.0), rough=0.32, coat=0.4, coat_rough=0.12)
    side = mat("Side", color=C["blue"], rough=0.38, coat=0.3)
    o = mark_object(0.22, 0.014, front, side, side)
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 0, -0.62))
    bpy.context.object.is_shadow_catcher = True
    area("Key", (0.6, -1.0, 4.0), (8, 4, 0), 2.6, 520)
    area("Rim", (-2.6, 1.8, 1.5), (-70, 0, -125), 1.2, 160, (0.75, 0.9, 1.0))
    area("Fill", (2.4, -2.6, 0.8), (75, 0, 40), 2.0, 70)
    camera((0, -6.0, 0.55), (0, 0, 0.05), lens=58)

    def upd(f, n):
        t = f / (n - 1)
        o.rotation_euler = (math.radians(90), 0, math.radians(82 * math.sin(math.pi * t) - 18 * t))
        o.location = (0, 0, 0.2 + 0.03 * math.sin(math.pi * t))
    render_frames(15, upd)


def shot_dark3d():
    reset((1200, 1200), transparent=True)
    set_world(C["ink"])
    front = mat("FrontGrad", rough=0.3, coat=0.5, coat_rough=0.08)
    nt = front.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["X"], ramp.inputs[0])
    ramp.color_ramp.elements[0].color = (*srgb("#2A5BFF"), 1)
    ramp.color_ramp.elements[1].color = (*srgb("#5B3BE6"), 1)
    nt.links.new(ramp.outputs[0], bsdf(front).inputs["Base Color"])
    side = mat("SideDeep", color=srgb("#0A1A6B"), rough=0.35, metallic=0.2)
    o = mark_object(0.3, 0.028, front, side, side)
    area("Top", (0, 0.4, 3.2), (-8, 0, 0), 3.0, 420, (0.6, 0.9, 1.0))
    area("CyanL", (-3.0, 1.2, 1.0), (-75, 0, -110), 0.8, 260, (0.45, 0.85, 1.0))
    area("CyanR", (3.0, 1.0, 0.6), (-75, 0, 110), 0.8, 220, (0.45, 0.85, 1.0))
    area("Key", (-1.5, -3.5, 1.0), (75, 0, -20), 2.5, 160)
    camera((0, -4.4, 0.25), (0, 0, 0), lens=55)

    def upd(f, n):
        t = f / (n - 1)
        o.rotation_euler = (math.radians(90 + 8 - 6 * t), 0, math.radians(-26 + 22 * t))
    render_frames(15, upd)


def shot_metal():
    reset((1100, 760), transparent=True)
    set_world(C["ink"])
    front = mat("BlueMetal", color=srgb("#3A78FF"), metallic=1.0, rough=0.16, film=360.0, film_ior=1.35, coat=0.6, coat_rough=0.05)
    side = mat("BlueMetalSide", color=srgb("#1F5BFF"), metallic=1.0, rough=0.25)
    o = mark_object(0.08, 0.012, front, side, side)
    o.rotation_euler = (math.radians(90), 0, 0)
    # Front faces mirror what is behind the camera: a soft blue-white wall there, plus a moving bright bar.
    strip("Wall", (0, -9, 0), (90, 0, 0), 8.0, 5.0, 0.55, (0.55, 0.72, 1.0))
    strip("Top", (0, -3.0, 2.6), (60, 0, 0), 5.0, 1.2, 3.0, (0.85, 0.92, 1.0))
    strip("Under", (0, -3.0, -2.6), (-60, 0, 0), 5.0, 1.2, 1.2, (0.3, 0.5, 1.0))
    sweep = strip("Sweep", (0, -8.5, 0), (90, 0, 22), 0.5, 7.0, 9.0)
    camera((0, -6, 0), (0, 0, 0), ortho=1.95)

    def upd(f, n):
        t = f / (n - 1)
        e = t * t * (3 - 2 * t)
        sweep.location = (-4.5 + 9.0 * e, -8.5, 0)
    render_frames(34, upd)


# ---------------------------------------------------------------- photoreal plates
def shot_phone():
    reset(plate_res(), view="AgX", samples=max(SAMPLES, 128))
    set_world(srgb("#0B0C12"))
    pw, ph, depth = 0.715, 1.475, 0.083
    body = slab("Phone", rounded_rect(pw, ph, 0.112, 14), depth, 0.012, 5)
    glass = mat("FrontGlass", color=(0.004, 0.004, 0.005), rough=0.05, coat=1.0, coat_rough=0.02)
    ti = mat("Titanium", color=srgb("#B9BBBE"), metallic=1.0, rough=0.34, aniso=0.5)
    back = mat("Back", color=srgb("#C9CACC"), rough=0.55)
    assign_by_normal(body, glass, ti, back)
    sw, sh = pw - 0.062, ph - 0.062
    me = bpy.data.meshes.new("Screen")
    bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y, 0.0006)) for x, y in rounded_rect(sw, sh, 0.085, 14)])
    uv = bm.loops.layers.uv.new()
    for l in f.loops:
        l[uv].uv = (l.vert.co.x / sw + 0.5, l.vert.co.y / sh + 0.5)
    bm.to_mesh(me)
    bm.free()
    scr = bpy.data.objects.new("Screen", me)
    bpy.context.collection.objects.link(scr)
    sm = bpy.data.materials.new("ScreenMat")
    sm.use_nodes = True
    nt = sm.node_tree
    nt.nodes.clear()
    img = image_node(nt, TEX / "ig-screen.png")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.55
    nt.links.new(img.outputs["Color"], em.inputs["Color"])
    gl = nt.nodes.new("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.03
    fr = nt.nodes.new("ShaderNodeFresnel")
    fr.inputs["IOR"].default_value = 1.5
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fr.outputs[0], mix.inputs[0])
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(gl.outputs[0], mix.inputs[2])
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(mix.outputs[0], out.inputs[0])
    scr.data.materials.append(sm)
    rig = bpy.data.objects.new("PhoneRig", None)
    bpy.context.collection.objects.link(rig)
    body.parent = rig
    scr.parent = rig
    rig.rotation_euler = (math.radians(10), math.radians(-17), math.radians(-7))
    strip("Sky", (0.4, 1.2, 3.0), (-20, 0, 0), 4, 2, 3.0)
    strip("EdgeL", (-2.4, 0.2, 0.8), (0, -65, 0), 0.25, 3, 12)
    area("Key", (-1.6, 1.2, 2.6), (-30, -30, 0), 2.0, 140)
    area("Rim", (2.0, 1.5, 1.0), (-60, 50, 0), 1.2, 90, (0.8, 0.88, 1.0))
    # Phone lies in the XY plane facing +Z (top of the screen = +Y). Camera above, up = +Y,
    # framed so only the top-left of the phone is in view, like the reference.
    if ASPECT == "9x16":
        tgt, dist, lens = (-0.04, 0.26), 1.28, 50
    else:
        tgt, dist, lens = (0.02, 0.28), 1.25, 36
    d = bpy.data.cameras.new("Cam")
    d.lens = lens
    d.dof.use_dof = True
    d.dof.focus_distance = dist
    d.dof.aperture_fstop = 4.0
    cam = bpy.data.objects.new("Cam", d)
    bpy.context.collection.objects.link(cam)
    tilt = math.radians(12)
    cam.location = (tgt[0], tgt[1] - dist * math.sin(tilt), dist * math.cos(tilt))
    cam.rotation_euler = (tilt, 0, 0)
    bpy.context.scene.camera = cam
    bpy.context.view_layer.update()
    meta = json.loads((TEX / "ig-screen.json").read_text())
    u, v = meta["cx"] / meta["w"], 1 - meta["cy"] / meta["h"]
    local = Vector(((u - 0.5) * sw, (v - 0.5) * sh, 0.0006))
    edge = local + Vector((meta["r"] / meta["w"] * sw, 0, 0))
    sc = bpy.context.scene
    p = world_to_camera_view(sc, cam, rig.matrix_world @ local)
    q = world_to_camera_view(sc, cam, rig.matrix_world @ edge)
    rx, ry = sc.render.resolution_x, sc.render.resolution_y
    av = {"x": p.x * rx, "y": (1 - p.y) * ry, "r": math.hypot((q.x - p.x) * rx, (q.y - p.y) * ry), "w": rx, "h": ry}
    (out_dir() / "avatar.json").write_text(json.dumps(av))
    render_frames(1, lambda f, n: None)


def fabric_material(name, color, scale=900, sheen=0.7, wave=None):
    m = mat(name, color=color, rough=0.82, sheen=sheen, sheen_rough=0.4, spec=0.25)
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    h = noise.outputs["Fac"]
    if wave:
        w = nt.nodes.new("ShaderNodeTexWave")
        w.wave_type = "BANDS"
        w.bands_direction = "DIAGONAL"
        w.inputs["Scale"].default_value = wave
        w.inputs["Distortion"].default_value = 1.5
        nt.links.new(tc.outputs["Object"], w.inputs["Vector"])
        mx = nt.nodes.new("ShaderNodeMath")
        mx.operation = "MULTIPLY_ADD"
        mx.inputs[1].default_value = 0.5
        nt.links.new(w.outputs["Fac"], mx.inputs[0])
        nt.links.new(noise.outputs["Fac"], mx.inputs[2])
        h = mx.outputs[0]
    bump = bump_from(nt, h, 0.35)
    nt.links.new(bump.outputs[0], bsdf(m).inputs["Normal"])
    return m, nt, bump


def cloth_plane(name, w, h, subdiv, folds):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=subdiv[0], y_subdivisions=subdiv[1], size=1)
    o = bpy.context.object
    o.name = name
    o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(scale=True)
    for i, (sc, st) in enumerate(folds):
        t = bpy.data.textures.new(f"{name}Fold{i}", "CLOUDS")
        t.noise_scale = sc
        t.noise_depth = 2
        d = o.modifiers.new(f"Fold{i}", "DISPLACE")
        d.texture = t
        d.strength = st
        d.texture_coords = "LOCAL"
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def cord(name, pts, radius, material):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 6
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        sp.points[i].co = (*p, 1)
    sp.use_endpoint_u = True
    sp.order_u = 4
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    return o


def uv_decal(nt, img, width_frac, cx, cy, plane_w, plane_h, aspect):
    """Place an image (aspect = w/h) on a plane's UV with centre (cx, cy) in 0..1 and width as a fraction of the plane."""
    uvn = nt.nodes.new("ShaderNodeUVMap")
    vm = nt.nodes.new("ShaderNodeVectorMath")
    vm.operation = "MULTIPLY_ADD"
    sx = 1 / width_frac
    sy = sx * (plane_h / plane_w) * aspect
    vm.inputs[1].default_value = (sx, sy, 1)
    vm.inputs[2].default_value = (0.5 - cx * sx, 0.5 - cy * sy, 0)
    nt.links.new(uvn.outputs[0], vm.inputs[0])
    nt.links.new(vm.outputs[0], img.inputs["Vector"])


def shot_hoodie():
    reset(plate_res(), view="AgX", samples=max(SAMPLES, 128))
    set_world(srgb("#06070B"))
    pw, ph = 3.2, 4.2
    cloth = cloth_plane("Hoodie", pw, ph, (260, 340), [(1.4, 0.28), (0.45, 0.06)])
    fab, nt, bump = fabric_material("Fleece", srgb("#0F1013"), 1400, 0.35)
    img = image_node(nt, TEX / "mark-w_blue.png")
    uv_decal(nt, img, 0.30, 0.52, 0.60, pw, ph, GEO["mark"]["w"] / GEO["mark"]["h"])
    pr = nt.nodes.new("ShaderNodeBsdfPrincipled")
    pr.inputs["Base Color"].default_value = (*srgb("#2A63FF"), 1)
    pr.inputs["Roughness"].default_value = 0.55
    nt.links.new(bump.outputs[0], pr.inputs["Normal"])
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(img.outputs["Alpha"], mix.inputs[0])
    nt.links.new(bsdf(fab).outputs[0], mix.inputs[1])
    nt.links.new(pr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], nt.nodes["Material Output"].inputs[0])
    cloth.data.materials.append(fab)
    white = mat("Cotton", color=srgb("#E8E6E0"), rough=0.7, sheen=0.4)
    wn = white.node_tree
    wtc = wn.nodes.new("ShaderNodeTexCoord")
    wv = wn.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.bands_direction = "DIAGONAL"
    wv.inputs["Scale"].default_value = 60
    wn.links.new(wtc.outputs["Object"], wv.inputs["Vector"])
    wb = bump_from(wn, wv.outputs["Fac"], 0.6)
    wn.links.new(wb.outputs[0], bsdf(white).inputs["Normal"])
    cord("CordL", [(-0.42, 2.3, 0.10), (-0.40, 1.6, 0.15), (-0.46, 0.6, 0.14), (-0.43, -0.4, 0.11), (-0.50, -1.4, 0.12)], 0.028, white)
    cord("CordR", [(0.36, 2.3, 0.10), (0.38, 1.4, 0.14), (0.33, 0.5, 0.15), (0.37, -0.6, 0.12), (0.31, -1.6, 0.13)], 0.028, white)
    tip = mat("Aglet", color=(0.85, 0.85, 0.85), rough=0.2, coat=0.6)
    for x, y in ((-0.50, -1.4), (0.31, -1.6)):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.031, depth=0.22, location=(x, y - 0.1, 0.12), rotation=(math.radians(90), 0, 0))
        bpy.context.object.data.materials.append(tip)
    area("Key", (1.8, 1.6, 3.4), (-25, 25, 0), 2.2, 120)
    area("BlueRim", (-2.4, 2.0, 0.3), (-25, -84, 0), 0.7, 150, srgb("#2A63FF"))
    area("Fill", (0.5, -1.0, 3.5), (15, 0, 0), 3.0, 12)
    if ASPECT == "9x16":
        camera((0.05, -0.15, 4.6), (0.0, 0.15, 0.0), lens=50, dof=5.6)
    else:
        camera((0.05, 0.2, 3.4), (0.0, 0.25, 0.0), lens=40, dof=5.6)
    render_frames(1, lambda f, n: None)


def shot_embroidery():
    reset(plate_res(), view="AgX", samples=max(SAMPLES, 160))
    set_world(srgb("#05060A"))
    cloth = cloth_plane("Fabric", 6, 6, (120, 120), [(2.0, 0.08)])
    fab, _, _ = fabric_material("Twill", srgb("#14151A"), 2600, 0.6, wave=180)
    cloth.data.materials.append(fab)
    thread = mat("Thread", color=srgb("#2C63FF"), rough=0.33, sheen=0.5, aniso=0.6, coat=0.15)
    tn = thread.node_tree
    ttc = tn.nodes.new("ShaderNodeTexCoord")
    wv = tn.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.bands_direction = "DIAGONAL"
    wv.inputs["Scale"].default_value = 85
    wv.inputs["Distortion"].default_value = 0.6
    wv.inputs["Detail"].default_value = 3
    tn.links.new(ttc.outputs["Object"], wv.inputs["Vector"])
    tb = bump_from(tn, wv.outputs["Fac"], 1.0, 0.03)
    tn.links.new(tb.outputs[0], bsdf(thread).inputs["Normal"])
    o = mark_object(0.10, 0.045, thread, thread, thread, seg=6)
    o.modifiers["Bevel"].profile = 0.8
    s = 0.25
    o.scale = (s, s, s)
    o.location = (0, 0.0, 0.006)
    area("Raking", (-1.6, 0.5, 0.45), (0, -72, 20), 0.6, 90)
    area("Key", (0.8, -0.8, 1.6), (35, 25, 0), 1.0, 22)
    area("BlueBounce", (1.2, 0.8, 0.3), (0, 75, 0), 0.8, 10, (0.4, 0.6, 1.0))
    if ASPECT == "9x16":
        camera((0.03, -0.75, 1.45), (0.0, 0.02, 0.0), lens=58, dof=2.4)
    else:
        camera((0.03, -0.70, 1.25), (0.0, 0.02, 0.0), lens=50, dof=2.4)
    render_frames(1, lambda f, n: None)


def shot_notebook():
    reset(plate_res(), view="AgX", samples=max(SAMPLES, 128))
    set_world(srgb("#D9DDE4"), 0.6)
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -0.012))
    desk = bpy.context.object
    desk.data.materials.append(mat("Desk", color=srgb("#BFC4CC"), rough=0.6))
    pw, ph = 1.48, 2.1
    paper = slab("Paper", rounded_rect(pw, ph, 0.02, 3), 0.01)
    me = paper.data
    uv = me.uv_layers.new()
    for poly in me.polygons:
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = (v.x / pw + 0.5, v.y / ph + 0.5)
    pm = mat("PaperMat", color=srgb("#F4F3EF"), rough=0.92)
    nt = pm.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 900
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    bp = bump_from(nt, noise.outputs["Fac"], 0.12)
    nt.links.new(bp.outputs[0], bsdf(pm).inputs["Normal"])
    img = image_node(nt, TEX / "pencil.png", "Non-Color")
    uv_decal(nt, img, 0.74, 0.5, 0.50, pw, ph, 1.0)
    mixc = nt.nodes.new("ShaderNodeMix")
    mixc.data_type = "RGBA"
    mixc.inputs["A"].default_value = (*srgb("#F4F3EF"), 1)
    mixc.inputs["B"].default_value = (*srgb("#2B2C30"), 1)
    gain = nt.nodes.new("ShaderNodeMapRange")
    gain.inputs["From Max"].default_value = 0.55
    nt.links.new(img.outputs["Color"], gain.inputs["Value"])
    nt.links.new(gain.outputs[0], mixc.inputs["Factor"])
    nt.links.new(mixc.outputs["Result"], bsdf(pm).inputs["Base Color"])
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs["To Min"].default_value = 0.92
    rr.inputs["To Max"].default_value = 0.45
    nt.links.new(gain.outputs[0], rr.inputs["Value"])
    nt.links.new(rr.outputs[0], bsdf(pm).inputs["Roughness"])
    paper.data.materials.append(pm)
    holes = mat("Hole", color=(0.02, 0.02, 0.02), rough=0.9)
    wire = mat("Wire", color=srgb("#C8CBD0"), metallic=1.0, rough=0.22)
    n = 15
    parts = [paper]
    for i in range(n):
        x = -pw / 2 + 0.11 + i * (pw - 0.22) / (n - 1)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.003, location=(x, ph / 2 - 0.07, 0.0008))
        bpy.context.object.data.materials.append(holes)
        parts.append(bpy.context.object)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.0075, location=(x, ph / 2 - 0.035, 0.0))
        t = bpy.context.object
        t.rotation_euler = (0, math.radians(90), math.radians(6))
        t.data.materials.append(wire)
        for p in t.data.polygons:
            p.use_smooth = True
        parts.append(t)
    rig = bpy.data.objects.new("NotebookRig", None)
    bpy.context.collection.objects.link(rig)
    for o in parts:
        o.parent = rig
    rig.rotation_euler = (0, 0, math.radians(-5))
    area("Window", (-2.5, 2.0, 3.5), (-30, -35, 0), 3.0, 320, (1.0, 0.97, 0.92))
    area("Fill", (2.0, -1.5, 3.0), (30, 30, 0), 3.0, 60)
    if ASPECT == "9x16":
        camera((0.05, -0.55, 2.15), (0.0, 0.18, 0.0), lens=50, dof=8)
    else:
        camera((0.0, -0.75, 1.65), (0.0, 0.25, 0.0), lens=32, dof=8)
    render_frames(1, lambda f, n: None)


# ---------------------------------------------------------------- profile pictures (square, circle-safe)
AV = int(opt("--res", "2048"))


def micro_rough(m, base, amp, scale=900.0):
    """Roughness breakup so large faces read as a real finish, not CG-perfect."""
    nt = m.node_tree
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = 6
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = base - amp
    mr.inputs["To Max"].default_value = base + amp
    nt.links.new(nz.outputs["Fac"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], bsdf(m).inputs["Roughness"])
    return nz


def brushed(m, strength=0.04):
    """Fine horizontal brushing on aluminium: anisotropy + stretched-noise bump."""
    nt = m.node_tree
    b = bsdf(m)
    if "Anisotropic" in b.inputs:
        b.inputs["Anisotropic"].default_value = 0.0  # radial tangent swirls around the origin; keep brushing in the bump
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (2.0, 900.0, 900.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 3.0
    nz.inputs["Detail"].default_value = 8
    nt.links.new(mp.outputs[0], nz.inputs["Vector"])
    bp = bump_from(nt, nz.outputs["Fac"], strength, 0.0004)
    nt.links.new(bp.outputs[0], b.inputs["Normal"])


def backdrop(color, rough=0.9, y=0.55):
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, y, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object
    o.name = "Backdrop"
    m = mat("Backdrop", color=color, rough=rough)
    nt = m.node_tree
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 260
    nz.inputs["Detail"].default_value = 10
    bp = bump_from(nt, nz.outputs["Fac"], 0.08, 0.0006)
    nt.links.new(bp.outputs[0], bsdf(m).inputs["Normal"])
    o.data.materials.append(m)
    return o


def avatar_render(name, o, yaw=-13.0, pitch=7.0):
    o.rotation_euler = (math.radians(90 + pitch), 0, math.radians(yaw))
    d = ROOT / "out" / "avatar"
    d.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(d / f"{name}_{AV}.png")
    if SAVE_BLEND:
        bpy.ops.wm.save_as_mainfile(filepath=str(d / f"{name}.blend"))
    bpy.ops.render.render(write_still=True)
    print(f"[{name}] done", flush=True)


def avatar_cam():
    # 85 mm portrait lens; mark (1.64 wide) fills ~58 % of the frame, safe inside the circle crop.
    camera((0, -6.1, 0.0), (0, 0, 0), lens=85)
    bpy.context.scene.camera.data.sensor_width = 36


def shot_avatar_blue():
    """Satin white ceramic mark on brand-blue studio paper: soft key, real contact shadow."""
    reset((AV, AV))
    set_world(srgb("#0B1A4A"), 0.25)
    backdrop(srgb("#1F5BFF"), y=0.95)
    front = mat("Ceramic", color=srgb("#F4F6FA"), rough=0.32, coat=0.35, coat_rough=0.18, spec=0.5)
    micro_rough(front, 0.32, 0.05)
    side = mat("CeramicSide", color=srgb("#E9EDF4"), rough=0.36, coat=0.3, coat_rough=0.2)
    o = mark_object(0.24, 0.022, front, side, side, seg=8)
    o.location = (0, 0.0, 0.04)
    area("Key", (-2.6, -3.2, 2.8), (52, 0, -38), 3.6, 380)
    area("Fill", (3.0, -3.6, -0.4), (88, 0, 40), 4.0, 90, (0.85, 0.9, 1.0))
    area("Top", (0.0, -0.6, 3.2), (12, 0, 0), 2.4, 110)
    strip("EdgeL", (-3.2, -1.2, 0.4), (0, -72, 10), 0.4, 3.0, 6.0)
    avatar_cam()
    avatar_render("wonmor_avatar_blue", o)


def shot_avatar_dark():
    """Blue anodised, brushed aluminium mark with diamond-cut bright chamfers, on ink."""
    reset((AV, AV))
    set_world(srgb("#050608"), 0.05)
    backdrop(srgb("#0B0C11"), rough=0.7, y=0.95)
    sp = bpy.data.lights.new("Pool", "SPOT")
    sp.energy = 260
    sp.spot_size = math.radians(48)
    sp.spot_blend = 1.0
    sp.color = (0.78, 0.85, 1.0)
    sp.shadow_soft_size = 0.6
    so = bpy.data.objects.new("Pool", sp)
    bpy.context.collection.objects.link(so)
    so.location = (0.4, -3.0, 2.6)
    so.rotation_euler = (Vector((0, 0.95, 0.25)) - so.location).to_track_quat("-Z", "Y").to_euler()
    front = mat("Anodised", color=srgb("#3A78FF"), metallic=1.0, rough=0.3, coat=0.2, coat_rough=0.12)
    brushed(front)
    side = mat("Chamfer", color=srgb("#C9D6F2"), metallic=1.0, rough=0.08)
    o = mark_object(0.18, 0.036, front, side, side, seg=3)
    o.location = (0, 0.0, 0.04)
    strip("Soft", (0, -6.5, 1.2), (82, 0, 0), 7.0, 3.4, 5.5, (0.82, 0.88, 1.0))
    strip("Low", (0, -6.0, -2.2), (-70, 0, 0), 5.0, 1.0, 0.5, (0.4, 0.55, 1.0))
    strip("EdgeL", (-3.4, -1.4, 0.8), (0, -70, 15), 0.4, 3.4, 30.0)
    strip("EdgeR", (3.4, -1.0, 0.2), (0, 70, -10), 0.4, 3.4, 16.0)
    strip("EdgeTop", (0, -1.6, 3.0), (-60, 0, 0), 4.0, 0.3, 20.0)
    area("Key", (-2.2, -3.0, 3.0), (50, 0, -35), 2.6, 130)
    area("Back", (0, 0.4, 2.6), (-40, 0, 0), 2.0, 60, (0.5, 0.65, 1.0))
    avatar_cam()
    avatar_render("wonmor_avatar_dark", o)


def shot_avatar_paper():
    """Glossy brand-blue lacquer mark on warm-white paper, daylight."""
    reset((AV, AV))
    set_world(srgb("#DDE3EE"), 0.35)
    backdrop(srgb("#DCE2EC"), y=0.95)
    front = mat("Lacquer", color=srgb("#1F5BFF"), rough=0.2, coat=1.0, coat_rough=0.03)
    micro_rough(front, 0.2, 0.04)
    side = mat("LacquerSide", color=srgb("#1849D8"), rough=0.24, coat=0.8, coat_rough=0.05)
    o = mark_object(0.22, 0.02, front, side, side, seg=8)
    o.location = (0, 0.0, 0.04)
    area("Window", (-3.0, -2.6, 3.0), (50, 0, -45), 3.6, 300, (1.0, 0.98, 0.95))
    area("Fill", (3.0, -3.6, 0.0), (88, 0, 40), 4.0, 60)
    strip("Refl", (0, -6.0, 1.8), (75, 0, 0), 3.0, 1.2, 3.0)
    avatar_cam()
    avatar_render("wonmor_avatar_paper", o)


SHOTS = {
    "gem": shot_gem, "glassblue": shot_glassblue, "float": shot_float, "dark3d": shot_dark3d,
    "metal": shot_metal, "phone": shot_phone, "hoodie": shot_hoodie, "embroidery": shot_embroidery,
    "notebook": shot_notebook,
    "avatar_blue": shot_avatar_blue, "avatar_dark": shot_avatar_dark, "avatar_paper": shot_avatar_paper,
}
SHOTS[SHOT]()
