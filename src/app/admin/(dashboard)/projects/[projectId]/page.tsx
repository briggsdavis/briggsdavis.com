import type { Metadata } from "next"
import { ProjectEditor } from "./project-editor"

export const metadata: Metadata = {
  title: "Edit project",
}

export default async function ProjectEditorPage(props: PageProps<"/admin/projects/[projectId]">) {
  const { projectId } = await props.params
  return <ProjectEditor projectId={projectId} />
}
