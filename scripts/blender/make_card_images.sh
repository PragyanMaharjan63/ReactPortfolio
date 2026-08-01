#!/usr/bin/env bash
# Render the listing-card image for each robot from its exported GLB.
#
#   ./scripts/blender/make_card_images.sh
#
# /work shows a still rather than a live viewer: two WebGL contexts and two
# model downloads on a listing page is a lot to pay before anyone has asked to
# see a robot. The interactive, firmware-driven viewer stays on the case study.
#
# Rendered at the card's own 16:10 so `object-cover` never crops a leg off, on
# transparency so the card surface shows through and the image survives a theme
# change. Needs Blender; WebP conversion needs Pillow.
set -euo pipefail
cd "$(dirname "$0")/../.."

render() {
  local model="$1" out="$2" yaw="$3" pitch="$4"
  mkdir -p "$(dirname "$out")"
  blender -b --factory-startup --python scripts/blender/render_card.py -- \
    "client/public/models/$model.glb" "$out.png" 1280 800 "$yaw" "$pitch" \
    2>&1 | grep -E '^###RENDERED###|Error:' || true
  python3 - "$out" <<'PY'
import os, sys
from PIL import Image
base = sys.argv[1]
im = Image.open(base + ".png").convert("RGBA")
im.save(base + ".webp", "WEBP", quality=88, method=6)
print(f"   {os.path.getsize(base + '.png')//1024} KB PNG -> "
      f"{os.path.getsize(base + '.webp')//1024} KB WebP  {im.size}")
os.remove(base + ".png")
PY
}

# The quadruped is wide and flat, so a higher pitch shows the leg layout. The
# YetiBot's display faces +Y in the .blend, hence a yaw past 180 to face it.
render quadruped client/public/media/quadruped/model 35 18
render yetibot   client/public/media/yetibot/model  205 12
