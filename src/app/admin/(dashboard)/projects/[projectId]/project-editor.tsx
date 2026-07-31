"use client"

import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback, useState } from "react"
import { api } from "#/_generated/api"
import type { Doc } from "#/_generated/dataModel"
import { getConvexErrorMessage } from "~/lib/convex-error"
import { ProjectFields } from "./project-fields"
import { ProjectImages } from "./project-images"

const projectFormId = "project-editor-form"

type SubmitIntent = "save" | "publish" | "unpublish"

function formString(formData: FormData, name: string) {
  const value = formData.get(name)

  if (typeof value !== "string") {
    throw new Error(`Missing project form field: ${name}`)
  }

  return value
}

function nullableFormString(formData: FormData, name: string) {
  const value = formString(formData, name).trim()
  return value.length === 0 ? null : value
}

function submitIntent(event: FormEvent<HTMLFormElement>): SubmitIntent {
  const submitter = (event.nativeEvent as SubmitEvent).submitter

  if (!(submitter instanceof HTMLButtonElement)) {
    return "save"
  }

  if (
    submitter.value === "save" ||
    submitter.value === "publish" ||
    submitter.value === "unpublish"
  ) {
    return submitter.value
  }

  throw new Error(`Unexpected project form intent: ${submitter.value}`)
}

export function ProjectEditor({ projectId }: { projectId: string }) {
  const project = useQuery(api.projects.getAdmin, { projectId })

  if (project === undefined) {
    return (
      <output className="block py-24 text-center text-sm text-stone-500">Loading project…</output>
    )
  }

  if (project === null) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-serif text-4xl tracking-tight">Project not found</h1>
        <Link
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
          href="/admin/projects"
        >
          Back to projects
        </Link>
      </div>
    )
  }

  return <ProjectEditorForm project={project} />
}

function ProjectEditorForm({ project }: { project: Doc<"projects"> }) {
  const updateProject = useMutation(api.projects.update)
  const setPublished = useMutation(api.projects.setPublished)
  const removeProject = useMutation(api.projects.remove)
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const intent = submitIntent(event)
      const formData = new FormData(event.currentTarget)
      const year = nullableFormString(formData, "year")
      const services = formString(formData, "services")
        .split(",")
        .map((service) => service.trim())
        .filter((service) => service.length > 0)

      setError(undefined)
      setNotice(undefined)
      setIsSubmitting(true)

      try {
        await updateProject({
          projectId: project._id,
          title: formString(formData, "title"),
          slug: formString(formData, "slug"),
          summary: formString(formData, "summary"),
          body: formString(formData, "body"),
          client: nullableFormString(formData, "client"),
          year: year === null ? null : Number(year),
          services,
          websiteUrl: nullableFormString(formData, "websiteUrl"),
          seoTitle: nullableFormString(formData, "seoTitle"),
          seoDescription: nullableFormString(formData, "seoDescription"),
          featured: formData.has("featured"),
        })

        if (intent === "publish") {
          await setPublished({ projectId: project._id, published: true })
          setNotice("Project published.")
        } else if (intent === "unpublish") {
          await setPublished({ projectId: project._id, published: false })
          setNotice("Project moved to drafts.")
        } else {
          setNotice("Changes saved.")
        }
      } catch (caughtError) {
        setError(getConvexErrorMessage(caughtError, "Unable to save the project."))
      } finally {
        setIsSubmitting(false)
      }
    },
    [project._id, setPublished, updateProject],
  )

  const showDeleteConfirmation = useCallback(() => {
    setIsConfirmingDelete(true)
  }, [])

  const hideDeleteConfirmation = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [])

  const handleDelete = useCallback(async () => {
    setError(undefined)
    setNotice(undefined)
    setIsSubmitting(true)

    try {
      await removeProject({ projectId: project._id })
      router.replace("/admin/projects")
    } catch (caughtError) {
      setError(getConvexErrorMessage(caughtError, "Unable to delete the project."))
      setIsSubmitting(false)
      setIsConfirmingDelete(false)
    }
  }, [project._id, removeProject, router])

  const isPublished = project.status === "published"

  return (
    <div>
      <Link
        className="text-sm font-medium text-stone-500 transition hover:text-stone-950"
        href="/admin/projects"
      >
        Back to projects
      </Link>

      <div className="mt-8 flex flex-col gap-6 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate font-serif text-5xl tracking-tight">{project.title}</h1>
            <span
              className={
                isPublished
                  ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800"
                  : "rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700"
              }
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-500">/projects/{project.slug}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            name="intent"
            type="submit"
            value="save"
            form={projectFormId}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
          <button
            className="rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            name="intent"
            type="submit"
            value={isPublished ? "unpublish" : "publish"}
            form={projectFormId}
            disabled={isSubmitting}
          >
            {isPublished ? "Move to draft" : "Publish"}
          </button>
        </div>
      </div>

      <div className="mt-8 min-h-6" aria-live="polite">
        {error !== undefined ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {notice !== undefined ? (
          <p className="text-sm font-medium text-emerald-700">{notice}</p>
        ) : null}
      </div>

      <form className="mt-8" id={projectFormId} onSubmit={handleSubmit}>
        <ProjectFields project={project} />
      </form>

      <ProjectImages project={project} />

      <section className="mt-14 border-t border-red-200 pt-10">
        <h2 className="font-serif text-3xl tracking-tight">Delete project</h2>
        <p className="mt-2 text-sm text-stone-600">
          Deleting a project permanently removes it from the admin and public site.
        </p>

        {isConfirmingDelete ? (
          <div className="mt-5 flex items-center gap-3">
            <button
              className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting…" : "Delete permanently"}
            </button>
            <button
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
              type="button"
              onClick={hideDeleteConfirmation}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="mt-5 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
            type="button"
            onClick={showDeleteConfirmation}
          >
            Delete project
          </button>
        )}
      </section>
    </div>
  )
}
