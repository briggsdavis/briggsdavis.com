import type { MetadataRoute } from "next"
import { listPublishedProjects } from "~/lib/public-projects"
import { SITE_URL } from "~/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await listPublishedProjects()

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/projects`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ]
}
