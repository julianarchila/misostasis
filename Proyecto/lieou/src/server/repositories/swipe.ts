import { Effect } from "effect"
import { eq, and, notExists, sql, inArray } from "drizzle-orm"
import { swipe as swipeTable, place as placeTable, place_image as placeImageTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type { SwipeDirection, SavedPlace, Swipe } from "@/server/schemas/explorer"
import type { Place, PlaceWithDistance } from "@/server/schemas/place"

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
          ),

        /**
         * Get recommended places for a user with distance calculation
         * Uses PostGIS to filter by radius and calculate distance
         */
        findRecommendedWithDistance: (
          userId: number,
          userLat: number,
          userLon: number,
          radiusKm: number
        ) =>
          DBQuery(async (db) => {
            // First get places within radius that user hasn't saved
            const placesResult = await db.execute(sql`
              SELECT 
                p.id,
                p.business_id,
                p.name,
                p.description,
                ST_X(p.coordinates) as coord_x,
                ST_Y(p.coordinates) as coord_y,
                p.address,
                p.created_at,
                ST_Distance(
                  p.coordinates::geography,
                  ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography
                ) / 1000 as distance_km
              FROM place p
              WHERE 
                p.coordinates IS NOT NULL
                AND ST_DWithin(
                  p.coordinates::geography,
                  ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography,
                  ${radiusKm * 1000}
                )
                AND NOT EXISTS (
                  SELECT 1 FROM swipe s 
                  WHERE s.place_id = p.id 
                  AND s.user_id = ${userId}
                  AND s.direction = 'right'
                )
              ORDER BY distance_km ASC
            `)

            // Get images for each place
            const placeIds = placesResult.rows.map((p: Record<string, unknown>) => p.id as number)
            
            if (placeIds.length === 0) {
              return [] as PlaceWithDistance[]
            }

            const imagesResult = await db
              .select()
              .from(placeImageTable)
              .where(inArray(placeImageTable.place_id, placeIds))
              .orderBy(placeImageTable.order)

            // Group images by place_id
            const imagesByPlace = imagesResult.reduce((acc, img) => {
              if (!acc[img.place_id]) acc[img.place_id] = []
              acc[img.place_id].push({ id: img.id, place_id: img.place_id, url: img.url })
              return acc
            }, {} as Record<number, Array<{ id: number; place_id: number; url: string }>>)

            // Combine places with their images
            return placesResult.rows.map((row: Record<string, unknown>) => ({
              id: row.id as number,
              business_id: row.business_id as number,
              name: row.name as string,
              description: row.description as string | null,
              coordinates: row.coord_x !== null && row.coord_y !== null 
                ? { x: row.coord_x as number, y: row.coord_y as number }
                : null,
              address: row.address as string | null,
              created_at: row.created_at ? new Date(row.created_at as string) : null,
              images: imagesByPlace[row.id as number] || [],
              distance_km: row.distance_km as number | null
            } satisfies PlaceWithDistance))
          })
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) { }
