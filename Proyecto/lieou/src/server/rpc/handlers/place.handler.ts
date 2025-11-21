import { Effect, Layer } from "effect"
import { PlaceRpcs } from "@/server/rpc/groups/place.rpcs"
import { PlaceService } from "@/server/services/place"

/**
 * Place RPC handlers implementation
 */
export const PlaceHandlersLive = PlaceRpcs.toLayer(
  Effect.gen(function* () {
    const placeService = yield* PlaceService

    return {
      PlaceCreate: (payload) => placeService.create(payload),
      PlaceGetMyPlaces: () => placeService.getMyPlaces(),
      PlaceGetById: (payload) => placeService.getById(payload.id)
    }
  })
).pipe(
  Layer.provide(PlaceService.Default)
)
