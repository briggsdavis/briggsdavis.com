import { v } from "convex/values"

export const projectStatusValidator = v.union(v.literal("draft"), v.literal("published"))

export const projectContentValidator = v.object({
  title: v.string(),
  slug: v.string(),
  summary: v.string(),
  body: v.string(),
  client: v.union(v.string(), v.null()),
  year: v.union(v.number(), v.null()),
  services: v.array(v.string()),
  websiteUrl: v.union(v.string(), v.null()),
  coverImageId: v.union(v.id("_storage"), v.null()),
  featured: v.boolean(),
})

export const projectFieldsValidator = projectContentValidator.extend({
  coverImageAlt: v.optional(v.string()),
  seoTitle: v.optional(v.union(v.string(), v.null())),
  seoDescription: v.optional(v.union(v.string(), v.null())),
  status: projectStatusValidator,
  sortOrder: v.number(),
  publishedAt: v.union(v.number(), v.null()),
  updatedAt: v.number(),
  createdBy: v.id("users"),
  updatedBy: v.id("users"),
})

export const projectDocumentValidator = projectFieldsValidator
  .omit("coverImageAlt", "seoTitle", "seoDescription")
  .extend({
    _id: v.id("projects"),
    _creationTime: v.number(),
  })

const projectCardValidator = projectContentValidator.pick(
  "title",
  "slug",
  "summary",
  "client",
  "year",
  "services",
  "coverImageId",
  "featured",
)

export const adminProjectListItemValidator = projectCardValidator.extend({
  _id: v.id("projects"),
  _creationTime: v.number(),
  status: projectStatusValidator,
  sortOrder: v.number(),
  publishedAt: v.union(v.number(), v.null()),
  updatedAt: v.number(),
})

export const publicProjectCardValidator = projectCardValidator.extend({
  _id: v.id("projects"),
  _creationTime: v.number(),
  sortOrder: v.number(),
  publishedAt: v.number(),
  updatedAt: v.number(),
  coverImageUrl: v.union(v.string(), v.null()),
})

export const publicProjectDetailValidator = projectContentValidator.extend({
  _id: v.id("projects"),
  _creationTime: v.number(),
  sortOrder: v.number(),
  publishedAt: v.number(),
  updatedAt: v.number(),
  coverImageUrl: v.union(v.string(), v.null()),
  images: v.array(
    v.object({
      _id: v.id("projectImages"),
      sortOrder: v.number(),
      url: v.union(v.string(), v.null()),
      isCover: v.boolean(),
    }),
  ),
})

export const projectImageFieldsValidator = v.object({
  projectId: v.id("projects"),
  storageId: v.id("_storage"),
  alt: v.optional(v.string()),
  sortOrder: v.number(),
  updatedAt: v.number(),
  createdBy: v.id("users"),
  updatedBy: v.id("users"),
})

export const projectImageDocumentValidator = projectImageFieldsValidator.extend({
  _id: v.id("projectImages"),
  _creationTime: v.number(),
})

export const adminProjectImageValidator = projectImageDocumentValidator.omit("alt").extend({
  url: v.union(v.string(), v.null()),
})
