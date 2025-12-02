import { Config, Effect } from "effect"
import { GeocodingError } from "@/server/schemas/error"
import type { Coordinates } from "@/server/schemas/place"

interface LocationIQResponse {
  display_name: string
  address: {
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}

export class GeocodingService extends Effect.Service<GeocodingService>()(
  "GeocodingService",
  {
    effect: Effect.gen(function* () {
      const apiKey = yield* Config.string("LOCATIONIQ_API_KEY")

      return {
        /**
         * Reverse geocode coordinates to a human-readable address
         * Returns a short format like "Bogotá, Colombia"
         */
        reverseGeocode: (coords: Coordinates) =>
          Effect.gen(function* () {
            const url = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${coords.y}&lon=${coords.x}&format=json&addressdetails=1`

            const response = yield* Effect.tryPromise({
              try: () => fetch(url),
              catch: () =>
                new GeocodingError({
                  message: "Failed to connect to LocationIQ",
                }),
            })

            if (!response.ok) {
              return yield* Effect.fail(
                new GeocodingError({
                  message: `LocationIQ returned status ${response.status}`,
                })
              )
            }

            const data: LocationIQResponse = yield* Effect.tryPromise({
              try: () => response.json(),
              catch: () =>
                new GeocodingError({
                  message: "Failed to parse LocationIQ response",
                }),
            })

            // Build address like "Chapinero, Bogotá, Colombia"
            const { suburb, neighbourhood, city, town, village, state, country } = data.address ?? {}
            const area = suburb || neighbourhood
            const locality = city || town || village || state

            const parts = [area, locality, country].filter(Boolean)

            return parts.length > 0
              ? parts.join(", ")
              : data.display_name
          }),
      }
    }),
    dependencies: [],
    accessors: true,
  }
) {}
