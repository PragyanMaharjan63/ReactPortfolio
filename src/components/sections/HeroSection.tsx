"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { EASE } from "@/lib/motion";
import { site } from "@/data/site";
import type { Project } from "@/data/projects";

/**
 * One word, one robot. The YetiBot stands in front of its own name with no
 * frame around it, and stays fully interactive — tap, hold, drag.
 */
/**
 * Archivo's wide caps run about 0.8em per letter. Size the word so it spans
 * roughly the viewport whatever its length, capped for very short words.
 */
const wordSize = (word: string) => `min(${(90 / (Math.max(word.length, 3) * 0.8)).toFixed(2)}vw, 19rem)`;

export function HeroSection({ project, tagline, word }: { project?: Project; tagline: string; word: string }) {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading" className="sr-only">
        {site.name} — {site.role}
      </h1>

      <div className="hero-word" aria-hidden="true" style={{ fontSize: wordSize(word) }}>
        <motion.span
          initial={{ opacity: 0, y: "18%" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          {word}
        </motion.span>
      </div>

      <motion.div
        className="hero-robot robot-free"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
      >
        {project && (
          <RobotViewerLazy
            bare
            rig="yetibot"
            modelUrl={project.model}
            modelType={project.modelType}
            poster={project.image ?? "/media/yetibot/face.jpg"}
            posterAlt={project.imageAlt ?? "YetiBot"}
            description="YetiBot, an interactive 3D model. Drag to rotate, tap the head to interact."
            priority
            simulate
            showSimulationControls={false}
            showTouchHint={false}
          />
        )}
      </motion.div>

      <div className="shell hero-foot">
        <p className="label">
          {site.name}
          <br />
          <span className="text-secondary">{tagline}</span>
        </p>
        <p className="label hero-hint" aria-hidden="true">Tap · Hold · Drag</p>
        <ButtonLink href="/work" variant="secondary" arrow>Explore my work</ButtonLink>
      </div>
    </section>
  );
}
