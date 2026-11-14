import Image from "next/image";

/** Small server-renderable poster; does not import the Three.js stack. */
export function RobotViewerSkeleton({ poster, priority = false }: { poster?: string; priority?: boolean }) {
  return (
    <div className="panel relative aspect-square w-full overflow-hidden" role="status" aria-label="Preparing interactive 3D viewer">
      {poster && <Image src={poster} alt="" fill sizes="(max-width: 1024px) 100vw, 600px" priority={priority} className="object-contain p-6" />}
    </div>
  );
}
