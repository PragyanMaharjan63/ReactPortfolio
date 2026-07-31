import { Github, Linkedin } from "lucide-react";
import { motion } from "motion/react";

export default function SocialMedia() {
  const initialAnim = { x: -30, opacity: 0, filter: "blur(10px)" };
  const finalAnim = { x: 0, opacity: 1, filter: "blur(0px)" };

  const socials = [
    {
      label: "GitHub",
      href: "https://www.github.com/pragyanmaharjan63",
      Icon: Github,
      delay: 0.5,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/pragyan-maharjan",
      Icon: Linkedin,
      delay: 0.6,
    },
  ];

  return (
    <ul className="bottom-0 mb-4 ml-2 flex list-none flex-row gap-4 sm:fixed sm:m-15 sm:flex-col">
      {socials.map((item) => (
        <motion.li
          key={item.label}
          initial={initialAnim}
          animate={finalAnim}
          transition={{ duration: 0.4, delay: item.delay }}
        >
          {/* A real link rather than a div with onClick: it is keyboard
              reachable, and middle/ctrl click opens a new tab as expected. */}
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${item.label} profile (opens in a new tab)`}
            className="flex size-11 items-center justify-center rounded-full
                       text-ink-muted transition-all duration-200 ease-out
                       hover:scale-110 hover:rotate-3 hover:text-white"
          >
            <item.Icon className="size-5" aria-hidden="true" />
          </a>
        </motion.li>
      ))}
    </ul>
  );
}
