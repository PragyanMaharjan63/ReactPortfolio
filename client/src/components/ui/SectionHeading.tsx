
import { motion } from "framer-motion";
import { fadeUp, revealProps } from "@/lib/motion";

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
}) {
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
      <h2 id={id} className="mt-4 text-h2 text-primary">
        {title}
      </h2>
      {description && <p className="mt-4 text-lead text-secondary">{description}</p>}
    </motion.div>
  );
}
