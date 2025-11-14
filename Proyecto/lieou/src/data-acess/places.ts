import { eq, MyRpcClient } from "@/lib/effect-query";
import { Effect } from "effect";
import { type CreatePlacePayload } from "@/server/schemas/place"

export const createPlaceOptions = eq.mutationOptions({
  mutationFn: (payload: CreatePlacePayload) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient

    return yield* rpcClient.PlaceCreate(payload)
  })
})
