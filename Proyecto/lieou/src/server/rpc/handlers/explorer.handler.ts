import { Effect, Layer } from "effect"
import { ExplorerRpcs } from "@/server/rpc/groups/explorer.rpcs"
import { ExplorerService } from "@/server/services/explorer"

/**
 * Explorer RPC handlers implementation
 */
export const ExplorerHandlersLive = ExplorerRpcs.toLayer(
  Effect.gen(function* () {
    const explorerService = yield* ExplorerService

    return {
      ExplorerSwipe: (payload) => explorerService.swipe(payload),
      ExplorerGetSavedPlaces: () => explorerService.getSavedPlaces(),
      ExplorerUnsavePlace: (payload) => explorerService.unsavePlace(payload.place_id),
      ExplorerGetRecommended: () => explorerService.getRecommended(),
      ExplorerGetPlaceById: (payload) => explorerService.getPlaceById(payload.id).pipe(
        Effect.map(place => ({ ...place, distance_km: null }))
      ),
      ExplorerGetLocationPreference: () => explorerService.getLocationPreference(),
      ExplorerUpdateLocationPreference: (payload) => explorerService.updateLocationPreference(payload)
    }
  })
).pipe(
  Layer.provide(ExplorerService.Default)
)
