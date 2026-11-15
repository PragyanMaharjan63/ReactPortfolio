import type { Project } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectFeature, type FeatureLayout } from "@/components/projects/ProjectFeature";

const layoutFor = (index: number): FeatureLayout => (index === 0 ? "a" : index === 1 ? "b" : "wide");

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="work" className="section" aria-labelledby="featured-heading">
      <div className="shell">
        <SectionHeading
          id="featured-heading"
          eyebrow="01 — Selected work"
          title="Ideas, put to work."
          description="A selection of robots and applications I’ve designed, built, and shipped."
        />
        <Reveal y={32}>
          <div className="bento">
            {projects.map((project, i) => (
              <ProjectFeature key={project.slug} project={project} index={i} layout={layoutFor(i)} dark={i === 0} priority={i === 0} />
            ))}
          </div>
        </Reveal>
        <div className="mt-8 flex justify-end">
          <TextLink href="/work">View all work</TextLink>
        </div>
      </div>
    </section>
  );
}
