export default function Porjects() {
  const projects = [
    {
      id: 1,
      prev: "/penguin.png",
      title: "project title",
      desc: "this is a project",
      link: "https://github.com",
    },
    {
      id: 2,
      prev: "/penguin.png",
      title: "project title",
      desc: "this is a project",
      link: "https://github.com",
    },
    {
      id: 3,
      prev: "/penguin.png",
      title: "project title",
      desc: "this is a project",
      link: "https://github.com",
    },
  ];
  return (
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex flex-col gap-y-20 justify-center items-center my-20"
      >
        <h1 className="font-bold text-3xl">PROJECTS</h1>
        <div className="flex grow flex-wrap justify-evenly w-full">
          {projects.map((project) => {
            return (
              <div key={project.id} className="border-1 rounded-lg p-3">
                <div>
                  <img src={project.prev} alt="preview" className="size-60" />
                </div>
                <div>
                  <p>{project.title}</p>
                  <p>{project.desc}</p>
                  <button className="rounded-lg bg-white text-neutral-700 px-5 py-1 cursor-pointer">
                    View Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
