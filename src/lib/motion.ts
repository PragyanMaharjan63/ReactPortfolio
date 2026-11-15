import type { Variants, Transition } from "framer-motion";

/** Shared easing — expo-out, no springy overshoot. */
export const EASE: Transition["ease"] = [0.16, 1, 0.3, 1];

export const DURATION = { fast: 0.2, base: 0.5, slow: 0.8 } as const;

/** Fade + small rise. The distance is deliberately small to avoid layout shift. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
};

/** Parent that staggers its children. Children should use `fadeUp`. */
export const stagger = (staggerChildren = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Standard scroll-reveal props. `once` so nothing re-animates on scroll-back. */
export const revealProps = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
} as const;
