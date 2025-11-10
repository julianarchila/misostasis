
// handlers.ts
import { Effect, Ref } from "effect"
import { User } from "@/server/schemas/user"
import * as EArray from "effect/Array"
import { user as userTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const ref = yield* Ref.make<Array<User>>([
        new User({ id: "1", name: "Alice" }),
        new User({ id: "2", name: "Bob" })
      ])
      const { DBQuery } = yield* DB


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
          fullName: string;
          role: string;
        }) => Effect.gen(function* () {

          yield* DBQuery((db) => db.insert(userTable).values({ ...payload }).returning())
            .pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.succeed(null),
              }),

            )

        })
      }
    }),
    dependencies: [DB.Default],
  }
) { }

