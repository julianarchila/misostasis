import { Effect } from "effect"
import { eq, and, notExists } from "drizzle-orm"
import { swipe as swipeTable, place as placeTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type { SwipeDirection, SavedPlace, Swipe } from "@/server/schemas/explorer"
import type { Place } from "@/server/schemas/place"

export class SwipeRepository extends Effect.Service<SwipeRepository>()(
  "SwipeRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB

      return {
        /**
         * Record a swipe action (upsert - updates direction if already exists)
         */
        upsert: (payload: { user_id: number; place_id: number; direction: SwipeDirection }) =>
          DBQuery((db) =>
            db.insert(swipeTable)
              .values(payload)
              .onConflictDoUpdate({
                target: [swipeTable.user_id, swipeTable.place_id],
                set: { direction: payload.direction }
              })
              .returning()
          ).pipe(
            Effect.map(rows => {
              const row = rows[0]!
              return {
                ...row,
                direction: row.direction as SwipeDirection
              } satisfies Swipe
            })
          ),

        /**
         * Get all places the user swiped right on (saved places)
         */
        findSavedByUserId: (userId: number) =>
          DBQuery((db) =>
            db.query.swipe.findMany({
              where: and(
                eq(swipeTable.user_id, userId),
                eq(swipeTable.direction, "right")
              ),
              orderBy: (swipe, { desc }) => [desc(swipe.created_at)],
              with: {
                place: {
                  with: {
                    images: {
                      orderBy: (images, { asc }) => [asc(images.order)]
                    }
                  }
                }
              }
            })
          ).pipe(
            Effect.map(swipes =>
              swipes
                .filter(swipe => swipe.place !== null)
                .map(swipe => ({
                  swipe_id: swipe.id,
                  saved_at: swipe.created_at,
                  place: swipe.place as Place
                } satisfies SavedPlace))
            )
          ),

        /**
         * Get all place IDs the user has swiped right on
         */
        findSavedPlaceIdsByUserId: (userId: number) =>
          DBQuery((db) =>
            db.select({ place_id: swipeTable.place_id })
              .from(swipeTable)
              .where(and(
                eq(swipeTable.user_id, userId),
                eq(swipeTable.direction, "right")
              ))
          ).pipe(
            Effect.map(rows => rows.map(r => r.place_id))
          ),

        /**
         * Remove a swipe (unsave a place)
         */
        delete: (userId: number, placeId: number) =>
          DBQuery((db) =>
            db.delete(swipeTable)
              .where(and(
                eq(swipeTable.user_id, userId),
                eq(swipeTable.place_id, placeId)
              ))
              .returning()
          ).pipe(
            Effect.map(rows => rows.length > 0)
          ),

        /**
         * Get recommended places for a user (excludes places they already swiped right on)
         */
        findRecommendedForUser: (userId: number) =>
          DBQuery((db) =>
            db.query.place.findMany({
              where: notExists(
                db.select()
                  .from(swipeTable)
                  .where(and(
                    eq(swipeTable.place_id, placeTable.id),
                    eq(swipeTable.user_id, userId),
                    eq(swipeTable.direction, "right")
                  ))
              ),
              with: {
                images: {
                  orderBy: (images, { asc }) => [asc(images.order)]
                }
              }
            })
          ).pipe(
            Effect.map(places => places satisfies Place[])
          )
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) { }
