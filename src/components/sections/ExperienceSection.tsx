import type { CSSProperties } from "react";
import type { Profile } from "@/data/profile";
import { Reveal } from "@/components/ui/Reveal";
import { formatMonth, formatRange, isOngoing, timeline } from "@/lib/profile-format";

/**
 * The current role set large, then every role as a bar on one shared month
 * axis. `detailed` adds the written highlights underneath (used on /about).
 */
export function ExperienceSection({ profile, tag = "03", detailed = false }: { profile: Profile; tag?: string; detailed?: boolean }) {
  const entries = profile.experience;
  if (!entries.length) return null;
  const current = entries.find(isOngoing);
  const alsoNow = entries.filter((entry) => isOngoing(entry) && entry !== current);
  const { bars, ticks, nowAt } = timeline(entries);

  return (
    <section id="experience" className="section" aria-labelledby="experience-heading">
      <div className="shell">
        <p className="section-tag"><span>{tag}</span>Experience</p>

        {current && (
          <Reveal className="now">
            <p className="label now-label"><span className="status-dot status-dot-live" aria-hidden="true" />Currently</p>
            <h2 id="experience-heading" className="now-title">
              {current.role}
              <span className="now-org">
                at{" "}
                {current.url ? <a href={current.url} target="_blank" rel="noopener noreferrer"><em>{current.organisation}</em></a> : <em>{current.organisation}</em>}
              </span>
            </h2>
            <div className="now-meta">
              <span className="label">Since {formatMonth(current.start)}</span>
              {alsoNow.map((entry) => (
                <span key={`${entry.organisation}-${entry.start}`} className="label">
                  Also {entry.role} — <span className="text-primary">{entry.organisation}</span>
                </span>
              ))}
            </div>
          </Reveal>
        )}
        {!current && <h2 id="experience-heading" className="sr-only">Experience</h2>}

        <Reveal className="chart" delay={0.1}>
          <div style={{ "--now": `${nowAt}%` } as CSSProperties}>
          <ol className="chart-rows">
            {bars.map(({ entry, left, width }) => (
              <li key={`${entry.organisation}-${entry.start}`} className="chart-row">
                <div className="chart-name">
                  <span className="chart-org">{entry.organisation}</span>
                  <span className="label">{entry.role}</span>
                </div>
                <div className="chart-track" aria-label={formatRange(entry)}>
                  <span
                    className={`chart-bar ${isOngoing(entry) ? "is-ongoing" : ""}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
                <span className="label chart-range">{formatRange(entry)}</span>
              </li>
            ))}
          </ol>
          <div className="chart-axis" aria-hidden="true">
            <div className="chart-scale">
              {ticks.map((tick) => (
                <span key={tick.at} className={`chart-tick ${tick.label ? "has-label" : ""}`} style={{ left: `${tick.at}%` }}>
                  {tick.label && <span className="label">{tick.label}</span>}
                </span>
              ))}
              <span className="chart-now" style={{ left: `${nowAt}%` }}><span className="label">Now</span></span>
            </div>
          </div>
          </div>
        </Reveal>

        {detailed && (
          <ol className="roles">
            {entries.map((entry) => (
              <li key={`${entry.organisation}-${entry.start}`} className="role">
                <div>
                  <p className="label">{formatRange(entry)}</p>
                  <h3>{entry.organisation}</h3>
                  <p className="role-title">{entry.role}</p>
                </div>
                {entry.highlights.length > 0 && (
                  <ul className="role-points">
                    {entry.highlights.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
