import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ScrambleText } from "@/components/ui/ScrambleText";

/** Index tag + rule, a split-text headline and an optional aside. `eyebrow` is "NN — Name". */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  level = 2,
  trailing,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  level?: 1 | 2;
  trailing?: ReactNode;
}) {
  const [index, ...rest] = eyebrow.split(" — ");
  const name = rest.join(" — ");
  return (
    <div className="section-heading">
      <div className="section-heading-label">
        {name ? (
          <>
            <ScrambleText className="label" text={index} />
            <span className="label">{name}</span>
          </>
        ) : (
          <span className="label">{index}</span>
        )}
        {trailing && <span className="label ml-auto">{trailing}</span>}
      </div>
      <RevealText as={level === 1 ? "h1" : "h2"} id={id} text={title} />
      {description && (
        <Reveal delay={0.15} className="section-heading-desc">
          <p>{description}</p>
        </Reveal>
      )}
    </div>
  );
}
