import { eq, MyRpcClient } from "@/lib/effect-query"
import { Effect } from "effect"

export const uploadImageOptions = eq.mutationOptions({
  mutationFn: (payload: { filename: string; contentType: string; data: string }) => Effect.gen(function* () {
    const client = yield* MyRpcClient
    return yield* client.StorageUploadImage(payload)
  })
})
