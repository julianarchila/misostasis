import { Schema } from "effect"

// ============================================================================
// Primitives
// ============================================================================

const NullableDate = Schema.NullOr(Schema.Date)

// ============================================================================
// Coordinates Schema (for PostGIS geometry)
// ============================================================================

/**
 * Coordinates schema for PostGIS geometry (point mode: xy)
 * x = longitude, y = latitude
 */
export const CoordinatesSchema = Schema.Struct({
  x: Schema.Number, // longitude
  y: Schema.Number, // latitude
})

export type Coordinates = Schema.Schema.Type<typeof CoordinatesSchema>

const NullableCoordinates = Schema.NullOr(CoordinatesSchema)

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
 * Place address validation - optional human-readable address, max 200 characters
 */
const PlaceAddressValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(200, { message: () => "Address must be at most 200 characters" })
  )
)

const PlaceTagValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(50),
    Schema.trimmed()
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
  coordinates: NullableCoordinates,
  address: PlaceAddressValidation,
  created_at: NullableDate,
  images: Schema.optional(Schema.Array(PlaceImageSchema))
})

/**
 * Place with calculated distance (for proximity-based feed)
 */
export const PlaceWithDistanceSchema = Schema.Struct({
  id: Schema.Number,
  business_id: Schema.Number,
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
  coordinates: NullableCoordinates,
  address: PlaceAddressValidation,
  created_at: NullableDate,
  images: Schema.optional(Schema.Array(PlaceImageSchema)),
  distance_km: Schema.NullOr(Schema.Number)
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
  coordinates: NullableCoordinates,
  address: PlaceAddressValidation,
  tag: PlaceTagValidation,
  images: Schema.optional(Schema.Array(Schema.String))
})

/**
 * Form schema for updating a place
 * - All fields are nullable (partial update)
 */
export const UpdatePlaceFormSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
  coordinates: NullableCoordinates,
  address: PlaceAddressValidation,
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
  coordinates: Schema.optional(NullableCoordinates),
  address: Schema.optional(PlaceAddressValidation),
  tag: Schema.optional(PlaceTagValidation),
  images: Schema.optional(Schema.Array(Schema.String))
})

/**
 * API payload for updating a place
 * - All fields are optional (partial update)
 */
export const UpdatePlacePayloadSchema = Schema.Struct({
  name: Schema.optional(PlaceNameValidation),
  description: Schema.optional(PlaceDescriptionValidation),
  coordinates: Schema.optional(NullableCoordinates),
  address: Schema.optional(PlaceAddressValidation),
  images: Schema.optional(Schema.Array(Schema.String))
})

// ============================================================================
// Types
// ============================================================================

export type Place = Schema.Schema.Type<typeof PlaceSchema>
export type PlaceWithDistance = Schema.Schema.Type<typeof PlaceWithDistanceSchema>
export type CreatePlaceFormValues = Schema.Schema.Type<typeof CreatePlaceFormSchema>
export type CreatePlacePayload = Schema.Schema.Type<typeof CreatePlacePayloadSchema>
export type UpdatePlaceFormValues = Schema.Schema.Type<typeof UpdatePlaceFormSchema>
export type UpdatePlacePayload = Schema.Schema.Type<typeof UpdatePlacePayloadSchema>
