"use client"

import { useMutation } from "convex/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useCallback, useState } from "react"
import { api } from "#/_generated/api"
import { getConvexErrorMessage } from "~/lib/convex-error"

const nonSlugCharactersPattern = /[^a-z0-9]+/g
const edgeHyphensPattern = /^-+|-+$/g

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(nonSlugCharactersPattern, "-")
    .replace(edgeHyphensPattern, "")
}

export function NewProjectForm() {
  const createProject = useMutation(api.projects.create)
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [hasCustomSlug, setHasCustomSlug] = useState(false)
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextTitle = event.currentTarget.value
      setTitle(nextTitle)

      if (!hasCustomSlug) {
        setSlug(slugify(nextTitle))
      }
    },
    [hasCustomSlug],
  )

  const handleSlugChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSlug(event.currentTarget.value)
    setHasCustomSlug(true)
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(undefined)
      setIsSubmitting(true)

      try {
        const projectId = await createProject({ title, slug })
        router.replace(`/admin/projects/${projectId}`)
      } catch (caughtError) {
        setError(getConvexErrorMessage(caughtError, "Unable to create the project."))
        setIsSubmitting(false)
      }
    },
    [createProject, router, slug, title],
  )

  return (
    <div className="max-w-2xl">
      <Link
        className="text-sm font-medium text-stone-500 transition hover:text-stone-950"
        href="/admin/projects"
      >
        Back to projects
      </Link>
      <h1 className="mt-8 font-serif text-5xl tracking-tight">Create a project</h1>
      <p className="mt-2 text-stone-600">
        Start with a title and URL slug. Everything else can be added in the editor.
      </p>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <label className="block" htmlFor="title">
          <span className="text-sm font-medium">Title</span>
          <input
            className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            maxLength={120}
            required
          />
        </label>

        <label className="block" htmlFor="slug">
          <span className="text-sm font-medium">Slug</span>
          <div className="mt-2 flex items-center rounded-lg border border-stone-300 bg-white focus-within:border-stone-950 focus-within:ring-2 focus-within:ring-stone-950/10">
            <span className="pl-3 text-sm text-stone-400">/projects/</span>
            <input
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 pr-3 text-sm outline-none"
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={handleSlugChange}
              maxLength={96}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </div>
        </label>

        {error !== undefined ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 border-t border-stone-200 pt-6">
          <button
            className="rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create project"}
          </button>
          <Link
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
            href="/admin/projects"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
