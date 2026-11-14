import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";

export function ContactSection() {
  return (
    <section id="contact" className="section border-t border-line" aria-labelledby="contact-heading">
      <div className="shell">
        <p className="label flex items-center gap-3"><span className="status-dot" /> 05 / Have something in mind?</p>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <h2 id="contact-heading" className="contact-invitation">Good things start<br />with <span className="text-accent">a conversation.</span></h2>
          <Link href="/contact" className="btn btn-primary mb-2">Let’s build something <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <a href={`mailto:${site.email}`} className="mt-8 inline-flex min-h-11 items-center gap-3 text-secondary transition-colors hover:text-accent [overflow-wrap:anywhere]">{site.email}<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" /></a>
      </div>
    </section>
  );
}
