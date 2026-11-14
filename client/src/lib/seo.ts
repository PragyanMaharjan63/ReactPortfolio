import { site } from "@/data/site";

export interface PageSeo {
  title: string;
  description: string;
  path: string;
}

/**
 * Applied on the client for in-app navigation. The initial document already
 * carries correct tags because the server injects them per route — this keeps
 * them in sync when the user navigates without a reload.
 */
export function applySeo({ title, description, path }: PageSeo): void {
  document.title = title;

  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
      el = document.createElement("meta");
      const [key, val] = selector.replace(/[[\]"]/g, "").split("=");
      el.setAttribute(key.replace("meta", ""), val);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", `${site.url}${path}`);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = `${site.url}${path}`;
}
