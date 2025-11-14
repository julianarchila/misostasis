import { RpcMiddleware } from "@effect/rpc"
import { Context } from "effect"
import type { Session } from "@/server/schemas/auth"

// A context tag which represents the current user session
export class AuthSession extends Context.Tag("CurrentUser")<
  AuthSession,
  Session | null
>() { }

// The context tag for the authentication middleware (definition only)
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    // This middleware will provide the current user context
    provides: AuthSession,
  }
) { }
