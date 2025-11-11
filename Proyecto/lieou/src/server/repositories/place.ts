import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq } from "drizzle-orm"
import { place as placeTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type {
  Place,
  CreatePlacePayload,
  UpdatePlacePayload,
} from "@/server/schemas/place"

export class PlaceRepository extends Effect.Service<PlaceRepository>()(
  "PlaceRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB

      return {
        create: (payload: CreatePlacePayload) =>
          Effect.gen(function* () {
            return yield* DBQuery((db) =>
              db.insert(placeTable).values(payload).returning()
            ).pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.die("Failed to create place"),
              }),
            )
          }),

        findById: (id: number) =>
          Effect.gen(function* () {
            return yield* DBQuery((db) =>
              db
                .select()
                .from(placeTable)
                .where(eq(placeTable.id, id))
            ).pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.succeed<Place | null>(null),
              }),
            )
          }),

        findByBusinessId: (businessId: number) =>
          Effect.gen(function* () {
            return yield* DBQuery((db) =>
              db
                .select()
                .from(placeTable)
                .where(eq(placeTable.business_id, businessId))
            )
          }),

        update: (id: number, payload: UpdatePlacePayload) =>
          Effect.gen(function* () {
            return yield* DBQuery((db) =>
              db
                .update(placeTable)
                .set(payload)
                .where(eq(placeTable.id, id))
                .returning()
            ).pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.die("Failed to update place"),
              }),
            )
          }),

        delete: (id: number) =>
          Effect.gen(function* () {
            return yield* DBQuery((db) =>
              db
                .delete(placeTable)
                .where(eq(placeTable.id, id))
                .returning()
            ).pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.succeed<Place | null>(null),
              }),
            )
          }),
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) { }


