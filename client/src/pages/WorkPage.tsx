import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSeo } from "@/lib/useSeo";
import { site } from "@/data/site";

export default function WorkPage() {
  useSeo({
    title: "Work",
    description:
      "Robotics prototypes and deployed web applications by " + site.name + ".",
    path: "/work",
  });

  const robotics = projects.filter((p) => p.domain === "robotics");
  const web = projects.filter((p) => p.domain === "web");

  return (
    <div className="section">
      <div className="shell">
        <SectionHeading
          eyebrow="All work"
          title="Everything, in one place"
          description="Robotics prototypes and deployed applications."
        />

        <h2 className="label mt-12">Robotics</h2>
        <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {robotics.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>

        <h2 className="label mt-14">Web</h2>
        <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {web.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
