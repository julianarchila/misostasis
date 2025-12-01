import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import { CreatePlacePayloadSchema, PlaceSchema, UpdatePlacePayloadSchema } from "@/server/schemas/place"
import { Unauthenticated, PlaceNotFound } from "@/server/schemas/error"

/**
 * RPC group for place-related operations (business users)
 */
export class PlaceRpcs extends RpcGroup.make(
  Rpc.make("Create", {
    payload: CreatePlacePayloadSchema,
    error: Unauthenticated,
    success: PlaceSchema
  }),
  Rpc.make("GetMyPlaces", {
    payload: Schema.Void,
    error: Unauthenticated,
    success: Schema.Array(PlaceSchema)
  }),
  Rpc.make("GetById", {
    payload: Schema.Struct({ id: Schema.Number }),
    error: Schema.Union(Unauthenticated, PlaceNotFound),
    success: PlaceSchema
  }),
  Rpc.make("Update", {
    payload: Schema.Struct({
      id: Schema.Number,
      data: UpdatePlacePayloadSchema
    }),
    error: Schema.Union(Unauthenticated, PlaceNotFound),
    success: PlaceSchema
  }),
  Rpc.make("Delete", {
    payload: Schema.Struct({ id: Schema.Number }),
    error: Schema.Union(Unauthenticated, PlaceNotFound),
    success: Schema.Void
  })
).prefix("Place").middleware(AuthMiddleware) { }
