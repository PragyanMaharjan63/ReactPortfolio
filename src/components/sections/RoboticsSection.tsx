import Link from "next/link";
import type { Project } from "@/data/projects";
import { ArrowSwap } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";

/** Each robot stands free in front of its own name — no frames, no spec sheets. */
export function RoboticsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="robotics" className="section" aria-label="Robots">
      <div className="shell">
        <p className="section-tag"><span>01</span>Robots</p>

        {projects.map((project) => (
          <article key={project.slug} className="bot">
            <Link href={`/projects/${project.slug}`} className="bot-stage" aria-label={`Explore ${project.title}`}>
              <h2 className="bot-word">{project.title}</h2>
              {project.image && (
                <Parallax className="bot-figure" amount={6}>
                  <Image
                    src={project.image}
                    alt={project.imageAlt ?? project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 1100px"
                    className="object-contain"
                  />
                </Parallax>
              )}
            </Link>
            <Reveal className="bot-foot">
              <p>{project.summary}</p>
              <Link href={`/projects/${project.slug}`} className="text-link arrow-host">
                <span className="text-link-label">{project.model ? "Try it" : "View"}</span>
                <ArrowSwap />
              </Link>
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
