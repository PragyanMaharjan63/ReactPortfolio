import ScrollWid from "./scrollwidget";
import { motion } from "motion/react";

export default function Hero() {
  const initialAnim = { y: 30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { y: 0, opacity: 1, filter: "blur(0px)" };

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center gap-y-5 px-5 font-display">
        <motion.p
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="hero-label sm:-translate-x-30"
        >
          HI, I AM
        </motion.p>

        <motion.h1
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-6xl leading-none font-extrabold
                     tracking-tight text-white drop-shadow-2xl
                     drop-shadow-black/50 sm:text-8xl lg:text-9xl"
        >
          PRAGYAN
        </motion.h1>

        <motion.p
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="hero-label text-center sm:translate-x-40"
        >
          FRONT END WEB DEVELOPER
        </motion.p>
      </div>

      <div className="absolute right-0 -bottom-30 hidden rotate-90 sm:flex lg:bottom-30">
        <ScrollWid bar={"bottom"} />
      </div>
    </>
  );
}
