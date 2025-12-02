import { eq, MyRpcClient } from "@/lib/effect-query"
import { Effect } from "effect"
import type { SwipeDirection } from "@/server/schemas/explorer"
import type { UpdateLocationPreferencePayload } from "@/server/schemas/user"

/**
 * Query options for fetching recommended places for explorers
 * Returns places within user's configured radius with distance
 */
export const getRecommendedPlacesOptions = eq.queryOptions({
  queryKey: ["explorer", "recommended"],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerGetRecommended()
    }),
})

/**
 * Query options for fetching user's saved places (right swipes)
 */
export const getSavedPlacesOptions = eq.queryOptions({
  queryKey: ["explorer", "saved"],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerGetSavedPlaces()
    }),
})

/**
 * Query options for fetching a single place by ID (read-only)
 */
export const getExplorerPlaceByIdOptions = (placeId: number) => eq.queryOptions({
  queryKey: ["explorer", "place", placeId],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerGetPlaceById({ id: placeId })
    }),
})

/**
 * Mutation options for recording a swipe action
 */
export const swipeOptions = eq.mutationOptions({
  mutationFn: (input: { place_id: number; direction: SwipeDirection }) =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerSwipe(input)
    }),
})

/**
 * Mutation options for unsaving a place (removing from saved)
 */
export const unsavePlaceOptions = eq.mutationOptions({
  mutationFn: (placeId: number) =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerUnsavePlace({ place_id: placeId })
    }),
})

/**
 * Query options for fetching user's location preference
 */
export const getLocationPreferenceOptions = eq.queryOptions({
  queryKey: ["explorer", "locationPreference"],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerGetLocationPreference()
    }),
})

/**
 * Mutation options for updating user's location preference
 */
export const updateLocationPreferenceOptions = eq.mutationOptions({
  mutationFn: (payload: UpdateLocationPreferencePayload) =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.ExplorerUpdateLocationPreference(payload)
    }),
})
