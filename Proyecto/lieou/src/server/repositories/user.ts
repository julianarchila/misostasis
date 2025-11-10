
// handlers.ts
import { Effect } from "effect"
import * as EArray from "effect/Array"
import { user as userTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB


      return {
        create: (payload: {
          clerk_id: string;
          email: string;
          fullName: string;
          role: string;
        }) => Effect.gen(function* () {

          return yield* DBQuery((db) => db.insert(userTable).values({ ...payload }).returning())
            .pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.die("Failed to create user"),
              }),
            )

        })
      }
    }),
    dependencies: [DB.Default],
    accessors: true
  }
) { }

