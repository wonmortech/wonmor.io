#!/usr/bin/env bash
# After capture: mux sound, web encodes + posters into site/film, key frames, AE + Figma zips.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out
mkdir -p "$OUT/release" ../site/film "$OUT/film/keyframes"
for f in 9x16 16x9; do
  src="$OUT/film/wonmor_film_$f.mp4"
  # master with sound (high quality)
  ffmpeg -v error -y -i "$src" -i "$OUT/audio/wonmor_sound.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest "$OUT/release/wonmor_film_$f.mp4"
  # web: smaller, sound kept (muted autoplay, toggle in UI)
  if [ "$f" = 9x16 ]; then sc="1080:1920"; else sc="1920:1080"; fi
  ffmpeg -v error -y -i "$src" -i "$OUT/audio/wonmor_sound.wav" -map 0:v -map 1:a -vf "scale=$sc:flags=lanczos" \
    -c:v libx264 -preset slow -crf 24 -tune film -x264-params aq-mode=3:aq-strength=1.0 -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a aac -b:a 128k -shortest "../site/film/wonmor_$f.mp4"
  ffmpeg -v error -y -ss 11.5 -i "$src" -frames:v 1 -vf "scale=$sc:flags=lanczos" -q:v 3 "../site/film/wonmor_$f.jpg"
done
# key frames for the Figma storyboard (one per shot, 9x16)
i=1
for t in 0.3 0.8 1.2 2.0 2.8 3.3 3.8 4.5 5.0 6.0 6.9 8.5 10.3 11.5 12.3 13.5 14.5 15.2 15.8 16.3 16.8 17.2 17.45 17.7 17.95 18.1 18.5 19.1; do
  ffmpeg -v error -y -ss "$t" -i "$OUT/film/wonmor_film_9x16.mp4" -frames:v 1 "$OUT/film/keyframes/S$(printf %02d $i).png"
  i=$((i+1))
done
node tools/ae.mjs
node tools/figma.mjs
cp "$OUT/release/wonmor_film_9x16.mp4" "$OUT/release/wonmor_film_16x9.mp4" "$OUT/ae/wonmor_AE/footage/film/" 2>/dev/null || true
rm -f "$OUT/release/wonmor_AE.zip" "$OUT/release/wonmor_Figma.zip"
powershell.exe -NoProfile -Command "Compress-Archive -Path '$(cygpath -w "$OUT/ae/wonmor_AE")' -DestinationPath '$(cygpath -w "$OUT/release/wonmor_AE.zip")' -Force; Compress-Archive -Path '$(cygpath -w "$OUT/figma/wonmor_Figma")' -DestinationPath '$(cygpath -w "$OUT/release/wonmor_Figma.zip")' -Force"
ls -la "$OUT/release" ../site/film
