import type { Profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { site } from "@/data/site";

/** The /about introduction: headline and bio, both edited from the dashboard. */
export function AboutSection({ profile }: { profile: Profile }) {
  const paragraphs = profile.bio.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return (
    <section id="about" className="section about-intro" aria-labelledby="about-heading">
      <div className="shell">
        <p className="label">{site.name}</p>
        <RevealText as="h1" id="about-heading" className="about-headline" text={profile.headline} />
        {paragraphs.length > 0 && (
          <Reveal className="about-bio" delay={0.1}>
            <p className="about-lead">{paragraphs[0]}</p>
            <div className="about-rest">
              {paragraphs.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Schools as two columns of years and names. */
export function EducationSection({ profile, tag }: { profile: Profile; tag: string }) {
  if (!profile.education.length) return null;
  return (
    <section className="section" aria-labelledby="education-heading">
      <div className="shell">
        <p className="section-tag"><span>{tag}</span>Education</p>
        <h2 id="education-heading" className="sr-only">Education</h2>
        <ol className="schools">
          {profile.education.map((entry) => (
            <li key={`${entry.school}-${entry.start}`} className="school">
              <span className="label tnum">{entry.start} — {entry.end || "Present"}</span>
              <h3>{entry.school}</h3>
              {entry.field && <span className="label">{entry.field}</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
