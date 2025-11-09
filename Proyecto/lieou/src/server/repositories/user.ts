
// handlers.ts
import { Effect, Layer, Ref } from "effect"
import { AuthMiddleware, CurrentUser } from "@/server/rpc/middleware"
import { User } from "@/server/schemas/user"

import { auth } from '@clerk/nextjs/server'

export class UserRepository extends Effect.Service<UserRepository>()(
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

