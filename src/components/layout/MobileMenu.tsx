"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { pad } from "@/lib/utils";
import { site } from "@/data/site";
import type { NavItem } from "./Navbar";

export function MobileMenu({
  open,
  items,
  activeFor,
  onNavigate,
}: {
  open: boolean;
  items: NavItem[];
  activeFor: (item: NavItem) => "page" | "location" | undefined;
  onNavigate: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.nav
          id="mobile-menu"
          aria-label="Primary"
          data-theme="dark"
          className="mobile-menu md:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <ul className="shell flex flex-1 flex-col justify-center py-6">
            {items.map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 + i * 0.05, ease: EASE }}
              >
                <Link href={item.href} onClick={onNavigate} aria-current={activeFor(item)} className="mobile-menu-link">
                  <span className="label" aria-hidden="true">{pad(i + 1)}</span>
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
          <div className="shell flex flex-wrap items-center justify-between gap-3 pb-8">
            <a href={`mailto:${site.email}`} className="label label-strong min-h-11 inline-flex items-center [overflow-wrap:anywhere]">{site.email}</a>
            <span className="label">{site.location}</span>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
