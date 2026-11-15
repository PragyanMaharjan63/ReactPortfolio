"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";

/** Large headline revealed line by line from behind a mask. Lines are separated by real spaces for assistive tech. */
export function RevealLines({
  lines,
  as = "h2",
  id,
  className,
  mutedLast = false,
  delay = 0.08,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  mutedLast?: boolean;
  delay?: number;
}) {
  const Tag = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={line}>
          {i > 0 && " "}
          <span className={`hero-line ${mutedLast && i === lines.length - 1 ? "hero-line-muted" : ""}`}>
            <motion.span
              initial={false}
              animate={{ y: inView ? 0 : "108%" }}
              transition={{ duration: 1, delay: delay + i * 0.1, ease: EASE }}
            >
              {line}
            </motion.span>
          </span>
        </span>
      ))}
    </Tag>
  );
}
