"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop-only cursor label. It stays invisible until the pointer is over an
 * element carrying data-cursor="Label" (project tiles, previews), then grows
 * into a labelled disc that trails the pointer. Touch and reduced-motion
 * visitors get no lag; touch devices get nothing at all.
 */
export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;
    const ease = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.22;
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, current: string | null = null;

    const tick = () => {
      cx += (x - cx) * ease;
      cy += (y - cy) * ease;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
      const text = (event.target as Element | null)?.closest?.("[data-cursor]")?.getAttribute("data-cursor") ?? null;
      if (text !== current) {
        current = text;
        if (text) label.textContent = text;
        el.dataset.active = String(Boolean(text));
      }
      el.style.opacity = "1";
    };
    const onLeave = () => {
      current = null;
      el.dataset.active = "false";
    };

    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" data-active="false" aria-hidden="true">
      <div className="cursor-inner">
        <span ref={labelRef} />
      </div>
    </div>
  );
}
