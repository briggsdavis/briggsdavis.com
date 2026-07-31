"use client"

// oxlint-disable no-await-in-loop
import { useMutation, useQuery } from "convex/react"
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react"
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
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 })

  const imageIds = useMemo(() => images?.map((image) => image._id) ?? [], [images])

  const openImagePicker = useCallback(() => {
    if (imageInputRef.current === null) {
      throw new Error("Missing project image input.")
    }

    imageInputRef.current.click()
  }, [])

  const handleUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.files === null || event.currentTarget.files.length === 0) {
        return
      }

      const files = Array.from(event.currentTarget.files)
      event.currentTarget.value = ""

      const invalidTypeFile = files.find((file) => !allowedImageTypes.has(file.type))

      if (invalidTypeFile !== undefined) {
        setError(`${invalidTypeFile.name} must be a JPEG, PNG, WebP, or AVIF image.`)
        return
      }

      const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES)

      if (oversizedFile !== undefined) {
        setError(`${oversizedFile.name} must be 15 MB or smaller.`)
        return
      }

      setError(undefined)
      setIsUploading(true)
      setUploadProgress({ completed: 0, total: files.length })
      let uploadedCount = 0

      try {
        for (const file of files) {
          let storageId: Id<"_storage"> | undefined

          try {
            const uploadUrl = await generateUploadUrl()
            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            })

            if (!response.ok) {
              throw new Error(`${file.name} upload failed with status ${response.status}.`)
            }

            const uploadResult: unknown = await response.json()
            storageId = uploadedStorageId(uploadResult)
            await addImage({
              projectId: project._id,
              storageId,
            })
            uploadedCount += 1
            setUploadProgress({ completed: uploadedCount, total: files.length })
          } catch (caughtError) {
            if (storageId !== undefined) {
              try {
                await discardUpload({ storageId })
              } catch (cleanupError) {
                console.error("Unable to discard failed project image upload.", cleanupError)
              }
            }

            throw caughtError
          }
        }
      } catch (caughtError) {
        const message = getConvexErrorMessage(caughtError, "Unable to upload the images.")
        setError(
          uploadedCount === 0
            ? message
            : `${uploadedCount} of ${files.length} images uploaded. ${message}`,
        )
      } finally {
        setIsUploading(false)
        setUploadProgress({ completed: 0, total: 0 })
      }
    },
    [addImage, discardUpload, generateUploadUrl, project._id],
  )

  return (
    <section className="mt-14 border-t border-stone-200 pt-10">
      <h2 className="font-serif text-3xl tracking-tight">Images</h2>
      <p className="mt-2 text-sm text-stone-600">
        Select images to upload them immediately, then choose a cover and control gallery order.
      </p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <input
          className="sr-only"
          ref={imageInputRef}
          id="project-image"
          name="image"
          type="file"
          accept="image/avif,image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={isUploading}
          multiple
          tabIndex={-1}
        />

        <button
          className="rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={openImagePicker}
          disabled={isUploading}
        >
          {isUploading
            ? `Uploading ${Math.min(uploadProgress.completed + 1, uploadProgress.total)} of ${uploadProgress.total}…`
            : "Upload images"}
        </button>

        {error !== undefined ? (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>

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
