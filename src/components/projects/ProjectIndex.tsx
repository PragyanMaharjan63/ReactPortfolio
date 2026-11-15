"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Image } from "@/components/ui/Image";
import { ArrowSwap } from "@/components/ui/Button";
import { pad } from "@/lib/utils";

export interface IndexEntry {
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  technologies: string[];
  image?: string;
  imageAlt?: string;
}

/**
 * Typographic project index. On a fine pointer, a preview of the hovered
 * project follows the cursor (Aceternity / 21st.dev-style hover reveal);
 * on touch and small screens each row carries its own thumbnail instead.
 */
export function ProjectIndex({ entries }: { entries: IndexEntry[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 34, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 34, mass: 0.5 });
  const activeEntry = active === null ? null : entries[active];

  return (
    <>
      <ul
        className="index-list border-t border-line-strong"
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          x.set(event.clientX);
          y.set(event.clientY);
        }}
        onPointerLeave={() => setActive(null)}
      >
        {entries.map((entry, i) => (
          <li key={entry.slug}>
            <Link
              href={`/projects/${entry.slug}`}
              className="index-row"
              onPointerEnter={(event) => event.pointerType === "mouse" && setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="label tnum">{pad(i + 1)}</span>
              <span className="min-w-0">
                <h3>{entry.title}</h3>
                <span className="mt-1.5 block text-sm text-secondary">{entry.summary}</span>
              </span>
              <span className="index-cat label">{entry.category}</span>
              <span className="index-stack label">{entry.technologies.slice(0, 3).join(" / ")}</span>
              <span className="index-year label tnum">{entry.year}</span>
              <span className="index-arrow justify-self-end text-xl" aria-hidden="true">
                <ArrowSwap />
              </span>
              <span className="index-thumb" aria-hidden="true">
                {entry.image && <Image src={entry.image} alt="" fill sizes="72px" className="object-cover object-top" />}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <motion.div
        className="index-preview hidden lg:block"
        style={{ x: sx, y: sy }}
        data-visible={Boolean(activeEntry?.image)}
        aria-hidden="true"
      >
        {entries.map((entry, i) =>
          entry.image ? (
            <div key={entry.slug} className="index-preview-img" data-active={active === i}>
              <Image
                src={entry.image}
                alt=""
                fill
                sizes="336px"
                className={entry.category.includes("robotics") ? "object-contain p-4" : "object-cover object-top"}
              />
            </div>
          ) : null,
        )}
      </motion.div>
    </>
  );
}
