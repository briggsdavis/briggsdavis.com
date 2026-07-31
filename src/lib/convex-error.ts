import { ConvexError } from "convex/values"

export function getConvexErrorMessage(error: unknown, defaultMessage: string) {
  if (error instanceof ConvexError) {
    const data: unknown = error.data

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message
    }
  }

  return defaultMessage
}
