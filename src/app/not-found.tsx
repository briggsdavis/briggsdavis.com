import Link from "next/link"
import { SiteFooter } from "~/components/site-footer"
import { SiteHeader } from "~/components/site-header"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-950">
      <SiteHeader />
      <section className="relative flex grow overflow-hidden border-b border-stone-200">
        <div className="mx-auto flex w-full max-w-7xl grow items-center justify-center px-6 py-20 lg:px-10 lg:py-28">
          <div className="project-reveal max-w-3xl text-center">
            <h1 className="font-serif text-6xl leading-none tracking-tight sm:text-7xl lg:text-8xl">
              We can’t find that page.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-stone-600 sm:text-xl">
              It may have moved, or the address may be incorrect. You can head home or take a look
              at our recent work.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link className="border-b border-stone-950 pb-1 font-medium" href="/">
                Return home
              </Link>
              <Link className="border-b border-stone-950 pb-1 font-medium" href="/projects">
                View projects
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
