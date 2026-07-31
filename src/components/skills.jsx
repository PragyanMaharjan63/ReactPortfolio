import { motion } from "motion/react";

export default function Skills() {
  const initialAnim = { y: 30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { y: 0, opacity: 1, filter: "blur(0px)" };

  const language = [
    { id: 1, lang: "HTML", imag: "/icons/html.png" },
    { id: 2, lang: "CSS", imag: "/icons/css-3.png" },
    { id: 3, lang: "TailwindCSS", imag: "/icons/tailwind.svg" },
    { id: 4, lang: "Javascript", imag: "/icons/js.png" },
    { id: 5, lang: "React", imag: "/icons/react.svg" },
  ];

  return (
    <div className="flex flex-col items-center px-5 py-24 font-display sm:py-28">
      <motion.h2
        initial={initialAnim}
        whileInView={finalAnim}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4 }}
        className="section-title mb-16"
      >
        SKILLS
      </motion.h2>

      <div className="grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {language.map((item, index) => (
          <motion.div
            initial={initialAnim}
            whileInView={finalAnim}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            key={item.id}
            className="group flex flex-col items-center gap-y-3 rounded-xl
                       border border-line/70 bg-surface/40 px-4 py-6
                       transition-colors duration-300
                       hover:border-line-strong hover:bg-surface-hover/60"
          >
            {/* Fixed-size box so icons of different aspect ratios
                (square PNGs vs wide SVGs) all sit on the same optical grid. */}
            <span className="flex size-14 items-center justify-center">
              <img
                className="max-h-full max-w-full object-contain
                           transition-transform duration-300 ease-out
                           group-hover:scale-110"
                src={item.imag}
                alt={item.lang}
                loading="lazy"
                decoding="async"
              />
            </span>
            <p className="text-sm text-ink-muted transition-colors group-hover:text-white">
              {item.lang}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
