import { DB, makeQueryHelper } from "@/server/db/service"
import { drizzle as drizzle_pglite } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { Layer, Effect } from "effect"
import * as dbSchema from "@/server/db/schema"

export const DBTest = Layer.effect(
  DB,
  Effect.gen(function* () {
    yield* Effect.logInfo("Creating client")
    const client = yield* Effect.sync(() => {
      return drizzle_pglite({
        schema: dbSchema,
      })
    })
    yield* Effect.logInfo("Client created")
    yield* Effect.logInfo("Running migrations")

    yield* Effect.promise(() =>
      migrate(client, {
        migrationsSchema: "./src/server/db/schema.ts",
        migrationsFolder: "./src/server/db/migrations",
      }),
    )

    yield* Effect.logInfo("Completed migrations")

    return new DB({
      client: client as any,
      DBQuery: makeQueryHelper(client),
    })
  }),
)

