import Image from "next/image"
import { ViewTransition, type ViewTransitionClass } from "react"
import type { Id } from "#/_generated/dataModel"

const projectCoverTransition = {
  "project-open": "project-cover",
  default: "none",
} satisfies ViewTransitionClass

type ProjectCoverProps = {
  projectId: Id<"projects">
  src: string
  variant: "card" | "hero"
}

export function ProjectCover({ projectId, src, variant }: ProjectCoverProps) {
  const isCard = variant === "card"

  return (
    <ViewTransition name={`project-cover-${projectId}`} share={projectCoverTransition}>
      <div className="relative aspect-video overflow-hidden bg-stone-200">
        <Image
          className={
            isCard
              ? "object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              : "object-cover"
          }
          src={src}
          alt=""
          fill
          sizes={isCard ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 1280px) 100vw, 1280px"}
        />
      </div>
    </ViewTransition>
  )
}
