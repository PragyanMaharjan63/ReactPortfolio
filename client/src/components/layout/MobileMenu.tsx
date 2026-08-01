
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { mobileMenu } from "@/lib/motion";
import type { NavItem } from "./Navbar";

export function MobileMenu({
  open,
  items,
  onNavigate,
}: {
  open: boolean;
  items: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.nav
          id="mobile-menu"
          aria-label="Primary"
          variants={mobileMenu}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="border-t border-line bg-surface md:hidden"
        >
          <ul className="shell flex flex-col py-2">
            {items.map((item) => (
              <li key={item.href} className="border-b border-line last:border-b-0">
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className="flex min-h-12 items-center text-[0.9375rem] text-secondary transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
