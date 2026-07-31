"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback, useState } from "react"

type Mode = "signIn" | "signUp"

function getErrorMessage(error: unknown, mode: Mode) {
  if (!(error instanceof Error)) {
    throw error
  }

  if (error.message.includes("UNAUTHORIZED_EMAIL")) {
    return "This email is not authorized to sign up as an admin."
  }

  if (error.message.includes("INVALID_EMAIL")) {
    return "Enter a valid email address."
  }

  if (error.message.includes("Invalid credentials")) {
    return "The email or password is incorrect."
  }

  return mode === "signIn"
    ? "Unable to log in. Check your details and try again."
    : "Unable to sign up. Check your details and try again."
}

export function AdminAuthForm() {
  const { signIn } = useAuthActions()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signIn")
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignUp = mode === "signUp"

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(undefined)

      const formData = new FormData(event.currentTarget)

      if (isSignUp) {
        const password = formData.get("password")
        const confirmPassword = formData.get("confirmPassword")

        if (password !== confirmPassword) {
          setError("Passwords do not match.")
          return
        }

        formData.delete("confirmPassword")
      }

      formData.set("flow", mode)
      setIsSubmitting(true)

      try {
        await signIn("password", formData)
        router.replace("/admin")
        router.refresh()
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, mode))
        setIsSubmitting(false)
      }
    },
    [isSignUp, mode, router, signIn],
  )

  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === "signUp" ? "signIn" : "signUp"))
    setError(undefined)
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-stone-50 px-6 py-16 text-stone-950">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl tracking-tight">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          {isSignUp
            ? "Sign up with an approved Briggs Davis email."
            : "Log in to manage Briggs Davis projects."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>

          {isSignUp && (
            <label className="block">
              <span className="text-sm font-medium">Confirm password</span>
              <input
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          {error !== undefined && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isSignUp
                ? "Signing up…"
                : "Logging in…"
              : isSignUp
                ? "Sign up"
                : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          {isSignUp ? "Already have an account?" : "Need an admin account?"}{" "}
          <button
            className="font-medium text-stone-950 underline decoration-stone-300 underline-offset-4 transition hover:decoration-stone-950"
            type="button"
            onClick={toggleMode}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  )
}
