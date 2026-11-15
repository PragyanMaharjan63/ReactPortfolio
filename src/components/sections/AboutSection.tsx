import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { WordReveal } from "@/components/ui/WordReveal";
import { skillGroups } from "@/data/skills";
import { education, experience, type TimelineEntry } from "@/data/experience";
import { site } from "@/data/site";
import { pad } from "@/lib/utils";

const statement =
  "I’m a Computer Science student based in Lalitpur, Nepal. I spend my time building robots, writing software, and figuring out how to make the two work together. I like projects that leave me with something I can actually use—or pick up.";

function Timeline({ title, entries }: { title: string; entries: TimelineEntry[] }) {
  return (
    <>
      <div className="sub-head">
        <h3>{title}</h3>
      </div>
      <ol className="timeline">
        {entries.map((entry) => (
          <li key={entry.title} className="timeline-item">
            <p className="label tnum pt-1.5">{entry.period}</p>
            <div>
              <h4>{entry.title}</h4>
              {entry.organisation && <p className="label mt-2">{entry.organisation}</p>}
              <p>{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export function AboutSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      id="about"
      className={`section ${standalone ? "pt-[calc(var(--header-height)+clamp(3rem,7vw,6rem))]" : ""}`}
      aria-labelledby="about-heading"
    >
      <div className="shell">
        <div className="about-grid">
          <aside className="about-aside">
            <div className="about-aside-sticky">
              <p className="label flex items-center gap-3">
                <ScrambleText className="text-accent" text="04" />
                <span>About</span>
              </p>
              <RevealText as={standalone ? "h1" : "h2"} id="about-heading" text="Always taking things apart." />
              <dl className="spec mt-8">
                <div>
                  <dt className="label">Role</dt>
                  <dd>{site.role}</dd>
                </div>
                <div>
                  <dt className="label">Based</dt>
                  <dd>{site.location}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="about-main">
            <WordReveal text={statement} className="statement" />

            <div className="sub-head">
              <h3>Capabilities</h3>
            </div>
            <Reveal>
              <div>
                {skillGroups.map((group, i) => (
                  <section key={group.name} aria-label={group.name} className="capability-row">
                    <span className="label tnum pt-1">{pad(i + 1)}</span>
                    <h4>{group.name}</h4>
                    <ul className="capability-items">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </Reveal>

            <Timeline title="Experience" entries={experience} />
            <Timeline title="Education" entries={education} />
          </div>
        </div>
      </div>
    </section>
  );
}
