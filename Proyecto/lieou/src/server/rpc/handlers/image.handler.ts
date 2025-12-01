import { Effect, Layer } from "effect"
import { ImageRpcs } from "@/server/rpc/groups/image.rpcs"
import { ImageService } from "@/server/services/image"
import type { PlaceImage } from "@/server/schemas/image"

/**
 * Image RPC handlers implementation
 */
export const ImageHandlersLive = ImageRpcs.toLayer(
  Effect.gen(function* () {
    const imageService = yield* ImageService

    return {
      ImageInitiateUpload: (payload) =>
        imageService.initiateUpload(
          payload.placeId,
          payload.filename,
          payload.contentType
        ),

      ImageConfirmUpload: (payload) =>
        imageService.confirmUpload(payload.imageId).pipe(
          // Cast status from string to literal type (DB returns string, schema expects literal)
          Effect.map((img) => img as PlaceImage)
        ),

      ImageDelete: (payload) => 
        imageService.delete(payload.imageId),

      ImageReorder: (payload) =>
        imageService.reorder(payload.placeId, [...payload.imageOrder]).pipe(
          // Cast status from string to literal type
          Effect.map((imgs) => imgs as PlaceImage[])
        ),
    }
  })
).pipe(Layer.provide(ImageService.Default))
