/**
 * Everything on the site that describes the person rather than a project.
 * These values seed the database once; after that the dashboard owns them.
 */

export interface ExperienceEntry {
  role: string;
  organisation: string;
  url?: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM", or empty while the role is ongoing. */
  end?: string;
  highlights: string[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface Language {
  name: string;
  /** Two or three characters shown on the tile, e.g. "Ts". Derived from the name when empty. */
  code?: string;
}

export interface EducationEntry {
  school: string;
  field?: string;
  /** "YYYY" */
  start: string;
  /** "YYYY", or empty while studying. */
  end?: string;
}

export interface Profile {
  headline: string;
  /** Paragraphs separated by a blank line. */
  bio: string;
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  languages: Language[];
  education: EducationEntry[];
}

export const defaultProfile: Profile = {
  headline: "Software Engineer",
  bio: [
    "I am a software engineer and technology entrepreneur focused on building scalable applications, intelligent automation systems, and reliable digital infrastructure.",
    "As the Co-Founder and CTO of Avernek Technologies, I lead technical development and infrastructure across client projects and internal products. My work involves full-stack development, backend engineering, AI-powered automation, API integrations, server administration, and CI/CD pipelines.",
    "I work with technologies such as Docker, Jenkins, Linux, and modern web frameworks to develop, deploy, and maintain production-ready applications.",
    "I am also the Co-Founder and CTO of Aafno Store, an e-commerce SaaS platform designed to help businesses establish and manage their own online stores.",
    "My interests lie in software engineering, DevOps, system architecture, automation, and building technology that solves real-world problems.",
  ].join("\n\n"),
  experience: [
    {
      role: "Co-Founder & CTO",
      organisation: "Avernek Technologies",
      start: "2026-04",
      highlights: [
        "Lead software engineering, technical architecture, and infrastructure management.",
        "Develop and maintain full-stack websites, applications, and backend systems.",
        "Build AI-powered business automation workflows and integrate third-party APIs.",
        "Manage Linux servers, web hosting, application deployments, and hosting infrastructure.",
        "Implement and maintain CI/CD pipelines using Jenkins, Docker, and Git.",
        "Work on scalable, maintainable solutions for clients and internal products.",
      ],
    },
    {
      role: "Co-Founder & CTO",
      organisation: "Aafno Store",
      start: "2026-09",
      highlights: [
        "Co-develop an e-commerce SaaS platform for businesses.",
        "Contribute to platform architecture, backend services, and storefront development.",
        "Work on automated store provisioning, deployments, and infrastructure management.",
        "Develop systems supporting multi-store operations and e-commerce functionality.",
      ],
    },
    {
      role: "Vice President",
      organisation: "Smaterr Roboticz Club",
      start: "2025-11",
      end: "2026-07",
      highlights: ["Contributed to club leadership and the coordination of robotics and technology-related activities."],
    },
  ],
  skills: [
    { name: "Software Engineering", items: ["Full-Stack Development", "Backend Development", "REST APIs", "System Architecture"] },
    { name: "DevOps & Infrastructure", items: ["Linux", "Docker", "Jenkins", "CI/CD", "VPS Management", "Web Hosting", "Email Hosting"] },
    { name: "Automation", items: ["AI Automation", "Workflow Development", "API Integrations", "Business Process Automation"] },
    { name: "Product Engineering", items: ["SaaS Development", "E-commerce Platforms", "Deployment Automation"] },
  ],
  languages: [
    { name: "TypeScript", code: "Ts" },
    { name: "JavaScript", code: "Js" },
    { name: "Python", code: "Py" },
    { name: "C++", code: "C++" },
    { name: "SQL", code: "Sq" },
    { name: "Bash", code: "Sh" },
    { name: "HTML & CSS", code: "Hc" },
  ],
  education: [
    { school: "Himalaya College of Engineering", start: "2024", end: "2028" },
    { school: "United Academy", field: "Computer Science", start: "2022", end: "2024" },
  ],
};
