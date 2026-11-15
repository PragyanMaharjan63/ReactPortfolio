"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { DotPattern } from "@/components/ui/DotPattern";
import { RevealLines } from "@/components/ui/RevealLines";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { EASE } from "@/lib/motion";
import type { Project } from "@/data/projects";

export interface HeroStat {
  label: string;
  value: string;
}

export function HeroSection({ project, stats }: { project?: Project; stats: HeroStat[] }) {
  return (
    <section className="hero" data-theme="dark" aria-labelledby="hero-heading">
      <div className="guides" aria-hidden="true" />
      <div
        className="dot-field"
        aria-hidden="true"
        style={{ maskImage: "radial-gradient(ellipse 55% 75% at 78% 50%, #000, transparent 72%)", WebkitMaskImage: "radial-gradient(ellipse 55% 75% at 78% 50%, #000, transparent 72%)" }}
      >
        <DotPattern className="size-full" />
      </div>

      <div className="shell">
        <div className="hero-topline">
          <span className="label">
            <span className="status-dot status-dot-live" aria-hidden="true" />
            <ScrambleText text="Open to robotics & full-stack work" />
          </span>
          <span className="label">Lalitpur, Nepal</span>
          <span className="label">Independent portfolio / 2026</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <motion.p
              className="hero-intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              Pragyan Maharjan <span>— Engineer & builder</span>
            </motion.p>
            <RevealLines
              as="h1"
              id="hero-heading"
              className="hero-title"
              lines={["Code meets", "the physical", "world."]}
              mutedLast
            />
            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            >
              I build companion robots and full-stack applications. From the printed parts to the software that brings them to life.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
            >
              <ButtonLink href="/work" arrow>Explore my work</ButtonLink>
              <TextLink href="/about">A little about me</TextLink>
            </motion.div>
          </div>

          <motion.div
            className="hero-plate ticks"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          >
            <DotPattern className="dot-field" />
            <div className="hero-plate-top">
              <span className="label">Fig. 01 — Interactive</span>
              <span className="label">Drag to rotate</span>
            </div>
            <div className="relative z-[1]">
              {project && (
                <RobotViewerLazy
                  rig="yetibot"
                  modelUrl={project.model}
                  modelType={project.modelType}
                  poster={project.image ?? "/media/yetibot/face.jpg"}
                  posterAlt={project.imageAlt ?? "YetiBot"}
                  description="Drag to rotate. Tap the head to interact."
                  priority
                  simulate
                  showSimulationControls={false}
                  showTouchHint={false}
                />
              )}
            </div>
            <div className="hero-plate-bottom">
              <span className="hero-plate-name">
                {project?.title ?? "YetiBot"} <span>Companion robot</span>
              </span>
              <Link href="/projects/yetibot" className="hero-plate-link" aria-label="Explore YetiBot">
                <ArrowUpRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="hero-bottom">
          {stats.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <p className="label">{stat.label}</p>
              <strong>{stat.value}</strong>
            </div>
          ))}
          <div className="flex items-end justify-end">
            <TextLink href="#work" icon={<ArrowDown className="size-3.5" aria-hidden="true" />} className="arrow-host">
              Selected work
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
