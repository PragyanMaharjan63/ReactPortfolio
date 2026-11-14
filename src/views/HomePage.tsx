import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { RoboticsSection } from "@/components/sections/RoboticsSection";
import { WebProjectsSection } from "@/components/sections/WebProjectsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProjects } from "@/lib/projects";

export default async function HomePage() {
  const projects = await getProjects();
  return (
    <>
      <HeroSection project={projects.find((project) => project.slug === "yetibot")} />
      <FeaturedProjects projects={projects.filter((project) => project.featured)} />
      <RoboticsSection projects={projects.filter((project) => project.domain === "robotics")} />
      <WebProjectsSection projects={projects.filter((project) => project.domain === "web")} />
      <AboutSection />
      <ContactSection />
    </>
  );
}
