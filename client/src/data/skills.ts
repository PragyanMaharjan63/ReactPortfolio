export interface SkillGroup {
  name: string;
  items: string[];
}

/**
 * Grouped from what the repositories actually evidence: the stacks recorded
 * against deployed projects, and the tooling this site is built and shipped
 * with. No proficiency percentages — they are not measurable.
 */
export const skillGroups: SkillGroup[] = [
  {
    name: "Robotics & hardware",
    items: ["3D printing (FDM)", "Embedded displays", "Touch sensing", "Prototype enclosure design"],
  },
  {
    name: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "React Three Fiber"],
  },
  {
    name: "Backend",
    items: ["Node.js", "Express", "MongoDB", "REST APIs"],
  },
  {
    name: "Infrastructure",
    items: ["Docker", "Docker Compose", "Jenkins", "Nginx / Caddy", "Vercel", "Git"],
  },
];
