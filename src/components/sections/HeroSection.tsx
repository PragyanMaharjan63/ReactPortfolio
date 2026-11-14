"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { fadeUp, stagger } from "@/lib/motion";
import { site } from "@/data/site";
import type { Project } from "@/data/projects";

export function HeroSection({ project }: { project?: Project }) {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="shell">
        <div className="hero-topline label">
          <span className="flex items-center gap-2.5"><span className="status-dot" /> Independent builder & curious mind</span>
          <span className="hidden sm:block">Based in Nepal · Building for everywhere</span>
        </div>
        <div className="hero-grid">
          <motion.div variants={stagger(0.09)} initial="hidden" animate="visible" className="hero-copy">
            <motion.p variants={fadeUp} className="label text-accent">Robotics / Full-stack engineering</motion.p>
            <motion.h1 variants={fadeUp} id="hero-heading" className="hero-title">
              A little code.<br />
              A little <span className="hero-title-accent">curiosity.</span><br />
              Things that <span className="hero-title-last">move<MoveUpRight aria-hidden="true" /></span>
            </motion.h1>
            <motion.p variants={fadeUp} className="hero-description">
              I’m Pragyan. I turn ideas into expressive robots and thoughtfully built web experiences. From the first sketch to the last deploy.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/work">Explore my work <ArrowUpRight className="size-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href="/contact" variant="ghost">Let’s talk <ArrowUpRight className="size-4" aria-hidden="true" /></ButtonLink>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="hero-object">
            <div className="hero-object-top label"><span>From the workshop</span><span>01 / YetiBot</span></div>
            <div className="hero-orbit" aria-hidden="true" />
            {project && (
              <RobotViewerLazy
                rig="yetibot"
                modelUrl={project.model}
                modelType={project.modelType}
                poster={project.image ?? "/media/yetibot/face.jpg"}
                posterAlt={project.imageAlt ?? "YetiBot"}
                description="A companion with a little personality. Drag to explore."
                priority
              />
            )}
            <span className="hero-object-tag"><span className="status-dot" /> Interactive 3D</span>
          </motion.div>
        </div>
        <div className="hero-bottom">
          <a href="#work" className="label flex min-h-11 items-center gap-3 hover:text-primary">Scroll to discover <ArrowDown className="size-3.5" aria-hidden="true" /></a>
          <p className="label">Hardware meets software.<span className="ml-2 hidden sm:inline text-secondary">A portfolio by {site.name}.</span></p>
        </div>
      </div>
      <div className="discipline-strip" aria-label="Areas of practice">
        <div className="shell flex flex-wrap items-center justify-between gap-5 py-6">
          <span>Ideas into interactions</span><span className="discipline-star" aria-hidden="true">✳</span>
          <span>Robotics & embedded</span><span className="discipline-star" aria-hidden="true">✳</span>
          <span>Web experiences</span><span className="discipline-star hidden md:block" aria-hidden="true">✳</span>
          <span className="hidden md:block">Built with intention</span>
        </div>
      </div>
    </section>
  );
}
