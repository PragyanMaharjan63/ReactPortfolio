"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { DotPattern } from "@/components/ui/DotPattern";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { fadeUp, stagger, EASE } from "@/lib/motion";
import type { Project } from "@/data/projects";

export function HeroSection({ project }: { project?: Project }) {
  const reducedMotion = useReducedMotion();
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="shell">
        <div className="hero-topline">
          <span className="label">Independent portfolio <span className="hero-divider">/</span> 2026</span>
          <span className="label">Lalitpur, Nepal <span className="hero-location-mark" aria-hidden="true">↗</span></span>
        </div>
        <div className="hero-grid">
          <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="hero-copy">
            <motion.p variants={fadeUp} className="hero-intro">Pragyan Maharjan <span>— Engineer & builder</span></motion.p>
            <h1 id="hero-heading" className="hero-title">
              {["Code meets", "the physical", "world."].map((line, index) => (
                <span key={line} className={`hero-line ${index === 2 ? "hero-line-muted" : ""}`}>
                  <motion.span initial={reducedMotion ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.08 + index * 0.1, ease: EASE }}>{line}</motion.span>
                </span>
              ))}
            </h1>
            <motion.p variants={fadeUp} className="hero-description">I build companion robots and full-stack applications. From the printed parts to the software that brings them to life.</motion.p>
            <motion.div variants={fadeUp} className="hero-actions">
              <ButtonLink href="/work">Explore my work <ArrowUpRight className="size-4" aria-hidden="true" /></ButtonLink>
              <Link href="/about" className="text-link">A little about me <ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="hero-object">
            <DotPattern className="hero-dots" />
            <div className="hero-object-top"><span className="label">Object 001</span><span className="label">Interactive study</span></div>
            <span className="registration-mark registration-tl" aria-hidden="true" />
            <span className="registration-mark registration-br" aria-hidden="true" />
            {project && <RobotViewerLazy rig="yetibot" modelUrl={project.model} modelType={project.modelType} poster={project.image ?? "/media/yetibot/face.jpg"} posterAlt={project.imageAlt ?? "YetiBot"} description="Drag to rotate. Tap the head to interact." priority simulate showSimulationControls={false} showTouchHint={false} />}
            <div className="hero-object-bottom"><span className="hero-object-name">{project?.title ?? "YetiBot"} <span>Companion robot</span></span><Link href="/projects/yetibot" className="hero-object-link" aria-label="Explore YetiBot"><ArrowUpRight className="size-5" aria-hidden="true" /></Link></div>
          </motion.div>
        </div>
        <div className="hero-bottom">
          <a href="#work" className="text-link"><ArrowDown className="size-3.5" aria-hidden="true" /> Selected work below</a>
          <span className="label">Robotics <span className="hero-divider">/</span> Software <span className="hero-divider">/</span> Prototyping</span>
        </div>
      </div>
    </section>
  );
}
