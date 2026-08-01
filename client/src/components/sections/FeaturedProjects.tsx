import { featuredProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectFeature } from "@/components/projects/ProjectFeature";

export function FeaturedProjects() {
  return (
    <section id="work" className="section" aria-labelledby="featured-heading">
      <div className="shell">
        <SectionHeading id="featured-heading" eyebrow="Selected" title="Work" />
        <div className="mt-4">
          {featuredProjects.map((project, i) => (
            <ProjectFeature
              key={project.slug}
              project={project}
              index={i}
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
