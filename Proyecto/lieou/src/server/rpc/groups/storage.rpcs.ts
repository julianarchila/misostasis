import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { AuthMiddleware } from "@/server/rpc/middlewares/auth"
import { Unauthenticated } from "@/server/schemas/error"

export const UploadImageResponse = Schema.Struct({
  publicUrl: Schema.String,
  key: Schema.String
})

export class StorageRpcs extends RpcGroup.make(
  Rpc.make("UploadImage", {
    payload: Schema.Struct({
        filename: Schema.String,
        contentType: Schema.String,
        data: Schema.String // base64 encoded file data
    }),
    error: Unauthenticated,
    success: UploadImageResponse
  })
).prefix("Storage").middleware(AuthMiddleware) { }
