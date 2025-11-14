import { RpcMiddleware } from "@effect/rpc"

/**
 * RPC Logging middleware tag for tracking RPC requests and responses
 */
export class RpcLoggingMiddleware extends RpcMiddleware.Tag<RpcLoggingMiddleware>()(
  "RpcLoggingMiddleware",
  {
    wrap: true,
    requiredForClient: false
  }
) {}
