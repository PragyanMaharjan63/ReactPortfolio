import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { RoboticsSection } from "@/components/sections/RoboticsSection";
import { WebProjectsSection } from "@/components/sections/WebProjectsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { useSeo } from "@/lib/useSeo";
import { site } from "@/data/site";

export default function HomePage() {
  useSeo({
    title: `${site.name} — ${site.role}`,
    description: site.description,
    path: "/",
  });

  return (
    <>
      <HeroSection />
      <FeaturedProjects />
      <RoboticsSection />
      <WebProjectsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
