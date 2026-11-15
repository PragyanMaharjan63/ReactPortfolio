import { AboutSection, EducationSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ToolkitSection } from "@/components/sections/ToolkitSection";
import { getProfile } from "@/lib/projects";

export default async function AboutPage() {
  const profile = await getProfile();
  return (
    <>
      <AboutSection profile={profile} />
      <ExperienceSection profile={profile} tag="01" detailed />
      <ToolkitSection profile={profile} tag="02" />
      <EducationSection profile={profile} tag="03" />
    </>
  );
}
