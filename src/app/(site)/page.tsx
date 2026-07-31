import type { Metadata } from "next"
import Link from "next/link"
import { HeroChromaticWaves } from "~/components/hero-chromatic-waves"
import { ServicesWheel } from "~/components/services-wheel"
import { SiteFooter } from "~/components/site-footer"
import { SiteHeader } from "~/components/site-header"
import { listPublishedProjects } from "~/lib/public-projects"
import { ProjectCard } from "./projects/project-card"

export const metadata: Metadata = {
  title: { absolute: "Briggs Davis" },
  description:
    "Briggs Davis is a two-person web development firm creating clear, fast, durable websites.",
}

export default async function Home() {
  const projects = await listPublishedProjects()
  const recentProjects = projects.slice(0, 4)

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <section className="relative flex grow flex-col overflow-hidden border-b border-stone-200">
          <HeroChromaticWaves />
          <div className="relative z-10 mx-auto flex w-full max-w-7xl grow items-center px-6 py-12 sm:py-16 lg:px-10">
            <div className="project-reveal max-w-4xl">
              <h1 className="font-serif text-5xl leading-none tracking-tight sm:text-7xl lg:text-8xl">
                Websites for companies with somewhere to go.
              </h1>
              <div className="mt-10 max-w-2xl">
                <p className="text-lg leading-8 text-stone-600 sm:text-xl">
                  We’re Briggs Davis, a two-person web development firm. We make clear, fast,
                  durable websites for ambitious teams.
                </p>
                <Link
                  className="mt-8 inline-block border-b border-stone-950 pb-1 font-medium"
                  href="/projects"
                >
                  See our work
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ServicesWheel />

      {recentProjects.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-serif text-5xl tracking-tight sm:text-6xl">Recent work</h2>
            <Link
              className="hidden border-b border-stone-950 pb-1 text-sm font-medium sm:block"
              href="/projects"
            >
              All projects
            </Link>
          </div>

          <div className="project-grid mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-16">
            {recentProjects.map((project) => (
              <ProjectCard project={project} key={project._id} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-stone-200" id="process">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
          <div>
            <h2 className="max-w-lg font-serif text-5xl tracking-tight sm:text-6xl">
              From the first idea to the final detail.
            </h2>
          </div>

          <ol className="divide-y divide-stone-200">
            <li className="grid grid-cols-6 gap-4 py-7">
              <span className="text-sm text-stone-400">01</span>
              <div className="col-span-5">
                <h3 className="font-serif text-2xl tracking-tight">Direction</h3>
                <p className="mt-2 max-w-xl leading-7 text-stone-600">
                  We turn goals, audiences, and constraints into a practical plan for the website.
                </p>
              </div>
            </li>
            <li className="grid grid-cols-6 gap-4 py-7">
              <span className="text-sm text-stone-400">02</span>
              <div className="col-span-5">
                <h3 className="font-serif text-2xl tracking-tight">Design and development</h3>
                <p className="mt-2 max-w-xl leading-7 text-stone-600">
                  We shape the visual system and build a responsive, accessible site that feels
                  considered at every size.
                </p>
              </div>
            </li>
            <li className="grid grid-cols-6 gap-4 py-7">
              <span className="text-sm text-stone-400">03</span>
              <div className="col-span-5">
                <h3 className="font-serif text-2xl tracking-tight">Launch and support</h3>
                <p className="mt-2 max-w-xl leading-7 text-stone-600">
                  We handle the final checks, put the site into the world, and stay close as it
                  evolves.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-stone-950 text-stone-50" id="approach">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-36">
          <h2 className="max-w-xl font-serif text-6xl tracking-tight sm:text-7xl">
            Small team. Direct process.
          </h2>
          <div className="max-w-2xl">
            <p className="text-xl leading-9 text-stone-300 sm:text-2xl">
              You work with the people doing the work. That means fewer handoffs, faster decisions,
              and a website that stays close to the original idea.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10 lg:py-36">
        <div className="flex flex-col items-start justify-between gap-10 pt-10 sm:flex-row sm:items-end">
          <h2 className="max-w-4xl font-serif text-5xl tracking-tight sm:text-7xl">
            Have a website in mind? Let’s talk.
          </h2>
          <Link className="shrink-0 border-b border-stone-950 pb-1 font-medium" href="/contact">
            Start a conversation
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
