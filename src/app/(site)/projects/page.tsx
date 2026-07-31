import type { Metadata } from "next"
import { listPublishedProjects } from "~/lib/public-projects"
import { SITE_NAME } from "~/lib/site"
import { ProjectCard } from "./project-card"

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected web development work from Briggs Davis.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects",
    description: "Selected web development work from Briggs Davis.",
    url: "/projects",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "Selected web development work from Briggs Davis.",
  },
}

export default async function ProjectsPage() {
  const projects = await listPublishedProjects()

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
      <header className="project-reveal max-w-3xl">
        <h1 className="font-serif text-6xl tracking-tight sm:text-7xl">Projects</h1>
        <p className="mt-5 text-lg leading-8 text-stone-600 sm:text-xl">
          A selection of websites shaped around clear ideas, useful details, and lasting
          foundations.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="mt-24 border-t border-stone-200 pt-8 text-stone-500">
          Selected work will appear here soon.
        </p>
      ) : (
        <div className="project-grid mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-24">
          {projects.map((project) => (
            <ProjectCard project={project} key={project._id} />
          ))}
        </div>
      )}
    </div>
  )
}
