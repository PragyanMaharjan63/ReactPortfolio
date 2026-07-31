import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import ScrollWid from "./scrollwidget";

export default function Porjects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      prev: "/projectImages/Bakas.png",
      title: "BAKAS",
      desc: "A ecommerce website ",
      stack: ["HTML", "Tailwind CSS", "JS"],
      link: "https://bakas-alpha.vercel.app/",
      sourceCode: "https://github.com/PragyanMaharjan63/Bakas",
      isActive: false,
    },
    {
      id: 2,
      prev: "/projectImages/Note taking.png",
      title: "Notes",
      desc: "A Note taking app with User authentication and encrypted notes",
      stack: [
        "HTML",
        "Tailwind CSS",
        "JS",
        "React",
        "Express",
        "Mongodb",
        "NodeJS",
      ],
      link: "https://note-taking-mern-1w1w.vercel.app/",
      sourceCode: "https://github.com/PragyanMaharjan63/NoteTakingMERN",
      isActive: true,
    },
    {
      id: 3,
      prev: "/projectImages/studyTracker.png",
      title: "Study Tracker",
      desc: "A Timer app with Todo list",
      stack: ["HTML", "Tailwind CSS", "JS", "React"],
      link: "https://timer-using-react-iota.vercel.app/",
      sourceCode: "https://github.com/PragyanMaharjan63/timer-Using-React",
      isActive: false,
    },
    {
      id: 4,
      prev: "/projectImages/Coffee.png",
      title: "Cafe",
      desc: "A Coffee Cafe",
      stack: ["HTML", "Tailwind CSS", "JS", "React"],
      link: "https://react-landing-pages-eight.vercel.app/",
      sourceCode:
        "https://github.com/PragyanMaharjan63/React-Landing-pages/tree/main/coffee",
      isActive: false,
    },
  ]);

  const activeProject = projects.find((p) => p.isActive);

  const setActive = (id) => {
    let newId = id;

    if (id < 1) {
      newId = projects.length;
    } else if (id > projects.length) {
      newId = 1;
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === newId
          ? { ...project, isActive: true }
          : { ...project, isActive: false }
      )
    );
  };

  return (
    <div className="relative flex flex-col items-center px-5 py-24 font-display sm:py-28">
      <h2 className="section-title mb-14">PROJECTS</h2>

      {/* Stage for the stacked cards. Clipped so the blurred neighbours
          cannot bleed past the section or push the page sideways. */}
      <div className="relative flex w-full max-w-3xl justify-center overflow-hidden py-4">
        {projects.map((project, index) => {
          const half = Math.ceil(projects.length / 2);
          const translateClass =
            index < half ? "-translate-x-60 -rotate-6" : "translate-x-60 rotate-6";

          return (
            <div
              key={project.id}
              aria-hidden={!project.isActive}
              className={`flex scale-75 flex-col transition-all duration-500 ease-out ${
                project.isActive
                  ? "relative z-20 scale-100"
                  : `absolute z-10 blur-sm ${translateClass} opacity-25`
              }`}
            >
              <img
                src={project.prev}
                alt={`${project.title} preview`}
                loading="lazy"
                decoding="async"
                className="size-64 rounded-xl object-cover ring-1 ring-line
                           shadow-2xl shadow-black/50 sm:size-80"
              />
            </div>
          );
        })}

        {/* Arrows sit level with the middle of the artwork. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-between px-1 sm:px-2">
          <button
            type="button"
            aria-label="Previous project"
            className="btn-round pointer-events-auto"
            onClick={() => setActive(activeProject.id - 1)}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            className="btn-round pointer-events-auto"
            onClick={() => setActive(activeProject.id + 1)}
          >
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Details for the active project, below the artwork rather than
          overlapping it. */}
      <div
        key={activeProject.id}
        className="mt-10 flex w-full max-w-2xl flex-col items-center gap-y-4 text-center"
      >
        <h3 className="text-3xl font-extrabold text-white drop-shadow-lg drop-shadow-black/50 sm:text-4xl">
          {activeProject.title}
        </h3>

        <p className="text-ink-muted">{activeProject.desc}</p>

        <ul className="mt-1 flex list-none flex-wrap justify-center gap-2">
          {activeProject.stack.map((language) => (
            <li key={language} className="tag">
              {language}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <a
            href={activeProject.link}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-primary"
          >
            View Preview
          </a>
          <a
            href={activeProject.sourceCode}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-secondary"
          >
            View Code
          </a>
        </div>
      </div>

      <div className="absolute right-0 -bottom-30 hidden rotate-90 md:flex lg:bottom-30">
        <ScrollWid bar={"both"} />
      </div>
    </div>
  );
}
