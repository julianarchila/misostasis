import { Schema } from "effect"

// ============================================================================
// Image Status
// ============================================================================

export const ImageStatus = Schema.Literal("pending", "confirmed")
export type ImageStatus = Schema.Schema.Type<typeof ImageStatus>

// ============================================================================
// Entity Schemas
// ============================================================================

export const PlaceImageSchema = Schema.Struct({
  id: Schema.Number,
  place_id: Schema.Number,
  url: Schema.String,
  storage_key: Schema.NullOr(Schema.String),
  order: Schema.Number,
  status: ImageStatus,
  created_at: Schema.NullOr(Schema.Date),
})

export type PlaceImage = Schema.Schema.Type<typeof PlaceImageSchema>

// ============================================================================
// RPC Payloads
// ============================================================================

/**
 * Payload for initiating an image upload
 */
export const InitiateUploadPayload = Schema.Struct({
  placeId: Schema.Number,
  filename: Schema.String,
  contentType: Schema.String,
})

export type InitiateUploadPayload = Schema.Schema.Type<typeof InitiateUploadPayload>

/**
 * Response from initiating an upload
 */
export const InitiateUploadResponse = Schema.Struct({
  imageId: Schema.Number,
  uploadUrl: Schema.String,
  publicUrl: Schema.String,
})

export type InitiateUploadResponse = Schema.Schema.Type<typeof InitiateUploadResponse>

/**
 * Payload for confirming an upload completed
 */
export const ConfirmUploadPayload = Schema.Struct({
  imageId: Schema.Number,
})

export type ConfirmUploadPayload = Schema.Schema.Type<typeof ConfirmUploadPayload>

/**
 * Payload for deleting an image
 */
export const DeleteImagePayload = Schema.Struct({
  imageId: Schema.Number,
})

export type DeleteImagePayload = Schema.Schema.Type<typeof DeleteImagePayload>

/**
 * Payload for reordering images
 */
export const ReorderImagesPayload = Schema.Struct({
  placeId: Schema.Number,
  imageOrder: Schema.Array(
    Schema.Struct({
      id: Schema.Number,
      order: Schema.Number,
    })
  ),
})

export type ReorderImagesPayload = Schema.Schema.Type<typeof ReorderImagesPayload>
