import { HeroSection } from "@/components/sections/HeroSection";
import { RoboticsSection } from "@/components/sections/RoboticsSection";
import { WebProjectsSection } from "@/components/sections/WebProjectsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ToolkitSection } from "@/components/sections/ToolkitSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getProfile, getProjects } from "@/lib/projects";
import { isOngoing } from "@/lib/profile-format";

export default async function HomePage() {
  const [projects, profile] = await Promise.all([getProjects(), getProfile()]);
  const current = profile.experience.find(isOngoing);

  return (
    <>
      <HeroSection
        project={projects.find((project) => project.slug === "yetibot")}
        tagline={current ? `${current.role}, ${current.organisation}` : profile.headline}
      />
      <RoboticsSection projects={projects.filter((project) => project.domain === "robotics")} />
      <WebProjectsSection projects={projects.filter((project) => project.domain === "web")} />
      <ExperienceSection profile={profile} tag="03" />
      <ToolkitSection profile={profile} tag="04" />
      <ContactSection />
    </>
  );
}
