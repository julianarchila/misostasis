// handlers.ts
import { Effect, Layer, Ref } from "effect"
import { User, UserRpcs } from "./requests"
import { AuthMiddleware, CurrentUser } from "./rpc-middleware"

import { auth } from '@clerk/nextjs/server'


// ---------------------------------------------
// Imaginary Database
// ---------------------------------------------

class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const ref = yield* Ref.make<Array<User>>([
        new User({ id: "1", name: "Alice" }),
        new User({ id: "2", name: "Bob" })
      ])

      return {
        findMany: ref.get,
        findById: (id: string) =>
          Ref.get(ref).pipe(
            Effect.andThen((users) => {
              const user = users.find((user) => user.id === id)
              return user
                ? Effect.succeed(user)
                : Effect.fail(`User not found: ${id}`)
            })
          ),
        create: (name: string) =>
          Ref.updateAndGet(ref, (users) => [
            ...users,
            new User({ id: String(users.length + 1), name })
          ]).pipe(Effect.andThen((users) => users[users.length - 1]))
      }
    })
  }
) { }

// ---------------------------------------------
// RPC handlers
// ---------------------------------------------

export const UsersLive = UserRpcs.toLayer(
  Effect.gen(function* () {
    const db = yield* UserRepository

    return {
      UserList: () => Effect.gen(function* () {
        const currentUser = yield* CurrentUser
        yield* Effect.log(`Current User in UserList: ${currentUser}`)
        return yield* db.findMany
      }),
      UserById: ({ id }) => db.findById(id),
      UserCreate: ({ name }) => db.create(name)
    }
  })
).pipe(
  // Provide the UserRepository layer
  Layer.provide(UserRepository.Default)
)


// Implement the middleware for a server
export const AuthLive: Layer.Layer<AuthMiddleware> = Layer.succeed(
  AuthMiddleware,
  // A middleware that provides the current user.
  //
  // You can access the headers, payload, and the RPC definition when
  // implementing the middleware.
  AuthMiddleware.of(({ headers, payload, rpc }) => Effect.gen(function* () {
    const r = yield* Effect.promise(async () => await auth())
    yield* Effect.log(r)

    return yield* Effect.if(r.isAuthenticated, {
      onTrue: () => Effect.succeed(new User({ id: r.userId!, name: "Unknown" })),
      onFalse: () => Effect.succeed(new User({ id: "123", name: "Guest" }))
    })

  })
  )
)

