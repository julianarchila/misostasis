import { HttpServer } from "@effect/platform"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer, Logger } from "effect"
import { AppRpcs } from "@/server/rpc/groups"
import { HandlersLive } from "@/server/rpc/handlers"
import { AuthMiddlewareLive } from "@/server/rpc/middlewares/auth.impl"

/**
 * RPC Server configuration with all layers merged
 */
const serverLayer = Layer.mergeAll(
  HandlersLive,
  AuthMiddlewareLive,
  RpcSerialization.layerNdjson,
  HttpServer.layerContext,
  Logger.pretty
)

/**
 * Web handler for Next.js using Effect RPC
 */
export const { handler } = RpcServer.toWebHandler(AppRpcs, {
  layer: serverLayer 
})
