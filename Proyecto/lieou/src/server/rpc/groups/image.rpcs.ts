import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import {
  InitiateUploadPayload,
  InitiateUploadResponse,
  ConfirmUploadPayload,
  DeleteImagePayload,
  ReorderImagesPayload,
  PlaceImageSchema,
} from "@/server/schemas/image"
import { Unauthenticated, PlaceNotFound, ImageNotFound } from "@/server/schemas/error"

/**
 * RPC group for image-related operations
 */
export class ImageRpcs extends RpcGroup.make(
  /**
   * Initiate image upload - returns presigned URL and creates pending record
   */
  Rpc.make("InitiateUpload", {
    payload: InitiateUploadPayload,
    success: InitiateUploadResponse,
    error: Schema.Union(Unauthenticated, PlaceNotFound),
  }),

  /**
   * Confirm upload completed
   */
  Rpc.make("ConfirmUpload", {
    payload: ConfirmUploadPayload,
    success: PlaceImageSchema,
    error: Schema.Union(Unauthenticated, PlaceNotFound, ImageNotFound),
  }),

  /**
   * Delete an image
   */
  Rpc.make("Delete", {
    payload: DeleteImagePayload,
    success: Schema.Void,
    error: Schema.Union(Unauthenticated, PlaceNotFound, ImageNotFound),
  }),

  /**
   * Reorder images for a place
   */
  Rpc.make("Reorder", {
    payload: ReorderImagesPayload,
    success: Schema.Array(PlaceImageSchema),
    error: Schema.Union(Unauthenticated, PlaceNotFound),
  })
).prefix("Image").middleware(AuthMiddleware) {}
