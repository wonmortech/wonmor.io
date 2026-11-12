#!/usr/bin/env bash
# Renders every Blender shot of the wonmor film (CPU Cycles). Usage: bash film/render_all.sh [shot ...]
set -euo pipefail
cd "$(dirname "$0")/.."
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.1/blender.exe}"
mkdir -p film/out/logs
run() { echo "== $* $(date +%T)"; "$B" -b --factory-startup -P film/blender/scenes.py -- "$@" --save-blend > "film/out/logs/$1_$3.log" 2>&1; }
SHOTS="${*:-gem metal float dark3d glassblue phone hoodie embroidery notebook}"
for s in $SHOTS; do
  case "$s" in
    gem|glassblue) run "$s" --aspect 9x16 --samples 48 --scale 0.8 ;;
    float|dark3d|metal) run "$s" --aspect 9x16 --samples 56 --scale 0.8 ;;
    phone|hoodie|embroidery|notebook) run "$s" --aspect 9x16 --samples 128; run "$s" --aspect 16x9 --samples 128 ;;
  esac
done
echo "== done $(date +%T)"
