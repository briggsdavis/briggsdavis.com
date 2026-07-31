import { defineApp } from "convex/server"
import { v } from "convex/values"

export default defineApp({
  env: {
    ADMIN_EMAILS: v.string(),
  },
})
