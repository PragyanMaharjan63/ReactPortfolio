import { Suspense, lazy, useEffect } from "react";
import { RobotViewerSkeleton } from "./RobotLoader";
import { DRACO_PATH } from "@/sim/wasm";
import type { RobotViewerProps } from "./RobotViewer";

/**
 * Code-split boundary for the WebGL viewer. three.js and the R3F stack live in
 * their own chunk (see manualChunks in vite.config.ts) and are only fetched
 * when this component mounts, so they never block first paint.
 */
const RobotViewer = lazy(() => import("./RobotViewer"));

/** Files the viewer will need, warmed at most once each per page load. */
const warmed = new Set<string>();

function warm(url: string) {
  if (warmed.has(url) || typeof fetch !== "function") return;
  warmed.add(url);
  // The body has to be consumed for the response to land in the HTTP cache.
  // Everything here is served with a max-age, so the real request that follows
  // is a cache hit rather than a second download.
  fetch(url).then((r) => r.arrayBuffer()).catch(() => {
    warmed.delete(url);
  });
}

export function RobotViewerLazy(props: RobotViewerProps) {
  const { modelUrl } = props;

  // Start the model and the Draco decoder downloading from *this* chunk, which
  // is part of the page bundle and runs almost immediately.
  //
  // Left to itself the sequence is badly serialised: the viewer chunk arrives,
  // then ~300 ms goes into parsing and executing three.js before any effect in
  // it runs, only then is the model requested, and only once the loader meets a
  // compressed mesh does it go and fetch its decoder. Measured on the landing
  // page, that put the first byte of the model at ~450 ms. Warming here
  // overlaps all of it with the three.js download and parse instead.
  useEffect(() => {
    if (!modelUrl) return;
    warm(modelUrl);
    warm(`${DRACO_PATH}draco_wasm_wrapper.js`);
    warm(`${DRACO_PATH}draco_decoder.wasm`);
  }, [modelUrl]);

  return (
    <Suspense fallback={<RobotViewerSkeleton poster={props.poster} />}>
      <RobotViewer {...props} />
    </Suspense>
  );
}
