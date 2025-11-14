import { Effect, Layer } from "effect"
import { auth } from '@clerk/nextjs/server'
import { User } from "@/server/schemas/user"
import { AuthMiddleware } from "./auth"

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
