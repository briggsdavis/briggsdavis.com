"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, useCallback, useState } from "react"

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuthActions()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true)
    await signOut()
    router.replace("/admin/auth")
    router.refresh()
  }, [router, signOut])

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-8">
            <Link className="font-serif text-2xl tracking-tight" href="/admin/projects">
              Admin
            </Link>
            <nav aria-label="Admin navigation">
              <Link
                className="text-sm font-medium text-stone-600 transition hover:text-stone-950"
                href="/admin/projects"
              >
                Projects
              </Link>
            </nav>
          </div>
          <button
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium transition hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
    </div>
  )
}
