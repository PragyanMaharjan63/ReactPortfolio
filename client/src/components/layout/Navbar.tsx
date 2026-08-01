
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The menu is closed by MobileMenu's onNavigate when a link is followed,
  // by Escape, and by crossing the desktop breakpoint — so no route-change
  // effect is needed here.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        // Blur is applied only once content is behind the bar, where it earns
        // its cost by keeping the labels readable.
        scrolled || open
          ? "border-line bg-background/80 backdrop-blur-md"
          : "border-transparent",
      )}
    >
      <div className="shell flex h-(--header-height) items-center justify-between gap-4">
        <Link
          to="/"
          className="flex min-h-11 items-center text-[0.9375rem] font-semibold tracking-tight text-primary"
        >
          {site.name.split(" ")[0]}
          <span className="ml-1 text-accent" aria-hidden="true">
            .
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => {
              const active =
                item.href.startsWith("/#")
                  ? false
                  : pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center border-b text-[0.9375rem] transition-colors",
                      active
                        ? "border-accent text-primary"
                        : "border-transparent text-secondary hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="btn btn-ghost -mr-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <MobileMenu open={open} items={navItems} onNavigate={() => setOpen(false)} />
    </header>
  );
}
