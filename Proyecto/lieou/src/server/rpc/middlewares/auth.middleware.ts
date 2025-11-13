import { RpcMiddleware } from "@effect/rpc"
import { Context, Effect, Layer } from "effect"
import type { Session } from "@/server/schemas/auth"
import { auth } from '@clerk/nextjs/server'
import { User } from "@/server/schemas/user"

// A context tag which represents the current user session
export class AuthSession extends Context.Tag("CurrentUser")<
  AuthSession,
  Session | null
>() { }

// The context tag for the authentication middleware
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    // This middleware will provide the current user context
    provides: AuthSession,
  }
) { }

// Implement the authentication middleware
export const AuthMiddlewareLive: Layer.Layer<AuthMiddleware> = Layer.succeed(
  AuthMiddleware,
  // A middleware that provides the current user.
  //
  // You can access the headers, payload, and the RPC definition when
  // implementing the middleware.
  AuthMiddleware.of(() => Effect.gen(function* () {
    const r = yield* Effect.promise(async () => await auth())

    return yield* Effect.if(r.isAuthenticated, {
      onTrue: () => Effect.succeed({
        user: new User({ id: r.userId!, name: "kasdf" }),
        raw: r
      }),
      onFalse: () => Effect.succeed(null)
    })
  }))
)
