/**
 * Loader for the firmware modules compiled to WebAssembly.
 *
 * The `.mjs`/`.wasm` pairs are build artefacts produced by the container in
 * `scripts/sim/` and served from `/sim/`. They are deliberately *not* imported
 * through Vite: keeping them out of the bundle graph means the ~460 KB YetiBot
 * module (which carries all 772 face frames) is fetched only when someone
 * actually opens a robot simulation, and rebuilding the firmware does not
 * require rebuilding the site.
 */

/**
 * Where the Draco decoder lives.
 *
 * The models are Draco-compressed (3 MB -> 207 KB), and drei's `useGLTF`
 * otherwise pulls the decoder from a Google CDN. Self-hosting keeps the site
 * working behind a strict CSP, on an intranet, and if that CDN moves the file
 * again — which it has. Populated by scripts/sim/build.sh from the copy inside
 * the `three` package, so the decoder version always matches the renderer.
 */
export const DRACO_PATH = "/draco/";

/** The subset of the Emscripten runtime the simulations touch. */
export interface EmscriptenModule {
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  UTF8ToString(ptr: number, maxBytesToRead?: number): string;
  [exported: string]: unknown;
}

type ModuleFactory = (opts?: Record<string, unknown>) => Promise<EmscriptenModule>;

const cache = new Map<string, Promise<EmscriptenModule>>();

/**
 * Load and instantiate one module, at most once per page.
 *
 * `@vite-ignore` is required: the specifier resolves at runtime against the
 * server root, and Vite must not try to follow it at build time.
 */
export function loadWasm(name: "gait" | "yeti"): Promise<EmscriptenModule> {
  let m = cache.get(name);
  if (!m) {
    m = import(/* @vite-ignore */ `/sim/${name}.mjs`)
      .then((mod: { default: ModuleFactory }) => mod.default())
      .catch((err: unknown) => {
        // Drop the rejected promise so a transient network failure does not
        // poison every later attempt.
        cache.delete(name);
        throw err;
      });
    cache.set(name, m);
  }
  return m;
}

/** Bind an exported C function, typed at the call site. */
export function fn<T extends (...args: never[]) => unknown>(
  mod: EmscriptenModule,
  name: string,
): T {
  const f = mod[`_${name}`];
  if (typeof f !== "function") {
    throw new Error(`wasm export missing: ${name}`);
  }
  return f as T;
}
