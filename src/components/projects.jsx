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
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex flex-col relative gap-y-20 justify-center items-center my-20 overflow-x-hidden"
      >
        <h1 className="font-bold text-3xl">PROJECTS</h1>

        <div className="flex relative justify-evenly overflow-hidden sm:overflow-visible">
          {projects.map((project, index) => {
            const half = Math.ceil(projects.length / 2);
            const translateClass =
              index < half
                ? "-translate-x-60 -rotate-6"
                : "translate-x-60 rotate-6";
            return (
              <div
                key={project.id}
                // onClick={() => setActive(project.id)}
                className={`scale-75 transition-all flex flex-col rounded-lg p-3 my-5  ${
                  project.isActive
                    ? "scale-100 z-10 relative"
                    : `absolute blur-sm ${translateClass} z-20 opacity-30`
                }`}
              >
                <div className="flex justify-center">
                  <img
                    src={project.prev}
                    alt="preview"
                    className="size-60 sm:size-80 justify-self-center rounded-lg"
                  />
                </div>
                <div className=" flex flex-col items-center -translate-y-10 gap-y-2">
                  <p className="font-extrabold text-4xl drop-shadow-xl p-3 drop-shadow-black">
                    {project.title}
                  </p>
                  <p
                    className={` ${
                      project.isActive
                        ? "w-full sm:w-[70vw] text-center"
                        : "hidden"
                    }`}
                  >
                    {project.desc}
                  </p>
                  <div
                    style={{ fontFamily: "'Inter','sans-serif'" }}
                    className="flex flex-wrap justify-center gap-3 mt-4 w-svw"
                  >
                    {project.stack.map((language, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center justify-center bg-neutral-900 font-medium rounded-md py-1 px-3 text-sm ring-1 transition-colors "
                      >
                        {language}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 grow flex-wrap justify-center items-center my-6">
                    <button
                      style={{ fontFamily: "'Inter','sans-serif'" }}
                      className={`inline-flex items-center justify-center bg-white  rounded-md text-black font-light ring-1 h-9 px-9 py-3 cursor-pointer text-sm ${
                        project.isActive ? "flex " : "hidden"
                      }`}
                      onClick={() => {
                        window.open(project.link);
                      }}
                    >
                      View Preview
                    </button>
                    <button
                      style={{ fontFamily: "'Inter','sans-serif'" }}
                      className={`inline-flex items-center justify-center bg-neutral-900  rounded-md text-white font-light ring-1 h-9 px-9 py-3 cursor-pointer text-sm ${
                        project.isActive ? "flex " : "hidden"
                      }`}
                      onClick={() => {
                        window.open(project.sourceCode);
                      }}
                    >
                      View Code
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="absolute flex justify-between sm:justify-evenly w-svw translate-y-70 sm:translate-y-60 z-30">
            <ArrowLeft
              className=" block left-5 cursor-pointer "
              onClick={() => {
                setActive(activeProject.id - 1);
                console.log("clicked");
              }}
            />
            <ArrowRight
              className=" block right-5 sm:right-3 cursor-pointer "
              onClick={() => {
                setActive(activeProject.id + 1);
                console.log("clicked");
              }}
            />
          </div>
        </div>
        <div className="hidden md:flex rotate-90 absolute -bottom-30 lg:bottom-30 -right-20 lg:right-0">
          <ScrollWid bar={"both"} />
        </div>
      </div>
    </>
  );
}
