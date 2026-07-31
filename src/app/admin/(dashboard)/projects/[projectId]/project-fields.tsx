import type { Doc } from "#/_generated/dataModel"

const inputClassName =
  "mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"

export function ProjectFields({ project }: { project: Doc<"projects"> }) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-serif text-3xl tracking-tight">Project details</h2>
        <div className="mt-6 grid gap-6">
          <label className="block" htmlFor="title">
            <span className="text-sm font-medium">Title</span>
            <input
              className={inputClassName}
              id="title"
              name="title"
              type="text"
              defaultValue={project.title}
              maxLength={120}
              required
            />
          </label>

          <label className="block" htmlFor="slug">
            <span className="text-sm font-medium">Slug</span>
            <div className="mt-2 flex items-center rounded-lg border border-stone-300 bg-white focus-within:border-stone-950 focus-within:ring-2 focus-within:ring-stone-950/10">
              <span className="pl-3 text-sm text-stone-400">/projects/</span>
              <input
                className="min-w-0 flex-1 bg-transparent px-1 py-2.5 pr-3 text-sm outline-none"
                id="slug"
                name="slug"
                type="text"
                defaultValue={project.slug}
                maxLength={96}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
              />
            </div>
          </label>

          <label className="block" htmlFor="summary">
            <span className="text-sm font-medium">Summary</span>
            <textarea
              className={inputClassName}
              id="summary"
              name="summary"
              defaultValue={project.summary}
              maxLength={320}
              rows={3}
            />
            <span className="mt-2 block text-xs text-stone-500">Required before publishing.</span>
          </label>

          <label className="block" htmlFor="body">
            <span className="text-sm font-medium">Body</span>
            <textarea
              className={inputClassName}
              id="body"
              name="body"
              defaultValue={project.body}
              maxLength={100_000}
              rows={14}
            />
          </label>
        </div>
      </section>

      <section className="border-t border-stone-200 pt-10">
        <h2 className="font-serif text-3xl tracking-tight">Details</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block" htmlFor="client">
            <span className="text-sm font-medium">Client</span>
            <input
              className={inputClassName}
              id="client"
              name="client"
              type="text"
              defaultValue={project.client ?? ""}
              maxLength={120}
            />
          </label>

          <label className="block" htmlFor="year">
            <span className="text-sm font-medium">Year</span>
            <input
              className={inputClassName}
              id="year"
              name="year"
              type="number"
              defaultValue={project.year ?? ""}
              min={1900}
              max={2100}
              step={1}
            />
          </label>

          <label className="block sm:col-span-2" htmlFor="services">
            <span className="text-sm font-medium">Services</span>
            <input
              className={inputClassName}
              id="services"
              name="services"
              type="text"
              defaultValue={project.services.join(", ")}
            />
            <span className="mt-2 block text-xs text-stone-500">
              Separate services with commas.
            </span>
          </label>

          <label className="block sm:col-span-2" htmlFor="websiteUrl">
            <span className="text-sm font-medium">Website URL</span>
            <input
              className={inputClassName}
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              defaultValue={project.websiteUrl ?? ""}
              maxLength={2048}
            />
          </label>

          <label className="flex items-start gap-3 sm:col-span-2" htmlFor="featured">
            <input
              className="mt-1 size-4 rounded border-stone-300 text-stone-950 focus:ring-stone-950"
              id="featured"
              name="featured"
              type="checkbox"
              aria-label="Featured project"
              defaultChecked={project.featured}
            />
            <span>
              <span className="block text-sm font-medium">Featured project</span>
              <span className="mt-1 block text-xs text-stone-500">
                Show this project in featured work sections after it is published.
              </span>
            </span>
          </label>
        </div>
      </section>
    </div>
  )
}
