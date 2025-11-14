import { eq, MyRpcClient } from "@/lib/effect-query";
import { Effect } from "effect";
import type { CreatePlacePayload } from "@/server/schemas/place"

/**
 * Query options for fetching user's places
 */
export const getMyPlacesOptions = eq.queryOptions({
  queryKey: ["places", "my-places"],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.PlaceGetMyPlaces()
    }),
})

/**
 * Mutation options for creating a new place
 */
export const createPlaceOptions = eq.mutationOptions({
  mutationFn: (payload: CreatePlacePayload) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient

    return yield* rpcClient.PlaceCreate(payload)
  })
})


