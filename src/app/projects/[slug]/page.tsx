import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
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
  const project = await getProject(slug);
  if (!project) notFound();
  return <ProjectPage project={project} />;
}
