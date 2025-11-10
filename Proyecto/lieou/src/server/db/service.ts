import { Effect, type Layer } from "effect"
import { drizzle as drizzle_pg, type NodePgClient } from "drizzle-orm/node-postgres"
import type { drizzle as drizzle_pglite } from "drizzle-orm/pglite"
import * as dbSchema from "./schema"
import type { PgliteClient } from "drizzle-orm/pglite"
import { DatabaseError } from "@/server/schemas/error"

type LiveDBClient = ReturnType<typeof drizzle_pg<typeof dbSchema, NodePgClient>>
type TestDBClient = ReturnType<typeof drizzle_pglite<typeof dbSchema, PgliteClient>>
type TDBClient = LiveDBClient | TestDBClient

let dbClient: TDBClient | undefined = undefined
type DBQueryCb<R> = (db: TDBClient) => Promise<R>

export class DB extends Effect.Service<DB>()("DB", {
  sync: () => {
    if (!dbClient) {
      console.info("No previous db connection, creating a new one")
      dbClient = drizzle_pg({
        schema: dbSchema,
        connection: process.env.DATABASE_URL!,
      })
    }

    const DBQuery = makeQueryHelper(dbClient)
    return { client: dbClient, DBQuery }
  },
}) { }

export const getDBClient = (dbService: Layer.Layer<DB, never, never> = DB.Default) => {
  const db = Effect.gen(function* () {
    const { client: db } = yield* DB

    return db
  }).pipe(Effect.provide(dbService), Effect.runSync)

  if (!db) {
    throw new Error("Failed to get DB client")
  }
  return db
}

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

