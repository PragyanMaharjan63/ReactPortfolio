import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { RoboticsSection } from "@/components/sections/RoboticsSection";
import { WebProjectsSection } from "@/components/sections/WebProjectsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProjects } from "@/lib/projects";
import { pad } from "@/lib/utils";

export default async function HomePage() {
  const projects = await getProjects();
  const robots = projects.filter((project) => project.domain === "robotics");
  const deployed = projects.filter((project) => project.status === "Deployed");
  // Counts come straight from the project records — nothing here is typed by hand.
  const stats = [
    { label: "Projects", value: pad(projects.length) },
    { label: "Robots built", value: pad(robots.length) },
    { label: "Deployed", value: pad(deployed.length) },
  ];

  return (
    <>
      <HeroSection project={projects.find((project) => project.slug === "yetibot")} stats={stats} />
      <FeaturedProjects projects={projects.filter((project) => project.featured)} />
      <RoboticsSection projects={robots} />
      <WebProjectsSection projects={projects.filter((project) => project.domain === "web")} />
      <AboutSection />
      <ContactSection />
    </>
  );
}
