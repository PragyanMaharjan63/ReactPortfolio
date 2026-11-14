"use client";


import { motion } from "framer-motion";
import { fadeUp, revealProps } from "@/lib/motion";

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  level = 2,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? motion.h1 : motion.h2;

  return (
    <motion.div
      variants={fadeUp}
      {...revealProps}
      className="max-w-2xl border-b border-line pb-8"
    >
      <p className="label flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-8 bg-accent/60" />
        {eyebrow}
      </p>
      <Heading id={id} className="mt-4 text-h2 text-primary">
        {title}
      </Heading>
      {description && <p className="mt-4 text-lead text-secondary">{description}</p>}
    </motion.div>
  );
}
