import { Effect, Layer } from "effect"
import { GeocodingRpcs } from "@/server/rpc/groups/geocoding.rpcs"
import { GeocodingService } from "@/server/services/geocoding"
import type { Coordinates } from "@/server/schemas/place"

export const GeocodingHandlersLive = GeocodingRpcs.toLayer(
  Effect.gen(function* () {
    const geocodingService = yield* GeocodingService

    return {
      GeocodingReverseGeocode: (coords: Coordinates) =>
        geocodingService.reverseGeocode(coords),
    }
  })
).pipe(Layer.provide(GeocodingService.Default))
