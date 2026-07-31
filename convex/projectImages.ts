// oxlint-disable no-await-in-loop
import { ConvexError, v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server"
import { requireAdmin } from "./auth"
import { adminProjectImageValidator } from "./projectValidators"

const MAX_IMAGES_PER_PROJECT = 100
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024
const allowedContentTypes = new Set(["image/avif", "image/jpeg", "image/png", "image/webp"])

function invalidImage(message: string): never {
  throw new ConvexError({
    code: "INVALID_PROJECT_IMAGE",
    message,
  })
}

async function getProjectOrThrow(ctx: QueryCtx | MutationCtx, projectId: Id<"projects">) {
  const project = await ctx.db.get("projects", projectId)

  if (project === null) {
    throw new ConvexError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
    })
  }

  return project
}

async function getImageOrThrow(ctx: MutationCtx, imageId: Id<"projectImages">) {
  const image = await ctx.db.get("projectImages", imageId)

  if (image === null) {
    throw new ConvexError({
      code: "PROJECT_IMAGE_NOT_FOUND",
      message: "Project image not found.",
    })
  }

  return image
}

export const listAdmin = query({
  args: {
    projectId: v.string(),
  },
  returns: v.array(adminProjectImageValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const projectId = ctx.db.normalizeId("projects", args.projectId)

    if (projectId === null) {
      return []
    }

    await getProjectOrThrow(ctx, projectId)

    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId_and_sortOrder", (q) => q.eq("projectId", projectId))
      .take(MAX_IMAGES_PER_PROJECT)

    return await Promise.all(
      images.map(async (image) => ({
        _id: image._id,
        _creationTime: image._creationTime,
        projectId: image.projectId,
        storageId: image.storageId,
        sortOrder: image.sortOrder,
        updatedAt: image.updatedAt,
        createdBy: image.createdBy,
        updatedBy: image.updatedBy,
        url: await ctx.storage.getUrl(image.storageId),
      })),
    )
  },
})

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
  },
  returns: v.id("projectImages"),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    await getProjectOrThrow(ctx, args.projectId)

    const metadata = await ctx.db.system.get("_storage", args.storageId)

    if (metadata === null) {
      invalidImage("Uploaded image not found.")
    }

    if (metadata.contentType === undefined || !allowedContentTypes.has(metadata.contentType)) {
      invalidImage("Upload a JPEG, PNG, WebP, or AVIF image.")
    }

    if (metadata.size > MAX_IMAGE_SIZE_BYTES) {
      invalidImage("Images must be 15 MB or smaller.")
    }

    const existingImage = await ctx.db
      .query("projectImages")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique()

    if (existingImage !== null) {
      invalidImage("This image has already been added to a project.")
    }

    const projectImages = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId_and_sortOrder", (q) => q.eq("projectId", args.projectId))
      .take(MAX_IMAGES_PER_PROJECT)

    if (projectImages.length >= MAX_IMAGES_PER_PROJECT) {
      invalidImage(`A project can have at most ${MAX_IMAGES_PER_PROJECT} images.`)
    }

    const now = Date.now()
    const lastImage = projectImages.at(-1)
    const imageId = await ctx.db.insert("projectImages", {
      projectId: args.projectId,
      storageId: args.storageId,
      sortOrder: (lastImage?.sortOrder ?? -1) + 1,
      updatedAt: now,
      createdBy: adminId,
      updatedBy: adminId,
    })

    await ctx.db.patch("projects", args.projectId, {
      updatedAt: now,
      updatedBy: adminId,
    })

    return imageId
  },
})

export const setCover = mutation({
  args: {
    projectId: v.id("projects"),
    imageId: v.union(v.id("projectImages"), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    await getProjectOrThrow(ctx, args.projectId)

    if (args.imageId === null) {
      await ctx.db.patch("projects", args.projectId, {
        coverImageId: null,
        updatedAt: Date.now(),
        updatedBy: adminId,
      })
      return null
    }

    const image = await getImageOrThrow(ctx, args.imageId)

    if (image.projectId !== args.projectId) {
      invalidImage("Cover image must belong to this project.")
    }

    await ctx.db.patch("projects", args.projectId, {
      coverImageId: image.storageId,
      updatedAt: Date.now(),
      updatedBy: adminId,
    })

    return null
  },
})

export const reorder = mutation({
  args: {
    projectId: v.id("projects"),
    imageIds: v.array(v.id("projectImages")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    await getProjectOrThrow(ctx, args.projectId)

    if (args.imageIds.length > MAX_IMAGES_PER_PROJECT) {
      invalidImage(`At most ${MAX_IMAGES_PER_PROJECT} images can be reordered at once.`)
    }

    const uniqueImageIds = new Set(args.imageIds)

    if (uniqueImageIds.size !== args.imageIds.length) {
      invalidImage("Image order cannot contain duplicates.")
    }

    const images = await ctx.db
      .query("projectImages")
      .withIndex("by_projectId_and_sortOrder", (q) => q.eq("projectId", args.projectId))
      .take(MAX_IMAGES_PER_PROJECT + 1)

    if (
      images.length !== args.imageIds.length ||
      images.some((image) => !uniqueImageIds.has(image._id))
    ) {
      invalidImage("Image order must include every project image exactly once.")
    }

    const now = Date.now()

    for (const [sortOrder, imageId] of args.imageIds.entries()) {
      const image = images.find((candidate) => candidate._id === imageId)

      if (image?.sortOrder !== sortOrder) {
        await ctx.db.patch("projectImages", imageId, {
          sortOrder,
          updatedAt: now,
          updatedBy: adminId,
        })
      }
    }

    await ctx.db.patch("projects", args.projectId, {
      updatedAt: now,
      updatedBy: adminId,
    })

    return null
  },
})

export const remove = mutation({
  args: {
    imageId: v.id("projectImages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx)
    const image = await getImageOrThrow(ctx, args.imageId)
    const project = await getProjectOrThrow(ctx, image.projectId)
    const now = Date.now()

    await ctx.db.delete("projectImages", image._id)
    await ctx.db.patch("projects", project._id, {
      ...(project.coverImageId === image.storageId ? { coverImageId: null } : {}),
      updatedAt: now,
      updatedBy: adminId,
    })
    await ctx.storage.delete(image.storageId)

    return null
  },
})

export const discardUpload = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const [attachedImage, coverProject] = await Promise.all([
      ctx.db
        .query("projectImages")
        .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
        .unique(),
      ctx.db
        .query("projects")
        .withIndex("by_coverImageId", (q) => q.eq("coverImageId", args.storageId))
        .first(),
    ])

    if (attachedImage !== null || coverProject !== null) {
      invalidImage("Attached images cannot be discarded.")
    }

    if ((await ctx.db.system.get("_storage", args.storageId)) !== null) {
      await ctx.storage.delete(args.storageId)
    }

    return null
  },
})
