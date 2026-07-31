"use client"

import { useMutation } from "convex/react"
import Image from "next/image"
import { FormEvent, useCallback, useState } from "react"
import { api } from "#/_generated/api"
import type { Doc, Id } from "#/_generated/dataModel"
import { getConvexErrorMessage } from "~/lib/convex-error"

type ProjectImage = Doc<"projectImages"> & {
  url: string | null
}

export function ProjectImageCard({
  image,
  imageIds,
  position,
  projectId,
  coverImageId,
}: {
  image: ProjectImage
  imageIds: Id<"projectImages">[]
  position: number
  projectId: Id<"projects">
  coverImageId: Id<"_storage"> | null
}) {
  const updateAlt = useMutation(api.projectImages.updateAlt)
  const setCover = useMutation(api.projectImages.setCover)
  const reorderImages = useMutation(api.projectImages.reorder)
  const removeImage = useMutation(api.projectImages.remove)
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const [isBusy, setIsBusy] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const isCover = coverImageId === image.storageId

  const runImageMutation = useCallback(async (operation: () => Promise<unknown>) => {
    setError(undefined)
    setNotice(undefined)
    setIsBusy(true)

    try {
      await operation()
    } catch (caughtError) {
      setError(getConvexErrorMessage(caughtError, "Unable to update the image."))
      throw caughtError
    } finally {
      setIsBusy(false)
    }
  }, [])

  const handleAltSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const alt = formData.get("alt")

      if (typeof alt !== "string") {
        throw new Error("Missing image alt text field.")
      }

      try {
        await runImageMutation(() => updateAlt({ imageId: image._id, alt }))
        setNotice("Alt text saved.")
      } catch {
        return
      }
    },
    [image._id, runImageMutation, updateAlt],
  )

  const handleCover = useCallback(async () => {
    try {
      await runImageMutation(() =>
        setCover({
          projectId,
          imageId: isCover ? null : image._id,
        }),
      )
      setNotice(isCover ? "Cover removed." : "Cover selected.")
    } catch {
      return
    }
  }, [image._id, isCover, projectId, runImageMutation, setCover])

  const move = useCallback(
    async (offset: -1 | 1) => {
      const nextPosition = position + offset

      if (nextPosition < 0 || nextPosition >= imageIds.length) {
        return
      }

      const nextImageIds = [...imageIds]
      ;[nextImageIds[position], nextImageIds[nextPosition]] = [
        nextImageIds[nextPosition],
        nextImageIds[position],
      ]

      try {
        await runImageMutation(() =>
          reorderImages({
            projectId,
            imageIds: nextImageIds,
          }),
        )
      } catch {
        return
      }
    },
    [imageIds, position, projectId, reorderImages, runImageMutation],
  )

  const moveUp = useCallback(async () => {
    await move(-1)
  }, [move])

  const moveDown = useCallback(async () => {
    await move(1)
  }, [move])

  const showDeleteConfirmation = useCallback(() => {
    setIsConfirmingDelete(true)
  }, [])

  const hideDeleteConfirmation = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [])

  const handleDelete = useCallback(async () => {
    try {
      await runImageMutation(() => removeImage({ imageId: image._id }))
    } catch {
      setIsConfirmingDelete(false)
    }
  }, [image._id, removeImage, runImageMutation])

  return (
    <article
      className="rounded-xl border border-stone-200 bg-white p-4"
      aria-label={`Project image ${position + 1}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-stone-100">
        {image.url === null ? (
          <p className="flex h-full items-center justify-center text-sm text-stone-500">
            Image unavailable
          </p>
        ) : (
          <Image
            className="object-cover"
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}
        {isCover ? (
          <span className="absolute top-3 left-3 rounded-full bg-stone-950 px-2.5 py-1 text-xs font-medium text-white">
            Cover
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={moveUp}
          disabled={isBusy || position === 0}
        >
          Move up
        </button>
        <button
          className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={moveDown}
          disabled={isBusy || position === imageIds.length - 1}
        >
          Move down
        </button>
        <button
          className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={handleCover}
          disabled={isBusy}
        >
          {isCover ? "Remove cover" : "Set as cover"}
        </button>
      </div>

      <form className="mt-5" onSubmit={handleAltSubmit}>
        <label className="block" htmlFor={`alt-${image._id}`}>
          <span className="text-sm font-medium">Alt text</span>
          <input
            className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
            id={`alt-${image._id}`}
            name="alt"
            type="text"
            defaultValue={image.alt}
            maxLength={240}
            disabled={isBusy}
          />
        </label>
        <button
          className="mt-3 text-sm font-medium underline decoration-stone-300 underline-offset-4 transition hover:decoration-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
          type="submit"
          disabled={isBusy}
        >
          Save alt text
        </button>
      </form>

      <div className="mt-4 min-h-5" aria-live="polite">
        {error !== undefined ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {notice !== undefined ? (
          <p className="text-sm font-medium text-emerald-700">{notice}</p>
        ) : null}
      </div>

      {isConfirmingDelete ? (
        <div className="mt-4 flex items-center gap-3 border-t border-red-100 pt-4">
          <button
            className="rounded-lg bg-red-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
          >
            {isBusy ? "Deleting…" : "Delete permanently"}
          </button>
          <button
            className="rounded-lg px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
            type="button"
            onClick={hideDeleteConfirmation}
            disabled={isBusy}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="mt-4 text-sm font-medium text-red-700 underline decoration-red-200 underline-offset-4 transition hover:decoration-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          onClick={showDeleteConfirmation}
          disabled={isBusy}
        >
          Delete image
        </button>
      )}
    </article>
  )
}
