import { eq, MyRpcClient } from "@/lib/effect-query"
import { Effect } from "effect"

export const getPresignedUrlOptions = eq.mutationOptions({
  mutationFn: (payload: { filename: string; contentType: string }) => Effect.gen(function* () {
    const client = yield* MyRpcClient
    return yield* client.StorageGetPresignedUrl(payload)
  })
})

