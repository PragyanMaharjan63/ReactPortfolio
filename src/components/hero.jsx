import ScrollWid from "./scrollwidget";
import { motion } from "motion/react";

export default function Hero() {
  const initialAnim = { y: 30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { y: 0, opacity: 1, filter: "blur(0px)" };
  return (
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex 
        gap-y-4
        flex-col justify-center items-center h-screen"
      >
        <motion.p
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="font-light text-sm -translate-x-10 sm:-translate-x-30"
        >
          HI, I AM
        </motion.p>
        <motion.div
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="font-extrabold transition-all text-6xl  sm:text-9xl drop-shadow-2xl drop-shadow-neutral-900/60 "
        >
          PRAGYAN
        </motion.div>
        <motion.p
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="font-light text-sm translate-x-10 sm:translate-x-40"
        >
          FRONT END DEVELOPER
        </motion.p>
      </div>
      <div className="hidden sm:flex rotate-90 absolute -bottom-30 lg:bottom-30 -right-20 lg:right-0">
        <ScrollWid bar={"bottom"} />{" "}
      </div>
    </>
  );
}
