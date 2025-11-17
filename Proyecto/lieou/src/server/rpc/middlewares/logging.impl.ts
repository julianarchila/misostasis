import { Effect, Layer } from "effect"
import { RpcLoggingMiddleware } from "./logging"

/**
 * RPC Logging middleware implementation
 * Logs RPC request details including method name, duration, and success/failure status
 */
export const RpcLoggingMiddlewareLive: Layer.Layer<RpcLoggingMiddleware> = Layer.succeed(
  RpcLoggingMiddleware,
  RpcLoggingMiddleware.of(({ rpc, next }) => {
    const startTime = Date.now()

    return next.pipe(
      Effect.tap(() => Effect.gen(function* () {
        const duration = Date.now() - startTime
        yield* Effect.log(`[RPC] ✓ ${rpc._tag} (${duration}ms)`)
      })),
       Effect.tapError((error) => Effect.gen(function* () {
         const duration = Date.now() - startTime
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         yield* Effect.logError(`[RPC] ✗ ${rpc._tag} x ${(error as any)?._tag ?? "internal error"} (${duration}ms)`)
       }))
    )
  })
)

