import type { Project } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFeature } from "@/components/projects/ProjectFeature";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section" aria-labelledby="featured-heading">
      <div className="shell">
        <SectionHeading id="featured-heading" eyebrow="01 / The portfolio" title="Selected work, made with intent." description="A few ideas that made it off the drawing board. Built, tested, and out in the world." />
        <div className="mt-4">
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
