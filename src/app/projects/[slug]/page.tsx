import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/metadata";
import ProjectPage from "@/views/ProjectPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return pageMetadata(project.title, project.summary, `/projects/${project.slug}`, project.image);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();
  const at = all.findIndex((candidate) => candidate.slug === slug);
  const next = all.length > 1 && at >= 0 ? all[(at + 1) % all.length] : undefined;
  return <ProjectPage project={project} next={next} />;
}
