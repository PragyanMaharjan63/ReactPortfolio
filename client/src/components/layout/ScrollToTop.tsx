import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Client-side navigation should start at the top, like a real page load. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
