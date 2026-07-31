import Link from "next/link"

export default function ProjectNotFound() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
      <h1 className="font-serif text-6xl tracking-tight">Project not found</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
        This project may be unpublished or no longer available.
      </p>
      <Link
        className="mt-8 inline-block border-b border-stone-950 pb-1 font-medium"
        href="/projects"
      >
        View all projects
      </Link>
    </div>
  )
}
