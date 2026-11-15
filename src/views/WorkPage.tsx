import { getProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectIndex } from "@/components/projects/ProjectIndex";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { pad } from "@/lib/utils";

export default async function WorkPage() {
  const projects = await getProjects();
  const robotics = projects.filter((p) => p.domain === "robotics");
  const web = projects.filter((p) => p.domain === "web");

  return (
    <>
      <header className="page-head shell">
        <p className="label flex items-center gap-3">
          <ScrambleText className="text-accent" text="All work" />
          <span>{pad(projects.length)} entries</span>
        </p>
        <RevealText as="h1" className="mt-6 max-w-[14ch]" text="Everything, in one place" />
        <div className="page-head-meta">
          <p className="max-w-md text-secondary">Robotics prototypes and deployed applications.</p>
          <p className="label ml-auto self-end">
            {pad(robotics.length)} robotics / {pad(web.length)} web
          </p>
        </div>
      </header>

      <section className="section !pt-[clamp(2rem,4vw,3rem)]" aria-labelledby="work-robotics">
        <div className="shell">
          <div className="section-heading-label">
            <span className="label text-accent">01</span>
            <h2 id="work-robotics" className="label">Robotics</h2>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2">
            {robotics.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={(i % 2) * 0.1}>
                  <ProjectCard project={p} index={i} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="work-web">
        <div className="shell">
          <div className="section-heading-label">
            <span className="label text-accent">02</span>
            <h2 id="work-web" className="label">Web</h2>
          </div>
          <div className="mt-10">
            <ProjectIndex
              entries={web.map((p) => ({
                slug: p.slug,
                title: p.title,
                category: p.category,
                year: p.year,
                summary: p.summary,
                technologies: p.technologies,
                image: p.image,
                imageAlt: p.imageAlt,
              }))}
            />
          </div>
        </div>
      </section>
    </>
  );
}
