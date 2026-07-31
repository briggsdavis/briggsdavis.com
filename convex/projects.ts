// oxlint-disable no-await-in-loop
import { ConvexError, v } from "convex/values"
import type { Doc, Id } from "./_generated/dataModel"
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server"
import { requireAdmin } from "./auth"
import {
  adminProjectListItemValidator,
  projectContentValidator,
  projectDocumentValidator,
  publicProjectCardValidator,
  publicProjectDetailValidator,
} from "./projectValidators"

const createProjectArgsValidator = projectContentValidator.pick("title", "slug")
const updateProjectArgsValidator = projectContentValidator
  .omit("coverImageId", "coverImageAlt")
  .partial()
  .extend({ projectId: v.id("projects") })

const MAX_PROJECTS = 100
const MAX_IMAGES_PER_PROJECT = 100
const MAX_SERVICES = 12

function invalidProject(message: string): never {
  throw new ConvexError({
    code: "INVALID_PROJECT",
    message,
  })
}

function normalizeRequiredText(value: string, label: string, maxLength: number) {
  const normalized = value.trim()

  if (normalized.length === 0) {
    invalidProject(`${label} is required.`)
  }

  if (normalized.length > maxLength) {
    invalidProject(`${label} must be ${maxLength} characters or fewer.`)
  }

  return normalized
}

function normalizeText(value: string, label: string, maxLength: number) {
  const normalized = value.trim()

  if (normalized.length > maxLength) {
    invalidProject(`${label} must be ${maxLength} characters or fewer.`)
  }

  return normalized
}

function normalizeNullableText(value: string | null, label: string, maxLength: number) {
  if (value === null) {
    return null
  }

  const normalized = normalizeText(value, label, maxLength)
  return normalized.length === 0 ? null : normalized
}

function normalizeSlug(value: string) {
  const slug = normalizeRequiredText(value, "Slug", 96).toLowerCase()

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    invalidProject("Slug can contain only lowercase letters, numbers, and single hyphens.")
  }

  return slug
}

function normalizeYear(value: number | null) {
  if (value === null) {
    return null
  }

  if (!Number.isInteger(value) || value < 1900 || value > 2100) {
    invalidProject("Year must be a whole number between 1900 and 2100.")
  }

  return value
}

function normalizeServices(services: string[]) {
  if (services.length > MAX_SERVICES) {
    invalidProject(`A project can have at most ${MAX_SERVICES} services.`)
  }

  const normalized = services.map((service) => normalizeRequiredText(service, "Service", 80))
  const uniqueServices = new Set(normalized.map((service) => service.toLowerCase()))

  if (uniqueServices.size !== normalized.length) {
    invalidProject("Services cannot contain duplicates.")
  }

  return normalized
}

function normalizeWebsiteUrl(value: string | null) {
  if (value === null) {
    return null
  }

  const normalized = normalizeRequiredText(value, "Website URL", 2048)
  let url: URL

  try {
    url = new URL(normalized)
  } catch {
    invalidProject("Website URL must be a valid URL.")
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    invalidProject("Website URL must use http or https.")
  }

  return url.toString()
}

async function getProjectOrThrow(ctx: MutationCtx, projectId: Id<"projects">) {
  const project = await ctx.db.get("projects", projectId)

  if (project === null) {
    throw new ConvexError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
    })
  }

  return project
}

async function assertSlugAvailable(ctx: MutationCtx, slug: string, projectId?: Id<"projects">) {
  const existingProject = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique()

  if (existingProject !== null && existingProject._id !== projectId) {
    throw new ConvexError({
      code: "SLUG_TAKEN",
      message: "Another project already uses this slug.",
    })
  }
}

function publishedAt(project: Doc<"projects">) {
  if (project.publishedAt === null) {
    throw new Error(`Published project "${project.slug}" is missing publishedAt.`)
  }

  return project.publishedAt
}

function toAdminListItem(project: Doc<"projects">) {
  return {
    _id: project._id,
    _creationTime: project._creationTime,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    client: project.client,
    year: project.year,
    services: project.services,
    coverImageId: project.coverImageId,
    coverImageAlt: project.coverImageAlt,
    featured: project.featured,
    status: project.status,
    sortOrder: project.sortOrder,
    publishedAt: project.publishedAt,
    updatedAt: project.updatedAt,
  }
}

async function coverImageUrl(ctx: QueryCtx, project: Doc<"projects">) {
  return project.coverImageId === null ? null : await ctx.storage.getUrl(project.coverImageId)
}

async function toPublicCard(ctx: QueryCtx, project: Doc<"projects">) {
  return {
    _id: project._id,
    _creationTime: project._creationTime,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    client: project.client,
    year: project.year,
    services: project.services,
    coverImageId: project.coverImageId,
    coverImageAlt: project.coverImageAlt,
    featured: project.featured,
    sortOrder: project.sortOrder,
    publishedAt: publishedAt(project),
    updatedAt: project.updatedAt,
    coverImageUrl: await coverImageUrl(ctx, project),
  }
}

async function toPublicDetail(ctx: QueryCtx, project: Doc<"projects">) {
  const projectImages = await ctx.db
    .query("projectImages")
    .withIndex("by_projectId_and_sortOrder", (q) => q.eq("projectId", project._id))
    .take(MAX_IMAGES_PER_PROJECT)

  const [card, images] = await Promise.all([
    toPublicCard(ctx, project),
    Promise.all(
      projectImages.map(async (image) => ({
        _id: image._id,
        alt: image.alt,
        sortOrder: image.sortOrder,
        url: await ctx.storage.getUrl(image.storageId),
        isCover: image.storageId === project.coverImageId,
      })),
    ),
  ])

  return {
    ...card,
    body: project.body,
    websiteUrl: project.websiteUrl,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    images,
  }
}

export const listAdmin = query({
  args: {},
  returns: v.array(adminProjectListItemValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const projects = await ctx.db.query("projects").withIndex("by_sortOrder").take(MAX_PROJECTS)
    return projects.map(toAdminListItem)
  },
})

export const getAdmin = query({
  args: {
    projectId: v.string(),
  },
  returns: v.union(projectDocumentValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const projectId = ctx.db.normalizeId("projects", args.projectId)
    return projectId === null ? null : await ctx.db.get("projects", projectId)
  },
})

export const listPublished = query({
  args: {},
  returns: v.array(publicProjectCardValidator),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status_and_sortOrder", (q) => q.eq("status", "published"))
      .take(MAX_PROJECTS)

    return await Promise.all(projects.map((project) => toPublicCard(ctx, project)))
  },
})

export const listFeatured = query({
  args: {},
  returns: v.array(publicProjectCardValidator),
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_status_and_featured_and_sortOrder", (q) =>
        q.eq("status", "published").eq("featured", true),
      )
      .take(12)

    return await Promise.all(projects.map((project) => toPublicCard(ctx, project)))
  },
})

export const getPublishedBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(publicProjectDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()

    return project?.status === "published" ? await toPublicDetail(ctx, project) : null
  },
})

export const create = mutation({
  args: createProjectArgsValidator.fields,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    const title = normalizeRequiredText(args.title, "Title", 120)
    const slug = normalizeSlug(args.slug)

    await assertSlugAvailable(ctx, slug)

    const lastProject = await ctx.db
      .query("projects")
      .withIndex("by_sortOrder")
      .order("desc")
      .first()
    const now = Date.now()

    return await ctx.db.insert("projects", {
      title,
      slug,
      summary: "",
      body: "",
      client: null,
      year: null,
      services: [],
      websiteUrl: null,
      coverImageId: null,
      coverImageAlt: "",
      seoTitle: null,
      seoDescription: null,
      featured: false,
      status: "draft",
      sortOrder: (lastProject?.sortOrder ?? -1) + 1,
      publishedAt: null,
      updatedAt: now,
      createdBy: adminId,
      updatedBy: adminId,
    })
  },
})

export const update = mutation({
  args: updateProjectArgsValidator.fields,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    await getProjectOrThrow(ctx, args.projectId)

    type ProjectPatch = Partial<
      Pick<
        Doc<"projects">,
        | "title"
        | "slug"
        | "summary"
        | "body"
        | "client"
        | "year"
        | "services"
        | "websiteUrl"
        | "seoTitle"
        | "seoDescription"
        | "featured"
        | "updatedAt"
        | "updatedBy"
      >
    >

    const patch: ProjectPatch = {}
    let hasChanges = false

    if (args.title !== undefined) {
      patch.title = normalizeRequiredText(args.title, "Title", 120)
      hasChanges = true
    }

    if (args.slug !== undefined) {
      const slug = normalizeSlug(args.slug)
      await assertSlugAvailable(ctx, slug, args.projectId)
      patch.slug = slug
      hasChanges = true
    }

    if (args.summary !== undefined) {
      patch.summary = normalizeText(args.summary, "Summary", 320)
      hasChanges = true
    }

    if (args.body !== undefined) {
      patch.body = normalizeText(args.body, "Body", 100_000)
      hasChanges = true
    }

    if (args.client !== undefined) {
      patch.client = normalizeNullableText(args.client, "Client", 120)
      hasChanges = true
    }

    if (args.year !== undefined) {
      patch.year = normalizeYear(args.year)
      hasChanges = true
    }

    if (args.services !== undefined) {
      patch.services = normalizeServices(args.services)
      hasChanges = true
    }

    if (args.websiteUrl !== undefined) {
      patch.websiteUrl = normalizeWebsiteUrl(args.websiteUrl)
      hasChanges = true
    }

    if (args.seoTitle !== undefined) {
      patch.seoTitle = normalizeNullableText(args.seoTitle, "SEO title", 70)
      hasChanges = true
    }

    if (args.seoDescription !== undefined) {
      patch.seoDescription = normalizeNullableText(args.seoDescription, "SEO description", 160)
      hasChanges = true
    }

    if (args.featured !== undefined) {
      patch.featured = args.featured
      hasChanges = true
    }

    if (!hasChanges) {
      invalidProject("Provide at least one project field to update.")
    }

    patch.updatedAt = Date.now()
    patch.updatedBy = adminId

    await ctx.db.patch("projects", args.projectId, patch)
    return args.projectId
  },
})

export const setPublished = mutation({
  args: {
    projectId: v.id("projects"),
    published: v.boolean(),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    const project = await getProjectOrThrow(ctx, args.projectId)
    const nextStatus = args.published ? "published" : "draft"

    if (project.status === nextStatus) {
      return project._id
    }

    if (args.published && project.summary.length === 0) {
      invalidProject("Add a project summary before publishing.")
    }

    const now = Date.now()

    await ctx.db.patch("projects", project._id, {
      status: nextStatus,
      publishedAt: args.published ? (project.publishedAt ?? now) : null,
      updatedAt: now,
      updatedBy: adminId,
    })

    return project._id
  },
})

export const reorder = mutation({
  args: {
    projectIds: v.array(v.id("projects")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)

    if (args.projectIds.length > MAX_PROJECTS) {
      invalidProject(`At most ${MAX_PROJECTS} projects can be reordered at once.`)
    }

    const uniqueProjectIds = new Set(args.projectIds)

    if (uniqueProjectIds.size !== args.projectIds.length) {
      invalidProject("Project order cannot contain duplicate projects.")
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_sortOrder")
      .take(MAX_PROJECTS + 1)

    if (projects.length > MAX_PROJECTS) {
      invalidProject(`Project reordering supports at most ${MAX_PROJECTS} projects.`)
    }

    if (
      projects.length !== args.projectIds.length ||
      projects.some((project) => !uniqueProjectIds.has(project._id))
    ) {
      invalidProject("Project order must include every project exactly once.")
    }

    const now = Date.now()

    for (const [sortOrder, projectId] of args.projectIds.entries()) {
      const project = projects.find((candidate) => candidate._id === projectId)

      if (project?.sortOrder !== sortOrder) {
        await ctx.db.patch("projects", projectId, {
          sortOrder,
          updatedAt: now,
          updatedBy: adminId,
        })
      }
    }

    return null
  },
})

export const remove = mutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const project = await getProjectOrThrow(ctx, args.projectId)
    const projectImages = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId_and_sortOrder", (q) => q.eq("projectId", project._id))
      .take(MAX_IMAGES_PER_PROJECT + 1)

    if (projectImages.length > MAX_IMAGES_PER_PROJECT) {
      invalidProject(
        `A project with more than ${MAX_IMAGES_PER_PROJECT} images cannot be deleted at once.`,
      )
    }

    const storageIds = new Set<Id<"_storage">>()

    if (project.coverImageId !== null) {
      storageIds.add(project.coverImageId)
    }

    for (const image of projectImages) {
      storageIds.add(image.storageId)
      await ctx.db.delete("projectImages", image._id)
    }

    await ctx.db.delete("projects", project._id)

    for (const storageId of storageIds) {
      await ctx.storage.delete(storageId)
    }

    return null
  },
})
