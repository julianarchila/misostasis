import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import { SwipePayloadSchema, SwipeSchema, SavedPlaceSchema } from "@/server/schemas/explorer"
import { PlaceWithDistanceSchema } from "@/server/schemas/place"
import { UserLocationPreferenceSchema, UpdateLocationPreferencePayloadSchema } from "@/server/schemas/user"
import { Unauthenticated, PlaceNotFound } from "@/server/schemas/error"

/**
 * RPC group for explorer-related operations
 * These operations are for users with the "explorer" role
 */
export class ExplorerRpcs extends RpcGroup.make(
  /**
   * Record a swipe action (left or right) on a place
   */
  Rpc.make("Swipe", {
    payload: SwipePayloadSchema,
    error: Schema.Union(Unauthenticated, PlaceNotFound),
    success: SwipeSchema
  }),

  /**
   * Get all places the current user has saved (swiped right on)
   */
  Rpc.make("GetSavedPlaces", {
    payload: Schema.Void,
    error: Unauthenticated,
    success: Schema.Array(SavedPlaceSchema)
  }),

  /**
   * Remove a saved place (unsave/unbookmark)
   */
  Rpc.make("UnsavePlace", {
    payload: Schema.Struct({ place_id: Schema.Number }),
    error: Unauthenticated,
    success: Schema.Boolean
  }),

  /**
   * Get recommended places for exploration with distance
   * Returns places within user's configured radius if location is set
   */
  Rpc.make("GetRecommended", {
    payload: Schema.Void,
    error: Unauthenticated,
    success: Schema.Array(PlaceWithDistanceSchema)
  }),

  /**
   * Get a single place by ID (read-only view)
   */
  Rpc.make("GetPlaceById", {
    payload: Schema.Struct({ id: Schema.Number }),
    error: Schema.Union(Unauthenticated, PlaceNotFound),
    success: PlaceWithDistanceSchema
  }),

  /**
   * Get user's location preference
   */
  Rpc.make("GetLocationPreference", {
    payload: Schema.Void,
    error: Unauthenticated,
    success: Schema.NullOr(UserLocationPreferenceSchema)
  }),

  /**
   * Update user's location preference
   */
  Rpc.make("UpdateLocationPreference", {
    payload: UpdateLocationPreferencePayloadSchema,
    error: Unauthenticated,
    success: UserLocationPreferenceSchema
  })
).prefix("Explorer").middleware(AuthMiddleware) { }
