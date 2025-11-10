// server.ts
import { HttpServer } from "@effect/platform"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer, Logger } from "effect"
import { AuthLive, UsersLive } from "@/server/rpc/handler"
import { UserRpcs } from "@/server/rpc/request"
import { NextRequest } from "next/server"

// Create a web handler for Next.js using Effect RPC
const { handler } = RpcServer.toWebHandler(UserRpcs, {
  layer: Layer.mergeAll(
    UsersLive,
    AuthLive,
    RpcSerialization.layerNdjson,
    HttpServer.layerContext,
    Logger.pretty
  )
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{}> }
) {
  return handler(request)
}
