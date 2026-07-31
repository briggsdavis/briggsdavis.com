import type { ReactNode } from "react"
import { SiteFooter } from "~/components/site-footer"
import { SiteHeader } from "~/components/site-header"

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-950">
      <SiteHeader sticky />
      <div className="flex grow flex-col">{children}</div>
      <SiteFooter />
    </div>
  )
}
