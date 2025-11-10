// handlers.ts



import { Effect, Layer, Option } from "effect"
import { auth } from '@clerk/nextjs/server'




import { UserRpcs } from "./request"
import { AuthMiddleware } from "./middleware"
import { UserService } from "@/server/services/user"
import { User } from "@/server/schemas/user"




// ---------------------------------------------
// RPC handlers
// ---------------------------------------------

export const UsersLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const userService = yield* UserService

    return {
      UserList: () => userService.list(),
      UserById: ({ id }) => userService.byId(id),
      OnboardUser: (payload) => userService.onboard(payload)
    }
  })
).pipe(
  // Provide the UserRepository layer
  Layer.provide(UserService.Default)
)


// Implement the middleware for a server
export const AuthLive: Layer.Layer<AuthMiddleware> = Layer.succeed(
  AuthMiddleware,
  // A middleware that provides the current user.
  //
  // You can access the headers, payload, and the RPC definition when
  // implementing the middleware.
  AuthMiddleware.of(() => Effect.gen(function* () {
    const r = yield* Effect.promise(async () => await auth())

    return yield* Effect.if(r.isAuthenticated, {
      onTrue: () => Effect.succeed(

        {
          user: new User({ id: r.userId!, name: "kasdf" }),
          raw: r
        }

      ),
      onFalse: () => Effect.succeed(null)
    })

  })
  )
)

