import { Github, Linkedin } from "lucide-react";
import { motion } from "motion/react";

export default function SocialMedia() {
  const initialAnim = { x: -30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { x: 0, opacity: 1, filter: "blur(0px)" };
  return (
    <>
      <div className="flex flex-row sm:flex-col sm:fixed bottom-0 list-none mb-4 ml-2 sm:m-15 gap-4">
        <motion.li
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.5 }}
          onClick={() => {
            window.open("https://www.github.com/pragyanmaharjan63", "_blank");
          }}
        >
          <Github className="cursor-pointer hover:scale-110 hover:rotate-3" />
        </motion.li>
        <motion.li
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.6 }}
          onClick={() => {
            window.open(
              "https://www.linkedin.com/in/pragyan-maharjan",
              "_blank"
            );
          }}
        >
          <Linkedin className="cursor-pointer hover:scale-110 hover:rotate-3" />
        </motion.li>
      </div>
    </>
  );
}
