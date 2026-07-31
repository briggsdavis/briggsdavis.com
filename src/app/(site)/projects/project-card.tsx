import type { FunctionReturnType } from "convex/server"
import Link from "next/link"
import { api } from "#/_generated/api"
import { ProjectCover } from "~/components/project-cover"

const projectOpenTransitionTypes = ["project-open"]

type Project = FunctionReturnType<typeof api.projects.listPublished>[number]

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      className="project-reveal block"
      href={`/projects/${project.slug}`}
      transitionTypes={projectOpenTransitionTypes}
    >
      <div className="relative aspect-video overflow-hidden bg-stone-200">
        {project.coverImageUrl === null ? (
          <div className="flex h-full items-center justify-center p-8">
            <p className="font-serif text-3xl tracking-tight text-stone-500">{project.title}</p>
          </div>
        ) : (
          <ProjectCover
            projectId={project._id}
            src={project.coverImageUrl}
            alt={project.coverImageAlt}
            variant="card"
          />
        )}
      </div>

      <div className="mt-5">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">{project.title}</h2>
        <p className="mt-2 max-w-xl leading-7 text-stone-600">{project.summary}</p>
      </div>

      {project.client !== null || project.year !== null ? (
        <p className="mt-4 text-sm text-stone-500">
          {[project.client, project.year].filter((value) => value !== null).join(" · ")}
        </p>
      ) : null}
    </Link>
  )
}
