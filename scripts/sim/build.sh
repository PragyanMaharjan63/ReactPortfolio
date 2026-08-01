#!/usr/bin/env bash
# Compile the ESP32 firmware to WebAssembly and compress the exported models.
#
# Runs inside the container from scripts/sim/Dockerfile, with the repo mounted
# at /work. Outside the container it still works if emcc and gltf-transform are
# on PATH.
set -euo pipefail

ROOT="${SIM_ROOT:-/work}"
cd "$ROOT"

SHIMS="scripts/sim/shims"
SRC="scripts/sim/src"
QUAD="scripts/robotCode/quadrapod3d"
YETI="scripts/robotCode/yetibot"
OUT="client/public/sim"

mkdir -p "$OUT"

# Shared across both modules. -Os over -O3: this is control logic, not a hot
# loop, and download size matters more than a few microseconds of gait maths.
COMMON=(
  -Os
  -std=gnu++17
  -s MODULARIZE=1
  -s EXPORT_ES6=1
  -s ENVIRONMENT=web
  -s ALLOW_MEMORY_GROWTH=1
  -s FILESYSTEM=0
  -s EXPORTED_RUNTIME_METHODS=['HEAPU8','HEAP32','UTF8ToString']
  --no-entry
  -Wno-unused-command-line-argument
)

echo ">> quadruped gait -> $OUT/gait.mjs"
# Compiles the firmware's real gait and servo-config translation units.
emcc "${COMMON[@]}" \
  -I "$SHIMS" \
  -I "$QUAD/lib" \
  -I "$QUAD/lib/servo_calibration" \
  -I "$QUAD/lib/Walk" \
  -s EXPORTED_FUNCTIONS="['_gait_init','_gait_reset','_gait_run','_gait_data','_gait_count','_gait_stride','_gait_servos','_gait_duration_ms','_gait_current_angle','_gait_physical_angle','_gait_pin','_gait_name','_gait_is_inverted','_malloc','_free']" \
  -o "$OUT/gait.mjs" \
  "$SRC/gait_sim.cpp" \
  "$QUAD/lib/Walk/walk.cpp" \
  "$QUAD/lib/servo_calibration/ServoConfig.cpp"

echo ">> yetibot state machine -> $OUT/yeti.mjs"
# The 772 face frames and the 150 boot frames are static data segments; they are
# mostly zero bytes and compress hard over the wire.
emcc "${COMMON[@]}" \
  -I "$SHIMS" \
  -I "$YETI/includes" \
  -I "$YETI/lib/frames" \
  -s EXPORTED_FUNCTIONS="['_yeti_setup','_yeti_tick','_yeti_touch','_yeti_state','_yeti_frame','_yeti_menu_index','_yeti_menu_count','_yeti_menu_item','_yeti_tap_count','_yeti_tap_window_ms','_yeti_hold_threshold_ms','_yeti_sleep_timeout_ms','_yeti_frame_delay_ms','_yeti_screen_width','_yeti_screen_height','_yeti_cmds','_yeti_cmd_count','_yeti_strpool','_yeti_boot_frames','_yeti_boot_frame','_malloc','_free']" \
  -o "$OUT/yeti.mjs" \
  "$SRC/yeti_sim.cpp"

# --- draco decoder ---------------------------------------------------------
# Taken from the installed `three` package rather than a CDN, so the decoder
# always matches the renderer and the site works behind a strict CSP.
DRACO_SRC="node_modules/three/examples/jsm/libs/draco/gltf"
if [ -d "$DRACO_SRC" ]; then
  mkdir -p client/public/draco
  cp "$DRACO_SRC"/* client/public/draco/
  echo ">> draco decoder copied from three@$(node -p "require('./node_modules/three/package.json').version" 2>/dev/null || echo '?')"
else
  echo ">> WARNING: $DRACO_SRC missing; run npm install before building assets"
fi

# --- model compression -----------------------------------------------------
# Only if gltf-transform is available; the .glb files are already valid without
# it, just larger.
if command -v gltf-transform >/dev/null 2>&1; then
  for m in quadruped yetibot; do
    f="client/public/models/$m.glb"
    [ -f "$f" ] || continue
    before=$(stat -c%s "$f")

    # Deliberately *not* `gltf-transform optimize`. Its pipeline prunes nodes it
    # considers unused, and every joint in this rig is an empty node with no
    # mesh attached — exactly what that pass removes. dedup + draco touch mesh
    # data only and leave the node graph alone.
    #
    # The temp file must keep a .glb extension: gltf-transform picks its
    # container from the output extension, so any other suffix silently writes
    # JSON glTF plus a .bin sidecar instead of one binary file.
    tmp1="client/public/models/.$m.a.glb"
    tmp2="client/public/models/.$m.b.glb"
    if gltf-transform dedup "$f" "$tmp1" >/dev/null 2>&1 &&
       gltf-transform draco "$tmp1" "$tmp2" >/dev/null 2>&1; then
      mv "$tmp2" "$f"
    else
      echo ">> $m.glb compression failed, keeping uncompressed"
    fi
    rm -f "$tmp1" "$tmp2"

    after=$(stat -c%s "$f")
    echo ">> $m.glb $((before / 1024)) KB -> $((after / 1024)) KB"
  done

  # A model that lost its joints animates nothing, and the failure is invisible
  # until someone clicks a button in the browser. Check it here instead.
  node -e '
    const fs = require("fs");
    const p = "client/public/models/quadruped.glb";
    const b = fs.readFileSync(p);
    if (b.readUInt32LE(0) !== 0x46546c67) { console.error("not a binary GLB: " + p); process.exit(1); }
    const g = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString());
    const names = new Set(g.nodes.map(n => n.name));
    const want = [];
    for (const j of ["hip", "knee", "linkTop", "footPivot"])
      for (const l of ["FL", "FR", "BL", "BR"]) want.push(j + "_" + l);
    const missing = want.filter(n => !names.has(n));
    if (missing.length) { console.error("joints lost in compression: " + missing.join(", ")); process.exit(1); }
    console.log(">> joint check: all " + want.length + " joints present");
  '
else
  echo ">> gltf-transform not found, skipping model compression"
fi

echo
echo "wasm:"
ls -la "$OUT"
