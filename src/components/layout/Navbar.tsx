"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { MobileMenu } from "./MobileMenu";
import { ArrowSwap } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { site } from "@/data/site";

export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Robotics", href: "/#robotics" },
  { label: "Web", href: "/#web" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type Tone = "light" | "dark";

/** Pages whose first screen is a dark band, so the header starts in its dark theme. */
const startsDark = (path: string) => path === "/" || path === "/contact" || path.startsWith("/projects/");

/** The section directly under the header decides whether the header reads light or dark. */
function toneUnderHeader(header: HTMLElement | null): Tone | null {
  const probe = Math.round(window.innerWidth / 2);
  const elements = document.elementsFromPoint(probe, 36);
  for (const element of elements) {
    if (header?.contains(element)) continue;
    const themed = element.closest<HTMLElement>("[data-theme]");
    if (themed && !header?.contains(themed)) return themed.dataset.theme === "dark" ? "dark" : "light";
    if (element === document.body) break;
  }
  return null;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [tone, setTone] = useState<Tone>(() => (startsDark(pathname) ? "dark" : "light"));
  const [section, setSection] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  // Scroll state and the theme under the header, throttled to one read per frame.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
      setTone(toneUnderHeader(headerRef.current) ?? (startsDark(pathname) && window.scrollY < 8 ? "dark" : "light"));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Home-page scroll-spy for the in-page anchors.
  useEffect(() => {
    if (pathname !== "/") return;
    const targets = ["robotics", "web"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSection(entry.target.id);
          else setSection((current) => (current === entry.target.id ? null : current));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [pathname]);

  // Escape closes the menu, as does growing past the mobile breakpoint; page scroll is locked while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const activeFor = (item: NavItem): "page" | "location" | undefined => {
    if (item.href.startsWith("/#")) return pathname === "/" && section === item.href.slice(2) ? "location" : undefined;
    return pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined;
  };

  const links = navItems.filter((item) => item.label !== "Contact");
  const contact = navItems.find((item) => item.label === "Contact")!;

  return (
    <header
      ref={headerRef}
      className="site-header"
      data-theme={open ? "dark" : tone}
      data-scrolled={scrolled}
      data-open={open}
    >
      <div className="shell site-header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M4 25V7h7a5 5 0 0 1 0 10H4M17 25V7l5 9 6-9v18" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="miter" />
          </svg>
          <span>
            {site.name}
            <span className="brand-subtitle">Robotics & software</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="nav-list" onMouseLeave={() => setHovered(null)}>
            {links.map((item) => {
              const current = activeFor(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current}
                    className={cn("nav-link")}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                  >
                    {item.label}
                    {hovered === item.href && (
                      <motion.span layoutId="nav-hover" className="nav-hover" transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} />
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="ml-3">
              <Link href={contact.href} aria-current={activeFor(contact)} className="btn btn-primary btn-sm">
                <span>{contact.label}</span>
                <ArrowSwap />
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="menu-toggle md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <motion.span className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <MobileMenu open={open} items={navItems} activeFor={activeFor} onNavigate={() => setOpen(false)} />
    </header>
  );
}
