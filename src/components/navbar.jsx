import { motion } from "motion/react";

export default function Navbar({ refs }) {
  const initialAnim = { y: 30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { y: 0, opacity: 1, filter: "blur(0px)" };
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div
        style={{ fontFamily: "'Poppins','sans-serif'" }}
        className="flex justify-evenly sm:justify-between w-full fixed p-5 sm:p-10 backdrop-blur-xl z-40"
      >
        <motion.div
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <img
            src="/penguin.png"
            alt="logo"
            // className="size-10 hover:drop-shadow-xl hover:drop-shadow-blue-400 cursor-pointer transition-all"
            className="size-12 hover:drop-shadow-blue-400/50 hover:scale-110 hover:rotate-3 transition-all duration-300 ease-out cursor-pointer"
            onClick={() => {
              scrollToSection(refs.heroHref);
            }}
          />
        </motion.div>
        <div className="flex gap-x-4 sm:gap-x-15 items-center list-none sm:mr-5">
          <motion.li
            initial={initialAnim}
            animate={finalAnim}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hover:font-bold hover:cursor-pointer transition-all "
            onClick={() => {
              scrollToSection(refs.skillsHref);
            }}
          >
            SKILLS
          </motion.li>
          <motion.li
            initial={initialAnim}
            animate={finalAnim}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="hover:font-bold hover:cursor-pointer transition-all "
            onClick={() => {
              scrollToSection(refs.projectsHref);
            }}
          >
            PROJECTS
          </motion.li>
          <motion.li
            initial={initialAnim}
            animate={finalAnim}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="hover:font-bold hover:cursor-pointer transition-all"
            onClick={() => {
              scrollToSection(refs.contactHref);
            }}
          >
            CONTACT
          </motion.li>
        </div>
      </div>
    </>
  );
}
