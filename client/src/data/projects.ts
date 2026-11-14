/**
 * Single source of truth for project content.
 *
 * Copy is deliberately short — roughly one line per field. Anything that
 * cannot be verified from the project's own repository, site or media is left
 * out and recorded in `missingInfo` rather than guessed.
 */

export type ProjectCategory =
  | "Companion robotics"
  | "Quadruped robotics"
  | "Full-stack"
  | "Frontend";

export type ModelType =
  | "original"
  | "cad-export"
  | "visual-reconstruction"
  | "placeholder";

export interface MetadataRow {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  /** One line. Used everywhere a project is listed. */
  summary: string;
  /** Two sentences maximum. Project page only. */
  description: string;
  featured: boolean;
  domain: "robotics" | "web";
  image?: string;
  imageAlt?: string;
  gallery?: { src: string; alt: string }[];
  videos?: { src: string; poster: string; label: string }[];
  /** Set once a real .glb exists; until then the viewer renders a rig. */
  model?: string;
  modelType?: ModelType;
  technologies: string[];
  role: string;
  metadata?: MetadataRow[];
  /** Short bullets, not prose. */
  challenges?: string[];
  status?: string;
  links: { live?: string; github?: string; documentation?: string };
  missingInfo?: string[];
}

export const projects: Project[] = [
  {
    slug: "yetibot",
    title: "YetiBot",
    category: "Companion robotics",
    year: "2026",
    domain: "robotics",
    featured: true,
    summary: "Touch it, and it answers with an expression.",
    description:
      "A 3D-printed companion robot. A touch on the shell is compared against programmed behaviour, and the front display answers — expressions, menus, or a built-in play mode. The 3D view is built from the print files.",
    image: "/media/yetibot/model.webp",
    imageAlt:
      "YetiBot's printed shell rendered in 3D: white body, horns, blue display bezel.",
    gallery: [
      { src: "/media/yetibot/face.jpg", alt: "Expression on the front display." },
      { src: "/media/yetibot/touch-menu.jpg", alt: "On-screen menu prompt." },
      { src: "/media/yetibot/play-mode.jpg", alt: "Built-in play mode." },
      { src: "/media/yetibot/manual-views.png", alt: "Views from the user manual." },
    ],
    videos: [
      {
        src: "/media/yetibot/demo-motion.mp4",
        poster: "/media/yetibot/face.jpg",
        label: "Prototype movement test",
      },
      {
        src: "/media/yetibot/demo-touch.mp4",
        poster: "/media/yetibot/touch-menu.jpg",
        label: "Touch response",
      },
    ],
    model: "/models/yetibot.glb",
    modelType: "cad-export",
    technologies: ["3D printing", "Embedded display", "Touch sensing", "React"],
    role: "Built the robot and its product site.",
    metadata: [
      { label: "Input", value: "Touch on the shell" },
      { label: "Output", value: "Front display" },
      { label: "Loop", value: "Sense → compare → animate" },
      { label: "Shell", value: "3D printed, FDM" },
      { label: "Variants", value: "Explorer · Scout · Builder" },
      { label: "Status", value: "Working prototype" },
    ],
    challenges: [
      "Reading state from a low-resolution display, without labels.",
      "One touch input driving menu, select and skip.",
      "Keeping the loop fast enough to read as a reaction.",
    ],
    status: "Working prototype",
    links: {
      live: "https://yetibot.vercel.app",
      github: "https://github.com/PragyanMaharjan63/yetibot",
    },
    missingInfo: [
      "Microcontroller, display part and touch-sensor type.",
      "Firmware repository — the yetibot repo holds the product site only.",
    ],
  },
  {
    slug: "quadruped",
    title: "Quadruped",
    category: "Quadruped robotics",
    year: "2026",
    domain: "robotics",
    featured: true,
    summary: "Eight servos, four legs, two joints each.",
    description:
      "A walking quadruped on the Kame32 miniKame layout: four legs, two servos per leg, driven by an ESP32. The 3D view is assembled from the printed parts.",
    model: "/models/quadruped.glb",
    modelType: "cad-export",
    image: "/media/quadruped/model.webp",
    imageAlt:
      "The quadruped rendered in 3D: blue printed chassis and four two-jointed legs.",
    technologies: ["ESP32", "Servos", "3D printing"],
    role: "To be documented.",
    metadata: [
      { label: "Legs", value: "4 × 2 DOF" },
      { label: "Servos", value: "8 — hip + knee" },
      { label: "Controller", value: "ESP32" },
      { label: "Status", value: "Awaiting documentation" },
    ],
    status: "Awaiting documentation",
    links: {},
    missingInfo: [
      "Photos and a walking clip.",
      "Servo model, battery and driver board.",
      "Gait code and firmware repository.",
    ],
  },
  {
    slug: "notes",
    title: "Notes",
    category: "Full-stack",
    year: "2025",
    domain: "web",
    featured: true,
    summary: "Encrypted notes with authentication.",
    description:
      "A note-taking app where notes are stored encrypted rather than as plain text. React front end, Express API, MongoDB.",
    image: "/media/web/notes.png",
    imageAlt: "The Notes app: note list and editor.",
    technologies: ["React", "Express", "Node.js", "MongoDB"],
    role: "Sole developer.",
    status: "Deployed",
    links: {
      live: "https://note-taking-mern-1w1w.vercel.app/",
      github: "https://github.com/PragyanMaharjan63/NoteTakingMERN",
    },
  },
  {
    slug: "study-tracker",
    title: "Study Tracker",
    category: "Frontend",
    year: "2025",
    domain: "web",
    featured: false,
    summary: "A focus timer with a todo list.",
    description:
      "A study timer paired with a todo list, so a session and its tasks share one screen. Client-side only.",
    image: "/media/web/studyTracker.png",
    imageAlt: "Study Tracker: timer and todo list.",
    technologies: ["React", "JavaScript", "Tailwind CSS"],
    role: "Sole developer.",
    status: "Deployed",
    links: {
      live: "https://timer-using-react-iota.vercel.app",
      github: "https://github.com/PragyanMaharjan63/timer-Using-React",
    },
  },
  {
    slug: "bakas",
    title: "BAKAS",
    category: "Frontend",
    year: "2025",
    domain: "web",
    featured: false,
    summary: "A storefront with no framework.",
    description:
      "An e-commerce storefront in plain HTML, CSS and JavaScript — layout, interaction and state all hand-written.",
    image: "/media/web/Bakas.png",
    imageAlt: "The BAKAS storefront product listing.",
    technologies: ["HTML", "CSS", "JavaScript"],
    role: "Sole developer.",
    status: "Deployed",
    links: {
      live: "https://bakas-alpha.vercel.app",
      github: "https://github.com/PragyanMaharjan63/Bakas",
    },
  },
  {
    slug: "cafe",
    title: "Cafe",
    category: "Frontend",
    year: "2025",
    domain: "web",
    featured: false,
    summary: "A landing page, built from components.",
    description:
      "A coffee shop landing page, built to practise composing a page from small reusable components.",
    image: "/media/web/Coffee.png",
    imageAlt: "The Cafe landing page hero.",
    technologies: ["React", "JavaScript", "Tailwind CSS"],
    role: "Sole developer.",
    status: "Deployed",
    links: {
      live: "https://react-landing-pages-eight.vercel.app",
      github:
        "https://github.com/PragyanMaharjan63/React-Landing-pages/tree/main/coffee",
    },
  },
  {
    slug: "career-canvas",
    title: "CareerCanvas",
    category: "Full-stack",
    year: "2025",
    domain: "web",
    featured: false,
    summary: "Deployed TypeScript application.",
    description:
      "A deployed TypeScript application. The repository carries no description, so this entry stays thin rather than invented.",
    technologies: ["TypeScript", "React"],
    role: "Sole developer.",
    status: "Deployed",
    links: {
      live: "https://career-canvas-five.vercel.app",
      github: "https://github.com/PragyanMaharjan63/CareerCanvas",
    },
    missingInfo: ["What it does, in one line.", "A screenshot."],
  },
];

export const getProject = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);

export const featuredProjects = projects.filter((p) => p.featured);
export const roboticsProjects = projects.filter((p) => p.domain === "robotics");
export const webProjects = projects.filter((p) => p.domain === "web");
