import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { projectFieldsValidator, projectImageFieldsValidator } from "./projectValidators"

export default defineSchema({
  ...authTables,
  projects: defineTable(projectFieldsValidator)
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_coverImageId", ["coverImageId"])
    .index("by_status_and_sortOrder", ["status", "sortOrder"])
    .index("by_status_and_featured_and_sortOrder", ["status", "featured", "sortOrder"]),
  projectImages: defineTable(projectImageFieldsValidator)
    .index("by_projectId_and_sortOrder", ["projectId", "sortOrder"])
    .index("by_storageId", ["storageId"]),
})
