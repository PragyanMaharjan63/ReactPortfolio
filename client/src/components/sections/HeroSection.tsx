import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { RobotViewerLazy } from "@/components/three/RobotViewerLazy";
import { fadeUp, stagger } from "@/lib/motion";
import { site } from "@/data/site";
import { getProject } from "@/data/projects";

export function HeroSection() {
  const yetibot = getProject("yetibot");

  return (
    <section aria-labelledby="hero-heading">
      <div className="shell grid items-center gap-10 pt-14 pb-16 lg:grid-cols-2 lg:gap-16 lg:pt-20 lg:pb-24">
        <motion.div variants={stagger()} initial="hidden" animate="visible">
          <motion.p variants={fadeUp} className="label">
            Robotics · Full-stack
          </motion.p>

          <motion.h1
            variants={fadeUp}
            id="hero-heading"
            className="mt-4 text-display text-primary"
          >
            Machines that move.
            <br />
            Software that ships.
          </motion.h1>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/work" variant="primary">
              Work
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={site.github} variant="secondary" external>
              <GitHubIcon className="size-4" aria-hidden="true" />
              GitHub
            </ButtonLink>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {yetibot && (
            <RobotViewerLazy
              rig="yetibot"
              modelUrl={yetibot.model}
              modelType={yetibot.modelType}
              poster={yetibot.image ?? "/media/yetibot/face.jpg"}
              posterAlt={yetibot.imageAlt ?? "YetiBot"}
              description="YetiBot · drag to rotate"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
