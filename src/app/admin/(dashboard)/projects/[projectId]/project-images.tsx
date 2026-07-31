"use client"

import { useMutation, useQuery } from "convex/react"
import { FormEvent, useCallback, useMemo, useRef, useState } from "react"
import { api } from "#/_generated/api"
import type { Doc, Id } from "#/_generated/dataModel"
import { getConvexErrorMessage } from "~/lib/convex-error"
import { ProjectImageCard } from "./project-image-card"

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024
const allowedImageTypes = new Set(["image/avif", "image/jpeg", "image/png", "image/webp"])

function uploadedStorageId(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("storageId" in value) ||
    typeof value.storageId !== "string"
  ) {
    throw new Error("Convex upload response did not include a storage ID.")
  }

  return value.storageId as Id<"_storage">
}

export function ProjectImages({ project }: { project: Doc<"projects"> }) {
  const images = useQuery(api.projectImages.listAdmin, { projectId: project._id })
  const generateUploadUrl = useMutation(api.projectImages.generateUploadUrl)
  const addImage = useMutation(api.projectImages.add)
  const discardUpload = useMutation(api.projectImages.discardUpload)
  const uploadFormRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string>()
  const [isUploading, setIsUploading] = useState(false)

  const imageIds = useMemo(() => images?.map((image) => image._id) ?? [], [images])

  const handleUpload = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      const file = formData.get("image")
      const altValue = formData.get("alt")

      if (!(file instanceof File) || file.size === 0) {
        setError("Choose an image to upload.")
        return
      }

      if (typeof altValue !== "string") {
        throw new Error("Missing image alt text field.")
      }

      if (!allowedImageTypes.has(file.type)) {
        setError("Upload a JPEG, PNG, WebP, or AVIF image.")
        return
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Images must be 15 MB or smaller.")
        return
      }

      setError(undefined)
      setIsUploading(true)
      let storageId: Id<"_storage"> | undefined

      try {
        const uploadUrl = await generateUploadUrl()
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!response.ok) {
          throw new Error(`Image upload failed with status ${response.status}.`)
        }

        const uploadResult: unknown = await response.json()
        storageId = uploadedStorageId(uploadResult)
        await addImage({
          projectId: project._id,
          storageId,
          alt: altValue,
        })
        uploadFormRef.current?.reset()
      } catch (caughtError) {
        if (storageId !== undefined) {
          try {
            await discardUpload({ storageId })
          } catch (cleanupError) {
            console.error("Unable to discard failed project image upload.", cleanupError)
          }
        }

        setError(getConvexErrorMessage(caughtError, "Unable to upload the image."))
      } finally {
        setIsUploading(false)
      }
    },
    [addImage, discardUpload, generateUploadUrl, project._id],
  )

  return (
    <section className="mt-14 border-t border-stone-200 pt-10">
      <h2 className="font-serif text-3xl tracking-tight">Images</h2>
      <p className="mt-2 text-sm text-stone-600">
        Upload project images, choose a cover, add alt text, and control gallery order.
      </p>

      <form
        className="mt-6 rounded-xl border border-stone-200 bg-white p-5"
        ref={uploadFormRef}
        onSubmit={handleUpload}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block" htmlFor="project-image">
            <span className="text-sm font-medium">Image</span>
            <input
              className="mt-2 block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-950 hover:file:bg-stone-200"
              id="project-image"
              name="image"
              type="file"
              accept="image/avif,image/jpeg,image/png,image/webp"
              disabled={isUploading}
              required
            />
          </label>

          <label className="block" htmlFor="project-image-alt">
            <span className="text-sm font-medium">Alt text</span>
            <input
              className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/10"
              id="project-image-alt"
              name="alt"
              type="text"
              maxLength={240}
              disabled={isUploading}
            />
            <span className="mt-2 block text-xs text-stone-500">
              Leave empty only when the image is decorative.
            </span>
          </label>
        </div>

        {error !== undefined ? (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          className="mt-5 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading…" : "Upload image"}
        </button>
      </form>

      {images === undefined ? (
        <output className="block py-16 text-center text-sm text-stone-500">Loading images…</output>
      ) : images.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone-500">No images uploaded yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {images.map((image, index) => (
            <ProjectImageCard
              key={image._id}
              image={image}
              imageIds={imageIds}
              position={index}
              projectId={project._id}
              coverImageId={project.coverImageId}
            />
          ))}
        </div>
      )}
    </section>
  )
}
