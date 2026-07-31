"use client"

import { useQuery } from "convex/react"
import Link from "next/link"
import { api } from "#/_generated/api"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
})

export function ProjectsList() {
  const projects = useQuery(api.projects.listAdmin, {})

  if (projects === undefined) {
    return (
      <output className="block py-24 text-center text-sm text-stone-500">Loading projects…</output>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-5xl tracking-tight">Projects</h1>
          <p className="mt-2 text-stone-600">
            Create, edit, and publish Briggs Davis case studies.
          </p>
        </div>
        <Link
          className="shrink-0 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
          href="/admin/projects/new"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <h2 className="font-serif text-3xl tracking-tight">No projects yet</h2>
          <p className="mt-2 text-sm text-stone-600">Create your first project to get started.</p>
          <Link
            className="mt-6 inline-block rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
            href="/admin/projects/new"
          >
            Create a project
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
          {projects.map((project) => (
            <li key={project._id}>
              <Link
                className="grid gap-3 py-5 transition hover:bg-white sm:grid-cols-[1fr_auto] sm:items-center sm:px-4"
                href={`/admin/projects/${project._id}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate font-serif text-2xl tracking-tight">{project.title}</h2>
                    <span
                      className={
                        project.status === "published"
                          ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700"
                      }
                    >
                      {project.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-stone-500">/{project.slug}</p>
                </div>
                <p className="text-sm text-stone-500">
                  Updated{" "}
                  <time dateTime={new Date(project.updatedAt).toISOString()}>
                    {dateFormatter.format(project.updatedAt)}
                  </time>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
