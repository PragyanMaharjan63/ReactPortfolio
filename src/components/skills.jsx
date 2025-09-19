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
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex 
        gap-y-4
        flex-col items-center mb-20"
      >
        {" "}
        <motion.p
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-3xl font-extrabold drop-shadow-xl drop-shadow-neutral-900/60 mt-30 mb-20"
        >
          SKILLS
        </motion.p>
        <div className="flex justify-evenly grow flex-col sm:flex-row gap-y-10 w-full">
          {language.map((item) => {
            return (
              <motion.div
                initial={initialAnim}
                animate={finalAnim}
                transition={{ duration: 0.4, delay: 0.7 + item.id / 10 }}
                key={item.id}
                className="flex flex-col items-center"
              >
                <img className="size-15" src={item.imag} alt="imag" />
                <p>{item.lang}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
