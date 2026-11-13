---
title: "Making a brand film from code"
description: "How the 19.4-second wonmor brand film is generated from one timeline file: a canvas renderer for the MP4, a generated After Effects project, Blender for materials, synthesised sound and a web encode."
date: 2026-11-13
kind: engineering
area: interfaces
featured: false
source:
  - "https://wonmor.io"
  - "https://playwright.dev/docs/api/class-page#page-screenshot"
  - "https://ffmpeg.org/ffmpeg-formats.html#image2pipe"
  - "https://trac.ffmpeg.org/wiki/Encode/H.264"
  - "https://docs.blender.org/manual/en/latest/render/cycles/index.html"
reproduce:
  note: "Inspect the published film yourself: duration, frame size, frame rate and codecs come straight from the file on wonmor.io."
  commands:
    - "ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact https://wonmor.io/film/wonmor_16x9.mp4"
---

The hero of wonmor.io is a 19.4-second brand film. A single diamond is cut, its lower part becomes a V, and the V doubles into the W of the mark before the wordmark is drawn. There is no video editor in the pipeline. The film is generated from one JavaScript file that describes every layer and keyframe, and the same file also produces an editable After Effects project. This post describes how that works and why we built it that way. The first version shipped on November 13, 2026.

```steps
Timeline :: One file describes every shot as layers with keyframes, eases, colours and in and out times.
Materials :: Blender renders the physical shots, such as the glass diamond and metal, as image sequences the timeline places.
Frames :: A browser draws each frame on a canvas with motion blur, and Playwright hands the pixels to ffmpeg.
Sound :: A Python script synthesises the sound design from the same cue times, normalised to -16 LUFS.
Outputs :: The same data produces web encodes, a master file, an After Effects project and a storyboard kit.
```

## Why a film and not a live animation

The first hero was a live stage: SVG shapes and a GSAP timeline running in the browser, with a three.js scene for the gem. When we compared it frame by frame with the kind of brand film we were aiming for, the conclusion was that the hero should be pre-rendered video. The live stage also gave us trouble when recorded: in headless capture with software WebGL it produced ghost frames, where two states of an SVG path were visible at once, even though a real Chrome window showed it cleanly. A brand moment should look the same on every screen, and a recording should match what we see.

A pre-rendered film solves that, but a film made in a video editor creates another problem: the source becomes a project file that only one tool can open, and every geometry change means redoing keyframes by hand. We wanted the film to stay code, reviewable in a diff and rebuilt in one command, while still giving a motion designer a real After Effects project.

## One timeline, three renderers

`timeline.mjs` is the single source of truth. It builds a list of layers (solids, shape layers, groups, image sequences, a grain layer) with keyframes and named eases, and writes it as JSON for two formats, 9:16 and 16:9. The mark geometry is imported from the same module that defines the logo, so the film can never drift from the brand.

A shot in the timeline reads like this. Here is the background, one layer whose colour cuts with a hold ease at each shot boundary:

```js
const BG = [
  [0, K.ink], [4.60, K.ink], [5.57, K.paper], [6.57, K.ink], [11.07, K.paper], [12.07, K.ink],
  [15.57, K.blue], [16.07, K.ink], [16.57, K.paper], [18.13, K.blue], [18.93, K.ink],
];
L({ type: 'solid', name: 'BG', w: Wd, h: Hd, color: kf(...BG.map(([t, c]) => [t, c, E.hold])) });
```

Three consumers read that JSON:

- **A canvas player** (`comp/player.js`) draws any moment `t` of the film. Capture loads it in headless Chromium through Playwright, renders frame after frame, takes a PNG screenshot of each and pipes it into ffmpeg (`-f image2pipe`, libx264, CRF 12) for the master.
- **An After Effects generator** (`tools/ae.mjs`) writes an ExtendScript file that rebuilds both compositions from the same data: editable shape layers with their keyframes and eases, image sequences with time remapping, plates, audio and shot markers.
- **A Figma kit** takes one key frame from each of the film's 28 shots and lays them out as a storyboard.

Because all three read the same numbers, a change to an ease or a cut time in the timeline shows up identically in the MP4 and in the After Effects project.

## Motion blur, and why every cut snaps to a frame

Motion graphics without motion blur look like a screen recording. A canvas has no shutter, so the player simulates one: for each output frame it draws several sub-frames across half a frame interval (a 180° shutter) and averages the pixels.

```js
// average sub-frames over a 180 degree shutter (half a frame interval)
for (let s = 0; s < samples; s++) {
  draw(octx, t + (s / samples) * (0.5 / timeline.fps));
  const d = octx.getImageData(0, 0, off.width, off.height).data;
  for (let i = 0; i < d.length; i++) acc[i] += d[i];
}
```

With four samples, the film's 582 frames (19.4 s at 30 fps) mean 2,328 full draws. That is slow and fine for an offline render.

It created one bug worth recording. If a cut falls between two frame starts, some of a frame's sub-samples come from the outgoing shot and some from the incoming one, and the average blends two unrelated images into a ghosted frame. The fix lives in the timeline, not the renderer. Before the JSON is written, every layer's in and out times and every keyframe are rounded to a frame start:

```js
const q = (t) => Math.round(t * FPS) / FPS;
```

Sub-samples then always fall inside a single shot.

## Materials from Blender, sound from Python

Some shots need real materials: a small blue glass diamond, a metallic mark, a few 3D scenes. These are rendered in Blender with Cycles on the CPU from a scripted scene file, one shot at a time, at 48 to 128 samples depending on the shot. The output is image sequences that the timeline places like any other layer. The diamond, for example, is a 31-frame seamless spin, so it can loop for as long as a shot needs. A full Blender pass takes about twenty minutes on the CPU. Everything else is vector and renders in the browser.

The sound is synthesised too, with no samples. A Python script with NumPy builds a stereo track at 48 kHz from cue times that follow the timeline, and ffmpeg's loudness filter normalises it to -16 LUFS. When a cut moves, the sound is regenerated rather than re-edited.

## Encoding for the web

A finishing script muxes the sound and produces three things: a high-quality master with 320 kbps AAC, web encodes for each aspect ratio, and a poster frame taken at 11.5 seconds. The web encode is x264 at CRF 24 with `-tune film`, adaptive quantisation mode 3, Lanczos scaling and `+faststart` so playback can begin before the file finishes downloading. Sound is kept at 128 kbps: at launch the page played the film muted by default, with a sound toggle and a pause button.

Today the published 16:9 file is 2,656,349 bytes: 1920×1080, 30 fps, H.264 with AAC, exactly 19.4 seconds.

## Limitations

- **Rendering is offline and slow.** Changing a single ease means re-rendering every frame with motion blur, plus Blender if a material shot changes. This is a batch job, not a live preview.
- **The After Effects project is faithful, not fully native.** Vector layers arrive as editable shapes with real keyframes, but Blender shots arrive as image sequences. Changing the diamond means going back to Blender.
- **A film cannot respond.** A live stage can react to the pointer and to scrolling; a film cannot. For a brand moment we accept that trade.
- **The release files are not in the repository.** Masters and the After Effects and Figma archives are build outputs and are ignored by git, so they have to be regenerated, or kept somewhere else, to be handed over.
