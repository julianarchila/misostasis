
// handlers.ts
import { Effect, Ref } from "effect"
import { OnboardUserPayload, User } from "@/server/schemas/user"
import { getDb } from "@/server/db"
import { user as userTable } from "@/server/db/schema"
import { DatabaseError } from "@/server/schemas/error"

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const ref = yield* Ref.make<Array<User>>([
        new User({ id: "1", name: "Alice" }),
        new User({ id: "2", name: "Bob" })
      ])

      const db = getDb()

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
        create: (payload: {
          clerk_id: string;
          email: string;
          role: string;
        }) => Effect.gen(function* () {

          const res = yield* Effect.tryPromise({
            try: () => db.insert(userTable).values({
              ...payload
            }),
            catch: (e) => new DatabaseError
          })

        })
      }
    })
  }
) { }

