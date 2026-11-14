"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { RobotViewerSkeleton } from "./RobotLoaderSkeleton";
import { DRACO_PATH } from "@/sim/wasm";
import type { RobotViewerProps } from "./RobotViewer";

// The native browser/WASM/Three.js boundary is excluded from server rendering.
// Its original scene, controls, firmware, lighting and render quality survive.
const RobotViewer = dynamic(() => import("./RobotViewer"), { ssr: false });
const warmed = new Set<string>();

function warm(url: string) {
  if (warmed.has(url)) return;
  warmed.add(url);
  fetch(url).then((response) => {
    if (!response.ok) throw new Error(`Asset unavailable: ${url}`);
    return response.arrayBuffer();
  }).catch(() => warmed.delete(url));
}

export function RobotViewerLazy(props: RobotViewerProps) {
  useEffect(() => {
    if (!props.modelUrl) return;
    warm(props.modelUrl);
    warm(`${DRACO_PATH}draco_wasm_wrapper.js`);
    warm(`${DRACO_PATH}draco_decoder.wasm`);
  }, [props.modelUrl]);

  return (
    <div className="viewer-boundary">
      <div className="viewer-placeholder"><RobotViewerSkeleton poster={props.poster} priority={props.priority} /></div>
      <div className="viewer-content"><RobotViewer {...props} /></div>
    </div>
  );
}
