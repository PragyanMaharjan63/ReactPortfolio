export interface TimelineEntry {
  title: string;
  organisation?: string;
  period: string;
  description: string;
}

/**
 * Only entries that can be evidenced are listed. Employment history and
 * institution names are not published in any reachable source, so they are
 * intentionally absent rather than invented — see README missing assets.
 */
export const education: TimelineEntry[] = [
  {
    title: "Computer Science student",
    period: "Current",
    description:
      "Studying computer science while building robotics prototypes and deploying web applications.",
  },
];

export const experience: TimelineEntry[] = [
  {
    title: "YetiBot — companion robot",
    period: "2026",
    description:
      "Designed and built a 3D-printed companion robot driven by a touch-to-expression loop, and built its product website.",
  },
  {
    title: "Deployed web applications",
    period: "2025 — present",
    description:
      "Shipped several public applications, from a hand-written JavaScript storefront to a MERN note-taking app with authentication and encrypted notes.",
  },
];
