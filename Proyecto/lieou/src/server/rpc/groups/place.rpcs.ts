import { Rpc, RpcGroup } from "@effect/rpc"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import { CreatePlacePayloadSchema, PlaceSchema } from "@/server/schemas/place"
import { Unauthenticated } from "@/server/schemas/error"

/**
 * RPC group for place-related operations
 */
export class PlaceRpcs extends RpcGroup.make(
  Rpc.make("Create", {
    payload: CreatePlacePayloadSchema,
    error: Unauthenticated,
    success: PlaceSchema
  })
).prefix("Place").middleware(AuthMiddleware) { }
