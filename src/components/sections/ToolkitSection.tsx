import type { Profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { ROMAN, languageCode } from "@/lib/profile-format";

/** Skill groups as numbered columns, languages as a row of element-style tiles. */
export function ToolkitSection({ profile, tag = "04" }: { profile: Profile; tag?: string }) {
  if (!profile.skills.length && !profile.languages.length) return null;
  return (
    <section id="toolkit" className="section" aria-labelledby="toolkit-heading">
      <div className="shell">
        <p className="section-tag"><span>{tag}</span>Toolkit</p>
        <h2 id="toolkit-heading" className="sr-only">Skills and languages</h2>

        {profile.languages.length > 0 && (
          <Reveal>
            <ul className="tiles" aria-label="Languages">
              {profile.languages.map((language, i) => (
                <li key={language.name} className="tile-el">
                  <span className="tile-el-index tnum">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`tile-el-code ${languageCode(language).length > 2 ? "is-long" : ""}`} aria-hidden="true">{languageCode(language)}</span>
                  <span className="tile-el-name">{language.name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {profile.skills.length > 0 && (
          <div className="skill-cols">
            {profile.skills.map((group, i) => (
              <Reveal key={group.name} className="skill-col" delay={i * 0.06}>
                <span className="skill-num">{ROMAN[i] ?? i + 1}</span>
                <h3>{group.name}</h3>
                <ul>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
