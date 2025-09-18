import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Porjects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      prev: "/penguin.png",
      title: "PROJECT 1",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio dicta necessitatibus ullam nam quaerat ipsa nobis assumenda ut doloremque recusandae delectus sequi aspernatur perspiciatis nisi sint vel eligendi similique reprehenderit officia, laborum omnis commodi blanditiis hic! Sequi quidem animi corrupti impedit ab sed.",
      link: "https://github.com",
      isActive: true,
    },
    {
      id: 2,
      prev: "/penguin.png",
      title: "PROJECT 2",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio dicta necessitatibus ullam nam quaerat ipsa nobis assumenda ut doloremque recusandae delectus sequi aspernatur perspiciatis nisi sint vel eligendi similique reprehenderit officia, laborum omnis commodi blanditiis hic! Sequi quidem animi corrupti impedit ab sed.",
      link: "https://github.com",
      isActive: false,
    },
    {
      id: 3,
      prev: "/penguin.png",
      title: "PROJECT 3",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio dicta necessitatibus ullam nam quaerat ipsa nobis assumenda ut doloremque recusandae delectus sequi aspernatur perspiciatis nisi sint vel eligendi similique reprehenderit officia, laborum omnis commodi blanditiis hic! Sequi quidem animi corrupti impedit ab sed.",
      link: "https://github.com",
      isActive: false,
    },
  ]);
  const setActive = (id) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? { ...project, isActive: true }
          : { ...project, isActive: false }
      )
    );
  };

  return (
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex flex-col gap-y-20 justify-center items-center my-20"
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
                onClick={() => setActive(project.id)}
                className={`scale-75 transition-all flex flex-col rounded-lg p-3 my-5  ${
                  project.isActive
                    ? "scale-100 z-10 relative"
                    : `absolute blur-sm ${translateClass} z-20`
                }`}
              >
                <div>
                  <img
                    src={project.prev}
                    alt="preview"
                    className="size-80 justify-self-center"
                  />
                </div>
                <div className=" flex flex-col items-center -translate-y-10 gap-y-2">
                  <p className="font-extrabold text-4xl drop-shadow-xl p-3 drop-shadow-black">
                    {project.title}
                  </p>
                  <p
                    className={` ${
                      project.isActive ? "flex my-8 w-[70vw] " : "hidden"
                    }`}
                  >
                    {project.desc}
                  </p>
                  <button
                    style={{ boxShadow: "6px 6px 6px rgba(0,0,0,0.5)" }}
                    className={`bg-gradient-to-br from-[#2c2f36] to-[#111318] text-white font-light px-9 py-3 cursor-pointer text-sm ${
                      project.isActive ? "flex " : "hidden"
                    }`}
                    onClick={() => {
                      window.open(project.link);
                    }}
                  >
                    VIEW PREVIEW
                  </button>
                </div>
                <div className="absolute w-full translate-y-60">
                  <ArrowLeft
                    className="md:hidden absolute block left-0 cursor-pointer "
                    onClick={() => {
                      setActive(project.id - 1);
                    }}
                  />
                  <ArrowRight
                    className="md:hidden absolute block right-3 cursor-pointer "
                    onClick={() => {
                      setActive(project.id + 1);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
