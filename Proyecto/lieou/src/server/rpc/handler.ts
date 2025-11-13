// handlers.ts



import { Effect, Layer } from "effect"
import { auth } from '@clerk/nextjs/server'




import { PlaceRpcs, UserRpcs } from "./request"
import { AuthMiddleware } from "./middleware"
import { UserService } from "@/server/services/user"
import { PlaceService } from "@/server/services/place"
import { User } from "@/server/schemas/user"




// ---------------------------------------------
// RPC handlers
// ---------------------------------------------

export const UserLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const userService = yield* UserService

    return {
      UserOnboard: (payload) => userService.onboard(payload)
    }
  })
).pipe(
  // Provide the UserRepository layer
  Layer.provide(UserService.Default)
)



export const PlaceLive = PlaceRpcs.toLayer(Effect.gen(function* () {
  const placeService = yield* PlaceService

  return {
    PlaceCreate: (payload) => placeService.create(payload)
  }
})).pipe(Layer.provide(PlaceService.Default))


export const HandlersLive = Layer.mergeAll(UserLive, PlaceLive)




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

