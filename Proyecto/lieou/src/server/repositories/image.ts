import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq, and, inArray, lt, sql, asc } from "drizzle-orm"
import { place_image as imageTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type { PlaceImage } from "@/server/schemas/image"

export class ImageRepository extends Effect.Service<ImageRepository>()(
  "ImageRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB

      return {
        /**
         * Create a pending image record (before upload)
         */
        createPending: (placeId: number, url: string, storageKey: string) =>
          DBQuery((db) =>
            db.insert(imageTable)
              .values({
                place_id: placeId,
                url,
                storage_key: storageKey,
                status: "pending",
                order: 999, // Will be set properly on confirm
              })
              .returning()
          ).pipe(
            Effect.flatMap(EArray.head),
            Effect.orDie
          ),

        /**
         * Confirm upload completed
         */
        confirm: (imageId: number, order: number) =>
          DBQuery((db) =>
            db.update(imageTable)
              .set({ status: "confirmed", order })
              .where(eq(imageTable.id, imageId))
              .returning()
          ).pipe(
            Effect.flatMap(EArray.head),
            Effect.catchTag("NoSuchElementException", () => Effect.succeed(null))
          ),

        /**
         * Find image by ID
         */
        findById: (imageId: number) =>
          DBQuery((db) =>
            db.select()
              .from(imageTable)
              .where(eq(imageTable.id, imageId))
              .limit(1)
          ).pipe(
            Effect.flatMap(EArray.head),
            Effect.catchTag("NoSuchElementException", () => Effect.succeed(null))
          ),

        /**
         * Find confirmed images for a place (ordered)
         */
        findByPlaceId: (placeId: number) =>
          DBQuery((db) =>
            db.select()
              .from(imageTable)
              .where(
                and(
                  eq(imageTable.place_id, placeId),
                  eq(imageTable.status, "confirmed")
                )
              )
              .orderBy(asc(imageTable.order))
          ),

        /**
         * Delete an image by ID
         */
        delete: (imageId: number) =>
          DBQuery((db) =>
            db.delete(imageTable)
              .where(eq(imageTable.id, imageId))
              .returning()
          ).pipe(
            Effect.flatMap(EArray.head),
            Effect.catchTag("NoSuchElementException", () => Effect.succeed(null))
          ),

        /**
         * Bulk reorder images for a place
         */
        reorder: (placeId: number, imageOrder: Array<{ id: number; order: number }>) =>
          DBQuery((db) =>
            db.transaction(async (tx) => {
              for (const { id, order } of imageOrder) {
                await tx.update(imageTable)
                  .set({ order })
                  .where(
                    and(
                      eq(imageTable.id, id),
                      eq(imageTable.place_id, placeId)
                    )
                  )
              }

              return tx.select()
                .from(imageTable)
                .where(
                  and(
                    eq(imageTable.place_id, placeId),
                    eq(imageTable.status, "confirmed")
                  )
                )
                .orderBy(asc(imageTable.order))
            })
          ),

        /**
         * Find stale pending uploads (for cleanup job)
         */
        findStalePending: (olderThan: Date) =>
          DBQuery((db) =>
            db.select()
              .from(imageTable)
              .where(
                and(
                  eq(imageTable.status, "pending"),
                  lt(imageTable.created_at, olderThan)
                )
              )
          ),

        /**
         * Delete multiple images by IDs
         */
        deleteMany: (ids: number[]) =>
          DBQuery((db) =>
            db.delete(imageTable)
              .where(inArray(imageTable.id, ids))
              .returning()
          ),

        /**
         * Get next order number for a place
         */
        getNextOrder: (placeId: number) =>
          DBQuery((db) =>
            db.select({ maxOrder: sql<number>`COALESCE(MAX(${imageTable.order}), -1)` })
              .from(imageTable)
              .where(
                and(
                  eq(imageTable.place_id, placeId),
                  eq(imageTable.status, "confirmed")
                )
              )
          ).pipe(
            Effect.map((rows) => (rows[0]?.maxOrder ?? -1) + 1)
          ),
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) {}
