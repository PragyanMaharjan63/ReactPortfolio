"use client";

import { motion } from "framer-motion";
import { fadeUp, revealProps } from "@/lib/motion";

export function SectionHeading({ eyebrow, title, description, id, level = 2 }: { eyebrow: string; title: string; description?: string; id?: string; level?: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <motion.div variants={fadeUp} {...revealProps} className="section-heading">
      <p className="label">{eyebrow}</p>
      <div className="section-heading-content"><Heading id={id}>{title}</Heading>{description && <p>{description}</p>}</div>
    </motion.div>
  );
}
