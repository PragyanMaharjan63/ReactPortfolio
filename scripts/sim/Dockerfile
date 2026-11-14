# syntax=docker/dockerfile:1
#
# Build container for the robot simulation assets.
#
# It produces two things the site serves but does not build at runtime:
#   * client/public/sim/*.wasm  — the ESP32 firmware compiled to WebAssembly
#   * client/public/models/*.glb — the Blender assemblies, compressed
#
# Neither the Emscripten toolchain nor Blender belongs in the runtime image, and
# neither should be a prerequisite for `npm run build`. So this is a build-only
# container: run it, commit what it emits, ship a static site.
#
#   docker build -t portfolio-sim-build -f scripts/sim/Dockerfile .
#   docker run --rm -v "$PWD:/work" portfolio-sim-build
#
# or just:  ./scripts/sim/build.sh

FROM emscripten/emsdk:4.0.14

# gltf-transform compresses the exported GLBs. Node is already in the emsdk
# image, so this is the only extra dependency.
RUN npm install -g @gltf-transform/cli@4.2.1 \
    && npm cache clean --force

WORKDIR /work

COPY scripts/sim/build.sh /usr/local/bin/build-sim
RUN chmod +x /usr/local/bin/build-sim

ENTRYPOINT ["/usr/local/bin/build-sim"]
