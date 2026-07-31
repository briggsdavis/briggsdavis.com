import type { Metadata } from "next"

const email = "hello@briggsdavis.com"

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation with Briggs Davis about your next website.",
}

export default function ContactPage() {
  return (
    <main className="flex grow flex-col">
      <div className="mx-auto grid w-full max-w-7xl grow gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-24 lg:px-10 lg:py-28">
        <header className="project-reveal max-w-2xl">
          <h1 className="font-serif text-6xl leading-none tracking-tight sm:text-7xl lg:text-8xl">
            Tell us where you’re going.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-stone-600 sm:text-xl">
            Have a new website in mind, or an existing one that needs a clearer direction? Tell us
            what you’re working toward and we’ll take it from there.
          </p>
        </header>

        <div className="lg:mt-4">
          <p className="max-w-xl font-serif text-2xl leading-tight tracking-tight sm:text-4xl">
            <span className="block">Email us at</span>
            <span className="mt-2 block text-stone-500">{email}</span>
            <span className="mt-2 block">
              or{" "}
              <a
                className="border-b border-stone-950 transition-opacity hover:opacity-60"
                href="https://cal.com/ntedvs/quick-chat"
                target="_blank"
                rel="noreferrer"
              >
                set up a call
              </a>
              .
            </span>
          </p>
        </div>
      </div>
    </main>
  )
}
