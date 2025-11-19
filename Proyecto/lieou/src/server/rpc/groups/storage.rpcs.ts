import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import { Unauthenticated } from "@/server/schemas/error"

export const PresignedUrlResponse = Schema.Struct({
  uploadUrl: Schema.String,
  publicUrl: Schema.String,
  key: Schema.String
})

export class StorageRpcs extends RpcGroup.make(
  Rpc.make("GetPresignedUrl", {
    payload: Schema.Struct({
        filename: Schema.String,
        contentType: Schema.String
    }),
    error: Unauthenticated,
    success: PresignedUrlResponse
  })
).prefix("Storage").middleware(AuthMiddleware) { }
