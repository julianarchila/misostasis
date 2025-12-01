import { Schema } from "effect"
import { PlaceSchema } from "./place"

// ============================================================================
// Swipe Direction
// ============================================================================

export const SwipeDirection = Schema.Literal("left", "right")
export type SwipeDirection = Schema.Schema.Type<typeof SwipeDirection>

// ============================================================================
// Swipe Schemas
// ============================================================================

/**
 * Payload for recording a swipe action
 */
export const SwipePayloadSchema = Schema.Struct({
  place_id: Schema.Number,
  direction: SwipeDirection
})

export type SwipePayload = Schema.Schema.Type<typeof SwipePayloadSchema>

/**
 * Swipe entity schema (database representation)
 */
export const SwipeSchema = Schema.Struct({
  id: Schema.Number,
  user_id: Schema.Number,
  place_id: Schema.Number,
  direction: SwipeDirection,
  created_at: Schema.NullOr(Schema.Date)
})

export type Swipe = Schema.Schema.Type<typeof SwipeSchema>

// ============================================================================
// Saved Place (swipe right with place details)
// ============================================================================

/**
 * A saved place is a right-swiped place with full place details
 */
export const SavedPlaceSchema = Schema.Struct({
  swipe_id: Schema.Number,
  saved_at: Schema.NullOr(Schema.Date),
  place: PlaceSchema
})

export type SavedPlace = Schema.Schema.Type<typeof SavedPlaceSchema>
