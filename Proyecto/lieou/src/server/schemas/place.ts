import { Schema } from "effect"

// ============================================================================
// Primitives
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NullableString = Schema.NullOr(Schema.String)
const NullableDate = Schema.NullOr(Schema.Date)

// ============================================================================
// Shared Field Validations
// ============================================================================

/**
 * Place name validation - must be between 3 and 100 characters
 */
const PlaceNameValidation = Schema.String.pipe(
  Schema.minLength(3, { message: () => "Place name must be at least 3 characters" }),
  Schema.maxLength(100, { message: () => "Place name must be at most 100 characters" }),
  Schema.trimmed()
)

/**
 * Place description validation - optional, max 500 characters when present
 */
const PlaceDescriptionValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(500, { message: () => "Description must be at most 500 characters" })
  )
)

/**
 * Place location validation - optional, max 200 characters when present
 */
const PlaceLocationValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(200, { message: () => "Location must be at most 200 characters" })
  )
)

// ============================================================================
// Entity Schemas
// ============================================================================

export const PlaceImageSchema = Schema.Struct({
  id: Schema.Number,
  place_id: Schema.Number,
  url: Schema.String
})

/**
 * Complete Place entity schema (database representation)
 */
export const PlaceSchema = Schema.Struct({
  id: Schema.Number,
  business_id: Schema.Number,
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
  location: PlaceLocationValidation,
  created_at: NullableDate,
  images: Schema.optional(Schema.Array(PlaceImageSchema))
})

// ============================================================================
// Form Schemas (for TanStack Form)
// ============================================================================

/**
 * Form schema for creating a place
 * - All fields are present (nullable for optional fields)
 * - Compatible with TanStack Form's type inference
 */
export const CreatePlaceFormSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
  location: PlaceLocationValidation,
  images: Schema.optional(Schema.Array(Schema.String))
})

/**
 * Form schema for updating a place
 * - All fields are nullable (partial update)
 */
export const UpdatePlaceFormSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
  location: PlaceLocationValidation,
  images: Schema.optional(Schema.Array(Schema.String))
})

// ============================================================================
// API Payload Schemas (for RPC/HTTP endpoints)
// ============================================================================

/**
 * API payload for creating a place
 * - Optional fields can be omitted from the request
 */
export const CreatePlacePayloadSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: Schema.optional(PlaceDescriptionValidation),
  location: Schema.optional(PlaceLocationValidation),
  images: Schema.optional(Schema.Array(Schema.String))
})

/**
 * API payload for updating a place
 * - All fields are optional (partial update)
 */
export const UpdatePlacePayloadSchema = Schema.Struct({
  name: Schema.optional(PlaceNameValidation),
  description: Schema.optional(PlaceDescriptionValidation),
  location: Schema.optional(PlaceLocationValidation),
  images: Schema.optional(Schema.Array(Schema.String))
})

// ============================================================================
// Types
// ============================================================================

export type Place = Schema.Schema.Type<typeof PlaceSchema>
export type CreatePlaceFormValues = Schema.Schema.Type<typeof CreatePlaceFormSchema>
export type CreatePlacePayload = Schema.Schema.Type<typeof CreatePlacePayloadSchema>
export type UpdatePlaceFormValues = Schema.Schema.Type<typeof UpdatePlaceFormSchema>
export type UpdatePlacePayload = Schema.Schema.Type<typeof UpdatePlacePayloadSchema>


