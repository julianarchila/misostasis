import { Config, Effect } from "effect"
import { drizzle as drizzle_pg, type NodePgClient } from "drizzle-orm/node-postgres"
import type { drizzle as drizzle_pglite } from "drizzle-orm/pglite"
import * as dbSchema from "./schema"
import type { PgliteClient } from "drizzle-orm/pglite"
import { DatabaseError } from "@/server/schemas/error"

type LiveDBClient = ReturnType<typeof drizzle_pg<typeof dbSchema, NodePgClient>>
type TestDBClient = ReturnType<typeof drizzle_pglite<typeof dbSchema, PgliteClient>>
type TDBClient = LiveDBClient | TestDBClient

type DBQueryCb<R> = (db: TDBClient) => Promise<R>

export class DB extends Effect.Service<DB>()("DB", {
  effect: Effect.gen(function* () {
    const shouldLog = yield* Config.boolean("DRIZZLE_LOG").pipe(
      Config.withDefault(false)
    )

    const databaseUrl = yield* Config.string("DATABASE_URL")

    const client = drizzle_pg({
      schema: dbSchema,
      connection: databaseUrl,
      logger: shouldLog ? {
        logQuery: (query, params) => {
          console.info("query:", query)
          console.info("params:", params)
        }
      } : undefined
    })

    const DBQuery = makeQueryHelper(client)

    return {
      client,
      DBQuery
    }
  }),
  dependencies: [],
}) { }

export const makeQueryHelper = (client: TDBClient) => {
  return <R>(cb: DBQueryCb<R>) =>
    Effect.gen(function* () {
      const res = yield* Effect.tryPromise({
        try: () => cb(client),
        catch: (err) => new DatabaseError({ cause: err, message: "Database query failed :(" }),
      }).pipe(
        Effect.catchTags({
          DatabaseError: Effect.die
        }),
      )

      return res
    })
}

