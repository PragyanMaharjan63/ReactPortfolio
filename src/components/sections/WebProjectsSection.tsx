import Link from "next/link";
import type { Project } from "@/data/projects";
import { ArrowSwap } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";

/** Screenshots do the talking: image, name, year. Everything else lives on the project page. */
export function WebProjectsSection({ projects }: { projects: Project[] }) {
  const withImages = projects.filter((p) => p.image);
  const withoutImages = projects.filter((p) => !p.image);

  return (
    <section id="web" className="section" aria-label="Web applications">
      <div className="shell">
        <p className="section-tag"><span>02</span>Web</p>

        <div className="shots">
          {withImages.map((project, i) => (
            <Reveal key={project.slug} className="shot" delay={(i % 2) * 0.08}>
              <Link href={`/projects/${project.slug}`} className="block">
                <div className="shot-frame">
                  <Image
                    src={project.image as string}
                    alt={project.imageAlt ?? project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="shot-meta">
                  <h3>{project.title}</h3>
                  <span className="label tnum">{project.year}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {withoutImages.length > 0 && (
          <ul className="also-list">
            {withoutImages.map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}`} className="also-row arrow-host">
                  <span>{project.title}</span>
                  <span className="label tnum">{project.year}</span>
                  <ArrowSwap />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
