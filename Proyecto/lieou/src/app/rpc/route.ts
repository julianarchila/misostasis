// server.ts
import { HttpServer } from "@effect/platform"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer, Logger } from "effect"
import { AuthLive, HandlersLive} from "@/server/rpc/handler"
import { AppRpcs } from "@/server/rpc/request"
import { NextRequest } from "next/server"

// Create a web handler for Next.js using Effect RPC
const { handler } = RpcServer.toWebHandler(AppRpcs, {
  layer: Layer.mergeAll(
    HandlersLive,
    AuthLive,
    RpcSerialization.layerNdjson,
    HttpServer.layerContext,
    Logger.pretty
  )
})

export async function POST(
  request: NextRequest
) {
  return handler(request)
}
