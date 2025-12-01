import { Effect } from "effect"
import { randomUUID } from "crypto"
import { ImageRepository } from "@/server/repositories/image"
import { PlaceRepository } from "@/server/repositories/place"
import { UserRepository } from "@/server/repositories/user"
import { StorageService } from "@/server/services/storage"
import { authRequired } from "@/server/utils/auth"
import { Unauthenticated, PlaceNotFound, ImageNotFound } from "@/server/schemas/error"

export class ImageService extends Effect.Service<ImageService>()(
  "ImageService",
  {
    effect: Effect.gen(function* () {
      const imageRepo = yield* ImageRepository
      const placeRepo = yield* PlaceRepository
      const userRepo = yield* UserRepository
      const storage = yield* StorageService

      /**
       * Helper: verify place ownership
       */
      const verifyPlaceOwnership = (placeId: number) =>
        Effect.gen(function* () {
          const currentUser = yield* authRequired
          const dbUser = yield* userRepo.findByClerkId(currentUser.user.id)

          if (!dbUser) {
            return yield* Effect.fail(
              new Unauthenticated({ message: "User not found" })
            )
          }

          const place = yield* placeRepo.findById(placeId)

          if (!place || place.business_id !== dbUser.id) {
            return yield* Effect.fail(new PlaceNotFound({ placeId }))
          }

          return { place, dbUser }
        })

      /**
       * Helper: verify image ownership via place
       */
      const verifyImageOwnership = (imageId: number) =>
        Effect.gen(function* () {
          const image = yield* imageRepo.findById(imageId)

          if (!image) {
            return yield* Effect.fail(new ImageNotFound({ imageId }))
          }

          yield* verifyPlaceOwnership(image.place_id)
          return image
        })

      return {
        /**
         * Initiate upload: creates pending record, returns presigned URL
         */
        initiateUpload: (
          placeId: number,
          filename: string,
          contentType: string
        ) =>
          Effect.gen(function* () {
            yield* verifyPlaceOwnership(placeId)

            // Generate unique storage key
            const ext = filename.split(".").pop() ?? "jpg"
            const storageKey = `places/${placeId}/${randomUUID()}.${ext}`

            // Get presigned URL (infrastructure failure = die)
            const uploadUrl = yield* storage.getPresignedUploadUrl(
              storageKey,
              contentType
            ).pipe(Effect.orDie)
            const publicUrl = storage.getPublicUrl(storageKey)

            // Create pending image record
            const image = yield* imageRepo.createPending(
              placeId,
              publicUrl,
              storageKey
            )

            return {
              imageId: image.id,
              uploadUrl,
              publicUrl,
            }
          }),

        /**
         * Confirm upload completed - sets status to confirmed
         */
        confirmUpload: (imageId: number) =>
          Effect.gen(function* () {
            const image = yield* verifyImageOwnership(imageId)

            if (image.status === "confirmed") {
              return image // Already confirmed, idempotent
            }

            // Get next order number
            const nextOrder = yield* imageRepo.getNextOrder(image.place_id)

            const confirmed = yield* imageRepo.confirm(imageId, nextOrder)

            if (!confirmed) {
              return yield* Effect.fail(new ImageNotFound({ imageId }))
            }

            return confirmed
          }),

        /**
         * Delete an image (also removes from R2)
         */
        delete: (imageId: number) =>
          Effect.gen(function* () {
            const image = yield* verifyImageOwnership(imageId)

            // Delete from database
            yield* imageRepo.delete(imageId)

            // Queue R2 deletion (fire-and-forget, or use a job queue)
            if (image.storage_key) {
              yield* storage
                .deleteObject(image.storage_key)
                .pipe(Effect.catchAll(() => Effect.void)) // Don't fail if R2 delete fails
            }
          }),

        /**
         * Reorder images for a place
         */
        reorder: (
          placeId: number,
          imageOrder: Array<{ id: number; order: number }>
        ) =>
          Effect.gen(function* () {
            yield* verifyPlaceOwnership(placeId)
            return yield* imageRepo.reorder(placeId, imageOrder)
          }),

        /**
         * Get all confirmed images for a place
         */
        getByPlaceId: (placeId: number) =>
          Effect.gen(function* () {
            yield* verifyPlaceOwnership(placeId)
            return yield* imageRepo.findByPlaceId(placeId)
          }),

        /**
         * Cleanup stale pending uploads (for cron job)
         */
        cleanupStale: () =>
          Effect.gen(function* () {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
            const stale = yield* imageRepo.findStalePending(oneHourAgo)

            if (stale.length === 0) return { deleted: 0 }

            // Delete from R2
            for (const img of stale) {
              if (img.storage_key) {
                yield* storage
                  .deleteObject(img.storage_key)
                  .pipe(Effect.catchAll(() => Effect.void))
              }
            }

            // Delete from database
            yield* imageRepo.deleteMany(stale.map((i) => i.id))

            return { deleted: stale.length }
          }),
      }
    }),

    dependencies: [
      ImageRepository.Default,
      PlaceRepository.Default,
      UserRepository.Default,
      StorageService.Default,
    ],
    accessors: true,
  }
) {}
