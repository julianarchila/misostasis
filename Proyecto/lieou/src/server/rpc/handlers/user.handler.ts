import { Effect, Layer } from "effect"
import { UserRpcs } from "@/server/rpc/groups/user.rpcs"
import { UserService } from "@/server/services/user"

/**
 * User RPC handlers implementation
 */
export const UserHandlersLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const userService = yield* UserService

    return {
      UserOnboard: (payload) => userService.onboard(payload)
    }
  })
).pipe(
  Layer.provide(UserService.Default)
)
