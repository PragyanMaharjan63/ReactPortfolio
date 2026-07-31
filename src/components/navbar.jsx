import { motion } from "motion/react";

export default function Navbar({ refs }) {
  const initialAnim = { y: 30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { y: 0, opacity: 1, filter: "blur(0px)" };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "SKILLS", ref: refs.skillsHref, delay: 0.2 },
    { label: "PROJECTS", ref: refs.projectsHref, delay: 0.3 },
    { label: "CONTACT", ref: refs.contactHref, delay: 0.4 },
  ];

  return (
    <nav
      // A tinted background behind the blur: with backdrop-blur alone the
      // page content smeared through the bar as it scrolled underneath.
      className="fixed top-0 z-40 flex w-full items-center justify-between
                 gap-3 border-b border-white/5 bg-[#111318]/70 px-4 py-2
                 backdrop-blur-xl sm:px-10 sm:py-3"
    >
      <motion.button
        type="button"
        initial={initialAnim}
        animate={finalAnim}
        transition={{ duration: 0.3, delay: 0.1 }}
        onClick={() => scrollToSection(refs.heroHref)}
        aria-label="Back to top"
        className="-ml-1 flex size-11 shrink-0 cursor-pointer items-center
                   justify-center rounded-lg sm:size-12"
      >
        <img
          src="/penguin.png"
          alt=""
          width="44"
          height="44"
          className="size-9 transition-transform duration-300 ease-out
                     hover:scale-110 hover:rotate-3 sm:size-11"
        />
      </motion.button>

      {/* Tight at 320px so all three labels fit, roomier from sm up. */}
      <ul className="flex list-none items-center gap-x-3 text-xs sm:gap-x-12 sm:text-[0.9375rem] sm:tracking-[0.12em]">
        {navItems.map((item) => (
          <motion.li
            key={item.label}
            initial={initialAnim}
            animate={finalAnim}
            transition={{ duration: 0.4, delay: item.delay }}
          >
            <button
              type="button"
              className="nav-link"
              onClick={() => scrollToSection(item.ref)}
            >
              {item.label}
            </button>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}
