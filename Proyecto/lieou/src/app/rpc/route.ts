// server.ts
import { HttpServer } from "@effect/platform"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer } from "effect"
import { AuthLive, UsersLive } from "@/server/rpc/handler"
import { UserRpcs } from "@/server/rpc/request"

// Create a web handler for Next.js using Effect RPC
const { handler } = RpcServer.toWebHandler(UserRpcs, {
  layer: Layer.mergeAll(
    UsersLive,
    AuthLive,
    RpcSerialization.layerNdjson,
    HttpServer.layerContext
  )
})

export const POST = handler
