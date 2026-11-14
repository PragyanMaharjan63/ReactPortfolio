import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillGroups } from "@/data/skills";

export function AboutSection() {
  return (
    <section
      id="about"
      className="section border-t border-line"
      aria-labelledby="about-heading"
    >
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading id="about-heading" eyebrow="About" title="Stack" />

        <div>
          <p className="max-w-lg text-lead text-secondary">
            Computer Science student. I build robots and the web applications
            that ship alongside them.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
