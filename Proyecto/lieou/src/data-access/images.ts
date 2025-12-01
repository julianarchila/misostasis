import { eq, MyRpcClient } from "@/lib/effect-query"
import { Data, Effect } from "effect"
import type { PlaceImage } from "@/server/schemas/image"

// ============================================================================
// Error Types
// ============================================================================

export class ImageUploadError extends Data.TaggedError("ImageUploadError")<{
  fileName: string
  cause: unknown
}> {}

// ============================================================================
// Core Operations (Effects)
// ============================================================================

/**
 * Initiate upload - returns presigned URL and creates pending record
 */
export const initiateImageUpload = (placeId: number, file: File) =>
  Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient

    return yield* rpcClient.ImageInitiateUpload({
      placeId,
      filename: file.name,
      contentType: file.type,
    })
  })

/**
 * Upload file to R2 using presigned URL
 */
export const uploadToR2 = (uploadUrl: string, file: File) =>
  Effect.tryPromise({
    try: () =>
      fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      }),
    catch: (error) => new ImageUploadError({ fileName: file.name, cause: error }),
  })

/**
 * Confirm upload completed
 */
export const confirmImageUpload = (imageId: number) =>
  Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    return yield* rpcClient.ImageConfirmUpload({ imageId })
  })

/**
 * Full upload flow: initiate -> upload to R2 -> confirm
 */
export const uploadImage = (placeId: number, file: File) =>
  Effect.gen(function* () {
    // 1. Initiate - get presigned URL and create pending record
    const { imageId, uploadUrl } = yield* initiateImageUpload(placeId, file)

    // 2. Upload to R2
    yield* uploadToR2(uploadUrl, file)

    // 3. Confirm upload
    const image = yield* confirmImageUpload(imageId)

    return image
  })

/**
 * Delete an image
 */
export const deleteImage = (imageId: number) =>
  Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    yield* rpcClient.ImageDelete({ imageId })
  })

/**
 * Reorder images for a place
 */
export const reorderImages = (
  placeId: number,
  imageOrder: Array<{ id: number; order: number }>
) =>
  Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    return yield* rpcClient.ImageReorder({ placeId, imageOrder })
  })

// ============================================================================
// React Query Options
// ============================================================================

/**
 * Mutation options for deleting an image
 */
export const deleteImageOptions = eq.mutationOptions({
  mutationFn: (imageId: number) => deleteImage(imageId),
})

/**
 * Mutation options for reordering images
 */
export const reorderImagesOptions = eq.mutationOptions({
  mutationFn: (params: {
    placeId: number
    imageOrder: Array<{ id: number; order: number }>
  }) => reorderImages(params.placeId, params.imageOrder),
})

/**
 * Mutation options for uploading a single image
 */
export const uploadImageOptions = eq.mutationOptions({
  mutationFn: (params: { placeId: number; file: File }) =>
    uploadImage(params.placeId, params.file),
})
