import { eq, MyRpcClient } from "@/lib/effect-query";
import { Effect } from "effect";
import { type OnboardUserPayload } from "@/server/schemas/user"

export const onboardUserOptions = eq.mutationOptions({
  mutationFn: (payload: OnboardUserPayload) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient

    return yield* rpcClient.UserOnboard(payload)
  })
})