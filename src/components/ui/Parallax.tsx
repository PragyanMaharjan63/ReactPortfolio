"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Moves its child a few percent against the scroll direction. Layout never shifts; the child should overfill its frame slightly. */
export function Parallax({ children, amount = 6, className }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${amount}%`, `${-amount}%`]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y, scale: 1.12 }} className="absolute inset-0">
        {children}
      </motion.div>
    </div>
  );
}
