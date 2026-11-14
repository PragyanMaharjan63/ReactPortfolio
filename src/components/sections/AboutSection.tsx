import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillGroups } from "@/data/skills";

export function AboutSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      id="about"
      className="section border-t border-line"
      aria-labelledby="about-heading"
    >
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading id="about-heading" level={standalone ? 1 : 2} eyebrow="04 / Behind the work" title="Curiosity is the common thread." />

        <div>
          <p className="max-w-lg text-lead text-secondary">
            I’m a Computer Science student in Nepal, drawn to the space where software meets the physical world. I build robots, craft web applications, and enjoy figuring out how all the pieces fit together.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {skillGroups.map((group) => (
              <section key={group.name} aria-label={group.name}>
                <h3 className="label border-b border-line pb-3">{group.name}</h3>
                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-sm text-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
