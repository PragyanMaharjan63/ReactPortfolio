import type { Project } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFeature } from "@/components/projects/ProjectFeature";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section" aria-labelledby="featured-heading">
      <div className="shell">
        <SectionHeading id="featured-heading" eyebrow="01 — Selected work" title="Ideas, put to work." description="A selection of robots and applications I’ve designed, built, and shipped." />
        <div className="featured-grid">
          {projects.map((project, i) => (
            <ProjectFeature
              key={project.slug}
              project={project}
              index={i}
              priority={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
