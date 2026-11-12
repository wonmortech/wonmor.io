// Generates the After Effects package: build_wonmor.jsx (ExtendScript) + footage folder.
// The JSX rebuilds both comps (9x16, 16x9) from the same timeline data the MP4 was rendered from:
// editable shape layers with keyframes/eases, PNG sequences with time remap, plates, audio, shot markers.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../lib/geo.mjs';

const OUT = path.join(ROOT, 'out', 'ae', 'wonmor_AE');
const FOOT = path.join(OUT, 'footage');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(FOOT, { recursive: true });

const round = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : Array.isArray(v) ? v.map(round) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, round(x)])) : v);
const T = {};
for (const fmt of ['9x16', '16x9']) T[fmt] = round(JSON.parse(fs.readFileSync(path.join(ROOT, 'out', 'data', `timeline_${fmt}.json`), 'utf8')));

const copy = (rel) => {
  const src = path.join(ROOT, 'out', rel);
  if (!fs.existsSync(src)) { console.warn('missing', rel); return; }
  const dst = path.join(FOOT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
};
const used = new Set();
for (const t of Object.values(T)) for (const l of t.layers) {
  if (l.type === 'image') used.add(l.src);
  if (l.type === 'seq') for (let i = 0; i < l.count; i++) used.add(`${l.dir}/${String(i).padStart(4, '0')}.png`);
}
for (const rel of used) copy(rel);
for (const f of ['audio/wonmor_sound.wav', 'film/wonmor_film_9x16.mp4', 'film/wonmor_film_16x9.mp4']) copy(f);
fs.cpSync(path.join(ROOT, 'out', 'vectors'), path.join(OUT, 'vectors'), { recursive: true });

const SHOTS = [
  [0, 'S01 Glass diamond'], [0.57, 'S02 Flat outline'], [0.9, 'S03 Top edge'], [1.6, 'S04 Crown splits'], [2.33, 'S05 V notch'],
  [3.1, 'S06 Corner radius'], [3.43, 'S07 V doubles into W'], [4.43, 'S08 Fill: blue metal'], [4.6, 'S09 Scale down + sweep'],
  [5.57, 'S10 Paper reveal'], [6.57, 'S11 Outline mark'], [7.4, 'S12 Wordmark build'], [10.03, 'S13 Fill + scale down'],
  [11.07, 'S14 Light lockup'], [12.07, 'S15 Giant type + dot'], [13.07, 'S16 Phone'], [14.07, 'S17 Hoodie'], [15.07, 'S18 White glow'],
  [15.57, 'S19 3D float'], [16.07, 'S20 3D dark'], [16.57, 'S21 Iso outline'], [17.07, 'S22 Embroidery'], [17.33, 'S23 Black solid'],
  [17.57, 'S24 Notebook'], [17.83, 'S25 Badge'], [18.07, 'S26 Circle wipe'], [18.13, 'S27 Glass on blue'], [18.93, 'S28 Loop back'],
];

const jsx = `// wonmor brand film - After Effects builder. File > Scripts > Run Script File... and pick this file.
// Keep this file next to the "footage" folder. AE 2022 or newer.
(function () {
var DATA = ${JSON.stringify(T)};
var SHOTS = ${JSON.stringify(SHOTS)};
var BASE = File($.fileName).parent.fsName;

function rgb(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
function isKeys(v) { return v !== null && typeof v === 'object' && v.k instanceof Array; }
function first(v) { return isKeys(v) ? v.k[0][1] : v; }

var proj = app.project || app.newProject();
app.beginUndoGroup('wonmor film');
var root = proj.items.addFolder('wonmor');
var fFoot = proj.items.addFolder('footage'); fFoot.parentFolder = root;
var cache = {}, missing = [];
function importFile(rel, sequence) {
  var key = rel + (sequence ? '#seq' : '');
  if (cache[key]) return cache[key];
  var f = new File(BASE + '/footage/' + rel);
  if (!f.exists) { missing.push(rel); return null; }
  var io = new ImportOptions(f);
  if (sequence) { io.sequence = true; io.forceAlphabetical = true; }
  var it = proj.importFile(io);
  if (sequence) it.mainSource.conformFrameRate = 30;
  it.parentFolder = fFoot;
  cache[key] = it;
  return it;
}

function shapeOf(contour) {
  var s = new Shape(), v = [], it = [], ot = [], n = contour.length, i;
  for (i = 0; i < n; i++) { v.push(contour[i][0]); it.push([0, 0]); ot.push([0, 0]); }
  for (i = 0; i < n; i++) {
    var seg = contour[i];
    ot[i] = [seg[1][0] - seg[0][0], seg[1][1] - seg[0][1]];
    it[(i + 1) % n] = [seg[2][0] - seg[3][0], seg[2][1] - seg[3][1]];
  }
  s.vertices = v; s.inTangents = it; s.outTangents = ot; s.closed = true;
  return s;
}

function dims(prop) {
  var t = prop.propertyValueType;
  if (t === PropertyValueType.TwoD || t === PropertyValueType.ThreeD) return prop.value.length;
  return 1;
}

// spec: static value or {k:[[t, v, ease]]}; ease = 'hold' | 'linear' | [x1,y1,x2,y2] cubic-bezier
function setProp(prop, spec, conv) {
  conv = conv || function (x) { return x; };
  if (!isKeys(spec)) { prop.setValue(conv(spec)); return; }
  var k = spec.k, i;
  for (i = 0; i < k.length; i++) prop.setValueAtTime(k[i][0], conv(k[i][1]));
  for (i = 0; i < k.length; i++) {
    var e = k[i][2], idx = i + 1;
    if (e === 'hold') { prop.setInterpolationTypeAtKey(idx, prop.keyInInterpolationType(idx), KeyframeInterpolationType.HOLD); continue; }
    if (i === k.length - 1) continue;
    if (e === 'linear') {
      prop.setInterpolationTypeAtKey(idx, prop.keyInInterpolationType(idx), KeyframeInterpolationType.LINEAR);
      prop.setInterpolationTypeAtKey(idx + 1, KeyframeInterpolationType.LINEAR, prop.keyOutInterpolationType(idx + 1));
      continue;
    }
    if (e instanceof Array) {
      var a = conv(k[i][1]), b = conv(k[i + 1][1]), n = dims(prop), dt = k[i + 1][0] - k[i][0];
      var outE = [], inE = [];
      for (var d = 0; d < n; d++) {
        var dv = (typeof a === 'number') ? b - a : (a instanceof Array && typeof a[d] === 'number' ? b[d] - a[d] : 0);
        var avg = dv / dt;
        outE.push(new KeyframeEase(e[0] > 0 ? avg * e[1] / e[0] : 0, Math.max(0.1, Math.min(100, e[0] * 100))));
        inE.push(new KeyframeEase(e[2] < 1 ? avg * (1 - e[3]) / (1 - e[2]) : 0, Math.max(0.1, Math.min(100, (1 - e[2]) * 100))));
      }
      try {
        prop.setTemporalEaseAtKey(idx, prop.keyInTemporalEase(idx), outE);
        prop.setTemporalEaseAtKey(idx + 1, inE, prop.keyOutTemporalEase(idx + 1));
      } catch (err) { $.writeln('ease ' + prop.name + ': ' + err); }
    }
  }
}

var OPACITY_EXPR = 'var o = value / 100, p = thisLayer;\\nwhile (p.hasParent) { p = p.parent; o *= p.transform.opacity / 100; }\\no * 100;';
var STROKE_EXPR = 'var s = length(toComp([0, 0]), toComp([1, 0]));\\nvalue / Math.max(s, 0.0001);';

function transformLayer(L, l) {
  var tr = L.transform;
  tr.anchorPoint.setValue(l.anchor);
  tr.position.dimensionsSeparated = true;
  setProp(tr.xPosition, l.x);
  setProp(tr.yPosition, l.y);
  setProp(tr.scale, l.scale, function (s) { return [s * l.unit * 100, s * l.unit * 100]; });
  setProp(tr.rotation, l.rotation);
  setProp(tr.opacity, l.opacity, function (o) { return o * 100; });
  if (l.parent) tr.opacity.expression = OPACITY_EXPR;
}

function buildComp(T, name, folder) {
  var comp = proj.items.addComp(name, T.width, T.height, 1, T.duration, T.fps);
  comp.parentFolder = folder;
  comp.motionBlur = true;
  comp.shutterAngle = 180;
  comp.bgColor = [0, 0, 0];
  var byId = {}, data = {}, i;
  for (i = 0; i < T.layers.length; i++) data[T.layers[i].id] = T.layers[i];
  function span(l) { var a = l['in'], b = l.out, p = l.parent; while (p) { a = Math.max(a, data[p]['in']); b = Math.min(b, data[p].out); p = data[p].parent; } return [a, b]; }
  for (i = 0; i < T.layers.length; i++) {
    var l = T.layers[i], L = null;
    if (l.type === 'solid') {
      L = comp.layers.addSolid(rgb(first(l.color)), l.name, l.w, l.h, 1);
      var fill0 = L.property('ADBE Effect Parade').addProperty('ADBE Fill');
      setProp(fill0.property('ADBE Fill-0002'), l.color, rgb);
    } else if (l.type === 'grain') {
      L = comp.layers.addSolid([0.5, 0.5, 0.5], l.name, l.w, l.h, 1);
      L.adjustmentLayer = true;
      try { var nz = L.property('ADBE Effect Parade').addProperty('ADBE Noise'); nz.property(1).setValue(l.amount * 60); nz.property(3).setValue(0); } catch (e) {}
    } else if (l.type === 'group') {
      L = comp.layers.addNull(T.duration);
      L.name = l.name;
    } else if (l.type === 'image' || l.type === 'seq') {
      var item = l.type === 'image' ? importFile(l.src, false) : importFile(l.dir + '/0000.png', true);
      if (!item) continue;
      L = comp.layers.add(item);
      L.name = l.name;
      if (l.type === 'seq') {
        L.timeRemapEnabled = true;
        var tr = L.property('ADBE Time Remapping');
        while (tr.numKeys > 0) tr.removeKey(1);
        setProp(tr, l.frame, function (f) { return f / 30; });
      }
      L.motionBlur = true;
    } else if (l.type === 'shape') {
      L = comp.layers.addShape();
      L.name = l.name;
      var grp = L.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group');
      grp.name = l.name;
      var vecs = grp.property('ADBE Vectors Group');
      var cs = first(l.contours);
      for (var c = 0; c < cs.length; c++) {
        var pg = vecs.addProperty('ADBE Vector Shape - Group');
        (function (ci) { setProp(pg.property('ADBE Vector Shape'), l.contours, function (v) { return shapeOf(isKeys(l.contours) ? v[ci] : v[ci]); }); })(c);
      }
      if (l.trimEnd !== undefined) {
        var trim = vecs.addProperty('ADBE Vector Filter - Trim');
        setProp(trim.property('ADBE Vector Trim End'), l.trimEnd, function (v) { return v * 100; });
      }
      if (first(l.fill)) {
        var f = vecs.addProperty('ADBE Vector Graphic - Fill');
        setProp(f.property('ADBE Vector Fill Color'), l.fill, rgb);
        f.property('ADBE Vector Fill Opacity').setValue((l.fillOpacity === undefined ? 1 : l.fillOpacity) * 100);
        if (l.gradient) {
          var ramp = L.property('ADBE Effect Parade').addProperty('ADBE Ramp');
          ramp.property(1).expression = 'toComp([' + l.gradient.x0 + ',' + l.gradient.y0 + '])';
          ramp.property(2).setValue(rgb(l.gradient.c0));
          ramp.property(3).expression = 'toComp([' + l.gradient.x1 + ',' + l.gradient.y1 + '])';
          ramp.property(4).setValue(rgb(l.gradient.c1));
        }
      }
      if (first(l.stroke)) {
        var s = vecs.addProperty('ADBE Vector Graphic - Stroke');
        setProp(s.property('ADBE Vector Stroke Color'), l.stroke, rgb);
        var w = s.property('ADBE Vector Stroke Width');
        w.setValue(l.strokeWidth);
        w.expression = STROKE_EXPR;
        s.property('ADBE Vector Stroke Line Cap').setValue(2);
        s.property('ADBE Vector Stroke Line Join').setValue(2);
      }
      if (l.glow) {
        try { var gl = L.property('ADBE Effect Parade').addProperty('ADBE Glo2'); gl.property('ADBE Glo2-0003').setValue(l.glow.r); gl.property('ADBE Glo2-0004').setValue(1 + l.glow.alpha); } catch (e) {}
      }
      L.motionBlur = true;
    }
    if (!L) continue;
    byId[l.id] = L;
    if (l.parent && byId[l.parent]) L.parent = byId[l.parent];
    if (l.type !== 'solid' && l.type !== 'grain') transformLayer(L, l);
    var sp = span(l);
    L.inPoint = Math.max(0, sp[0]);
    L.outPoint = Math.min(T.duration, sp[1]);
    if (l.type === 'group') { L.enabled = false; }
  }
  var snd = importFile('audio/wonmor_sound.wav', false);
  if (snd) { var A = comp.layers.add(snd); A.name = 'Sound design'; A.moveToEnd(); }
  var ref = importFile('film/wonmor_film_' + T.format + '.mp4', false);
  if (ref) { var R = comp.layers.add(ref); R.name = 'REFERENCE (rendered film)'; R.guideLayer = true; R.enabled = false; R.audioEnabled = false; }
  for (i = 0; i < SHOTS.length; i++) comp.markerProperty.setValueAtTime(SHOTS[i][0], new MarkerValue(SHOTS[i][1]));
  return comp;
}

var c1 = buildComp(DATA['9x16'], 'wonmor_film_9x16', root);
var c2 = buildComp(DATA['16x9'], 'wonmor_film_16x9', root);
app.endUndoGroup();
c1.openInViewer();
alert('wonmor: 2 ta kompozitsiya tayyor (9x16 va 16x9).' + (missing.length ? '\\nTopilmadi: ' + missing.join(', ') : '') + '\\nREFERENCE qatlami - tayyor render, solishtirish uchun.');
})();
`;
fs.writeFileSync(path.join(OUT, 'build_wonmor.jsx'), jsx);
fs.copyFileSync(path.join(ROOT, 'pack', 'README_AE.txt'), path.join(OUT, 'README.txt'));
console.log('AE package:', OUT, 'footage files:', used.size);
