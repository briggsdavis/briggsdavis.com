import Link from "next/link"

export function SiteHeader({ sticky = false }: { sticky?: boolean }) {
  return (
    <header
      className={
        sticky
          ? "sticky top-0 z-50 shrink-0 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur"
          : "relative z-50 shrink-0 border-b border-stone-200/80 bg-stone-50/90"
      }
    >
      <nav
        className="mx-auto flex w-full max-w-7xl items-center justify-evenly px-6 py-5 lg:px-10"
        aria-label="Main navigation"
      >
        <Link
          className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
          href="/"
        >
          Home
        </Link>
        <Link
          className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
          href="/projects"
        >
          Projects
        </Link>
        <Link
          className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-950"
          href="/contact"
        >
          Contact
        </Link>
      </nav>
    </header>
  )
}
