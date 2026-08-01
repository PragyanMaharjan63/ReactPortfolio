import { AboutSection } from "@/components/sections/AboutSection";
import { useSeo } from "@/lib/useSeo";
import { site } from "@/data/site";

export default function AboutPage() {
  useSeo({
    title: "About",
    description: site.description,
    path: "/about",
  });

  return (
    <>
      <AboutSection />
    </>
  );
}
