import type { Project } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { DotPattern } from "@/components/ui/DotPattern";
import { Image } from "@/components/ui/Image";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { GitHubIcon } from "@/components/ui/icons";
import { ProjectMetadata } from "@/components/projects/ProjectMetadata";
import { pad } from "@/lib/utils";

export function RoboticsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="robotics" className="section" data-theme="dark" aria-labelledby="robotics-heading">
      <div className="shell">
        <SectionHeading
          id="robotics-heading"
          eyebrow="02 — Robotics lab"
          title="Built for the real world."
          description="3D-printed hardware, embedded behavior, and a lot of iteration. Try the firmware-driven simulations."
        />

        <div className="mt-[clamp(2.5rem,5vw,4rem)]">
          {projects.map((project, i) => (
            <article key={project.slug} className="lab-entry">
              <Reveal className="lab-plate ticks">
                <DotPattern className="dot-field" />
                <div className="lab-plate-top">
                  <span className="label">Fig. {pad(i + 1)}</span>
                  <span className="label">3D render</span>
                </div>
                {project.image && (
                  <Parallax className="absolute inset-0" amount={3}>
                    <Image
                      src={project.image}
                      alt={project.imageAlt ?? project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 780px"
                      className="object-contain p-10"
                    />
                  </Parallax>
                )}
                <div className="lab-plate-caption">
                  <span className="label">{project.category}</span>
                  <span className="label">{project.year}</span>
                </div>
              </Reveal>

              <Reveal className="lab-sheet" delay={0.1}>
                <p className="label">Datasheet — {pad(i + 1)}</p>
                <h3 className="mt-4">{project.title}</h3>
                <p className="mt-4 max-w-md text-secondary">{project.summary}</p>
                {project.metadata && (
                  <div className="mt-8">
                    <ProjectMetadata rows={project.metadata} />
                  </div>
                )}
                <div className="lab-links">
                  <ButtonLink href={`/projects/${project.slug}`} variant={project.model ? "primary" : "secondary"} arrow>
                    {project.model ? "See the simulation" : "Open case study"}
                  </ButtonLink>
                  {project.links.live && (
                    <TextLink href={project.links.live} external>Live site</TextLink>
                  )}
                  {project.links.github && (
                    <TextLink href={project.links.github} external icon={<GitHubIcon className="size-4" />}>Source</TextLink>
                  )}
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
