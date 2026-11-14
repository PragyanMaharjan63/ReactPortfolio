import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";

export function ContactSection() {
  return (
    <section id="contact" className="section contact-section border-t border-line" aria-labelledby="contact-heading">
      <div className="shell">
        <p className="label">05 — Start a conversation</p>
        <div className="contact-heading-row"><h2 id="contact-heading">Let’s talk.</h2><Link href="/contact" className="contact-arrow" aria-label="Get in touch"><ArrowUpRight aria-hidden="true" /></Link></div>
        <div className="contact-details"><p>Have a project in mind?<br />I’d like to hear about it.</p><a href={`mailto:${site.email}`} className="text-link">{site.email}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></a></div>
      </div>
    </section>
  );
}
