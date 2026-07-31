import { fetchQuery } from "convex/nextjs"
import { cache } from "react"
import { api } from "#/_generated/api"

export const listPublishedProjects = cache(async () => {
  return await fetchQuery(api.projects.listPublished, {})
})

export const getPublishedProject = cache(async (slug: string) => {
  return await fetchQuery(api.projects.getPublishedBySlug, { slug })
})
