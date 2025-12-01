import { Effect } from "effect"
import { eq, and, ne } from "drizzle-orm"
import { 
  swipe as swipeTable, 
  place as placeTable,
  place_image as placeImageTable
} from "@/server/db/schema"
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
          DBQuery(async (db) => {
            const swipes = await db.query.swipe.findMany({
              where: and(
                eq(swipeTable.user_id, userId),
                eq(swipeTable.direction, "right")
              ),
              orderBy: (swipe, { desc }) => [desc(swipe.created_at)]
            })

            // Fetch places with images for each swipe
            const savedPlaces: SavedPlace[] = []
            for (const swipe of swipes) {
              const place = await db.query.place.findFirst({
                where: eq(placeTable.id, swipe.place_id),
                with: {
                  images: {
                    orderBy: (images, { asc }) => [asc(images.order)]
                  }
                }
              })
              if (place) {
                savedPlaces.push({
                  swipe_id: swipe.id,
                  saved_at: swipe.created_at,
                  place: place as Place
                })
              }
            }

            return savedPlaces
          }),

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
         * Get recommended places for a user (excludes places they created and already swiped right on)
         */
        findRecommendedForUser: (userId: number, excludeBusinessId?: number) =>
          DBQuery(async (db) => {
            // Get place IDs the user already swiped right on
            const savedSwipes = await db.select({ place_id: swipeTable.place_id })
              .from(swipeTable)
              .where(and(
                eq(swipeTable.user_id, userId),
                eq(swipeTable.direction, "right")
              ))
            const savedPlaceIds = new Set(savedSwipes.map(s => s.place_id))

            // Get all places with images
            const allPlaces = await db.query.place.findMany({
              with: {
                images: {
                  orderBy: (images, { asc }) => [asc(images.order)]
                }
              }
            })

            // Filter out saved places and optionally the user's own places
            return allPlaces.filter(p => {
              if (savedPlaceIds.has(p.id)) return false
              if (excludeBusinessId && p.business_id === excludeBusinessId) return false
              return true
            }) as Place[]
          })
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) { }
