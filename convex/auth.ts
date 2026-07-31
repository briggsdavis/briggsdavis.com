import { Password } from "@convex-dev/auth/providers/Password"
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"
import type { DataModel } from "./_generated/dataModel"
import { env, type MutationCtx, type QueryCtx } from "./_generated/server"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function adminEmails() {
  const emails = new Set(
    env.ADMIN_EMAILS.split(",")
      .map(normalizeEmail)
      .filter((email) => email.length > 0),
  )

  if (emails.size === 0) {
    throw new ConvexError({
      code: "AUTH_CONFIGURATION_ERROR",
      message: "ADMIN_EMAILS must contain at least one email.",
    })
  }

  return emails
}

const password = Password<DataModel>({
  profile(params) {
    if (typeof params.email !== "string") {
      throw new ConvexError({
        code: "INVALID_EMAIL",
        message: "Enter a valid email address.",
      })
    }

    const email = normalizeEmail(params.email)

    if (!emailPattern.test(email)) {
      throw new ConvexError({
        code: "INVALID_EMAIL",
        message: "Enter a valid email address.",
      })
    }

    if (params.flow === "signUp" && !adminEmails().has(email)) {
      throw new ConvexError({
        code: "UNAUTHORIZED_EMAIL",
        message: "This email is not authorized to sign up as an admin.",
      })
    }

    return { email }
  },
})

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password],
})

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)

  if (userId === null) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "You must be logged in as an admin.",
    })
  }

  return userId
}
