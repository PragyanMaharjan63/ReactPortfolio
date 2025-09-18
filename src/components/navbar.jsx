export default function Navbar({ refs }) {
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div
        style={{ fontFamily: "'Poppins','sans-serif'" }}
        className="flex justify-between w-full fixed p-5 sm:p-10 backdrop-blur-xl z-40"
      >
        <div>
          <img
            src="/penguin.png"
            alt="logo"
            // className="size-10 hover:drop-shadow-xl hover:drop-shadow-blue-400 cursor-pointer transition-all"
            className="size-12 hover:drop-shadow-blue-400/50 hover:scale-110 hover:rotate-3 transition-all duration-300 ease-out cursor-pointer"
            onClick={() => {
              scrollToSection(refs.heroHref);
            }}
          />
        </div>
        <div className="flex gap-x-4 sm:gap-x-15 items-center list-none sm:mr-5">
          <li
            className="hover:font-bold hover:cursor-pointer transition-all "
            onClick={() => {
              scrollToSection(refs.skillsHref);
            }}
          >
            SKILLS
          </li>
          <li
            className="hover:font-bold hover:cursor-pointer transition-all "
            onClick={() => {
              scrollToSection(refs.projectsHref);
            }}
          >
            PROJECTS
          </li>
          <li className="hover:font-bold hover:cursor-pointer transition-all ">
            CONTACT
          </li>
        </div>
      </div>
    </>
  );
}
