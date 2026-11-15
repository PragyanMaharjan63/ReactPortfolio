"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * Word-by-word mask reveal (the React Bits "split text" pattern, without the
 * GSAP dependency). Words stay real text nodes separated by spaces, so the
 * heading reads and is announced normally. The container is what is observed:
 * the words themselves start clipped out of view and would never intersect.
 */
export function RevealText({
  text,
  as = "h2",
  id,
  className,
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  delay?: number;
}) {
  const Tag = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const words = text.split(" ");
  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          {i > 0 && " "}
          <span className="reveal-word">
            <motion.span
              initial={false}
              animate={{ y: inView ? 0 : "110%" }}
              transition={{ duration: 0.9, delay: delay + i * 0.05, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
        </span>
      ))}
    </Tag>
  );
}
