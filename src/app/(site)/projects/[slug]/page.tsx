// oxlint-disable react-perf/jsx-no-new-object-as-prop

import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProjectCover } from "~/components/project-cover"
import { getPublishedProject } from "~/lib/public-projects"
import { SITE_NAME, SITE_URL } from "~/lib/site"

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProject(slug)

  if (project === null) {
    notFound()
  }

  const title = project.seoTitle === null ? project.title : project.seoTitle
  const description = project.seoDescription === null ? project.summary : project.seoDescription
  const images =
    project.coverImageUrl === null
      ? undefined
      : [{ url: project.coverImageUrl, alt: project.coverImageAlt }]

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/projects/${project.slug}`,
      siteName: SITE_NAME,
      locale: "en_US",
      images,
      publishedTime: new Date(project.publishedAt).toISOString(),
      modifiedTime: new Date(project.updatedAt).toISOString(),
    },
    twitter: {
      card: project.coverImageUrl === null ? "summary" : "summary_large_image",
      title,
      description,
      images,
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getPublishedProject(slug)

  if (project === null) {
    notFound()
  }

  const bodyParagraphs = project.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
  const galleryImages =
    project.coverImageUrl === null
      ? project.images
      : project.images.filter((image) => !image.isCover)
  const hasProjectDetails =
    project.client !== null || project.year !== null || project.services.length > 0
  const projectUrl = `${SITE_URL}/projects/${project.slug}`
  const projectImageUrls = project.images.flatMap((image) =>
    image.url === null ? [] : [image.url],
  )
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${projectUrl}/#article`,
        headline: project.title,
        description: project.summary,
        url: projectUrl,
        mainEntityOfPage: projectUrl,
        datePublished: new Date(project.publishedAt).toISOString(),
        dateModified: new Date(project.updatedAt).toISOString(),
        author: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
        },
        ...(projectImageUrls.length === 0 ? {} : { image: projectImageUrls }),
        keywords: project.services,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Projects",
            item: `${SITE_URL}/projects`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: project.title,
            item: projectUrl,
          },
        ],
      },
    ],
  }
  const structuredDataHtml = {
    __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredDataHtml} />
      {project.coverImageUrl !== null ? (
        <div className="mx-auto w-full max-w-7xl px-6 pt-10 lg:px-10 lg:pt-14">
          <ProjectCover
            projectId={project._id}
            src={project.coverImageUrl}
            alt={project.coverImageAlt}
            variant="hero"
          />
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-16 lg:grid-cols-3 lg:px-10 lg:py-24">
        <div className="lg:col-span-2">
          <header className="project-reveal max-w-4xl">
            <h1 className="font-serif text-6xl tracking-tight sm:text-7xl lg:text-8xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-stone-600 sm:text-2xl">
              {project.summary}
            </p>
          </header>

          {bodyParagraphs.length > 0 ? (
            <div className="mt-12 max-w-3xl space-y-6 text-lg leading-8 text-stone-700">
              {bodyParagraphs.map((paragraph) => (
                <p className="whitespace-pre-line" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {hasProjectDetails || project.websiteUrl !== null ? (
          <aside className="border-t border-stone-200 pt-7 lg:mt-4">
            {hasProjectDetails ? (
              <dl className="space-y-7">
                {project.client !== null ? (
                  <div>
                    <dt className="text-sm text-stone-500">Client</dt>
                    <dd className="mt-2">{project.client}</dd>
                  </div>
                ) : null}
                {project.year !== null ? (
                  <div>
                    <dt className="text-sm text-stone-500">Year</dt>
                    <dd className="mt-2">{project.year}</dd>
                  </div>
                ) : null}
                {project.services.length > 0 ? (
                  <div>
                    <dt className="text-sm text-stone-500">Services</dt>
                    <dd className="mt-2">{project.services.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {project.websiteUrl !== null ? (
              <a
                className="mt-8 inline-block border-b border-stone-950 pb-1 font-medium transition-opacity hover:opacity-60"
                href={project.websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit website
              </a>
            ) : null}
          </aside>
        ) : null}
      </div>

      {galleryImages.length > 0 ? (
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-20 lg:px-10 lg:pb-28">
          {galleryImages.map((image) =>
            image.url === null ? null : (
              <figure
                className="relative aspect-video overflow-hidden bg-stone-200"
                key={image._id}
              >
                <Image
                  className="object-contain"
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              </figure>
            ),
          )}
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl border-t border-stone-200 px-6 py-14 lg:px-10">
        <Link
          className="font-serif text-3xl tracking-tight transition-opacity hover:opacity-60"
          href="/projects"
        >
          View all projects
        </Link>
      </div>
    </article>
  )
}
