import { Rpc, RpcGroup } from "@effect/rpc"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import { OnboardUserPayload } from "@/server/schemas/user"
import { Unauthenticated } from "@/server/schemas/error"

/**
 * RPC group for user-related operations
 */
export class UserRpcs extends RpcGroup.make(
  Rpc.make("Onboard", {
    payload: OnboardUserPayload,
    error: Unauthenticated
  })
).prefix("User").middleware(AuthMiddleware) { }
