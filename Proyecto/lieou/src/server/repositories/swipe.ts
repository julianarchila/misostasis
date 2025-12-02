import { Effect, Array as Arr, pipe } from "effect"
import { eq, and, sql, desc, isNull, isNotNull, asc } from "drizzle-orm"
import { swipe as swipeTable, place as placeTable, place_image as placeImageTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type { SwipeDirection, SavedPlace, Swipe } from "@/server/schemas/explorer"
import type { Place, PlaceWithDistance } from "@/server/schemas/place"

type PlaceImage = { id: number; place_id: number; url: string }

type RowWithImage = { place_id: number; image_id: number | null; image_url: string | null }

/**
 * Aggregates flat JOIN rows into places with nested images array.
 * Used to transform the result of a place LEFT JOIN place_image query
 * into a structure where each place has an images[] array.
 * Preserves insertion order (first occurrence of each place_id).
 */
const aggregatePlacesWithImages = <T extends RowWithImage>(
  rows: ReadonlyArray<T>
): ReadonlyArray<{ row: T; images: PlaceImage[] }> =>
  pipe(
    rows,
    Arr.reduce(
      new Map<number, { row: T; images: PlaceImage[] }>(),
      (acc, row) => {
        if (!acc.has(row.place_id)) {
          acc.set(row.place_id, { row, images: [] })
        }
        if (row.image_id !== null && row.image_url !== null) {
          acc.get(row.place_id)!.images.push({
            id: row.image_id,
            place_id: row.place_id,
            url: row.image_url
          })
        }
        return acc
      }
    ),
    (map) => Array.from(map.values())
  )

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
         * Get all places the user swiped right on (saved places).
         * 
         * Uses a single query with:
         * - INNER JOIN place (to get place data)
         * - LEFT JOIN place_image (to get images)
         * - sql operator for PostGIS coordinate extraction (ST_X, ST_Y)
         * 
         * Results are aggregated in Effect-land to nest images under each place.
         */
        findSavedByUserId: (userId: number) =>
          DBQuery((db) =>
            db
              .select({
                swipe_id: swipeTable.id,
                saved_at: swipeTable.created_at,
                place_id: placeTable.id,
                business_id: placeTable.business_id,
                name: placeTable.name,
                description: placeTable.description,
                coord_x: sql<number | null>`ST_X(${placeTable.coordinates})`,
                coord_y: sql<number | null>`ST_Y(${placeTable.coordinates})`,
                address: placeTable.address,
                place_created_at: placeTable.created_at,
                image_id: placeImageTable.id,
                image_url: placeImageTable.url,
              })
              .from(swipeTable)
              .innerJoin(placeTable, eq(swipeTable.place_id, placeTable.id))
              .leftJoin(placeImageTable, eq(placeTable.id, placeImageTable.place_id))
              .where(and(
                eq(swipeTable.user_id, userId),
                eq(swipeTable.direction, "right")
              ))
              .orderBy(desc(swipeTable.created_at), asc(placeImageTable.order))
          ).pipe(
            Effect.map(aggregatePlacesWithImages),
            Effect.map(Arr.map(({ row, images }) => ({
              swipe_id: row.swipe_id,
              saved_at: row.saved_at,
              place: {
                id: row.place_id,
                business_id: row.business_id,
                name: row.name,
                description: row.description,
                coordinates: row.coord_x !== null && row.coord_y !== null
                  ? { x: row.coord_x, y: row.coord_y }
                  : null,
                address: row.address,
                created_at: row.place_created_at,
                images
              }
            } satisfies SavedPlace)))
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
         * Get recommended places for a user (excludes places they already swiped right on).
         * 
         * Uses a single query with:
         * - LEFT JOIN swipe with anti-pattern (WHERE swipe.id IS NULL) to exclude saved places
         * - LEFT JOIN place_image (to get images)
         * - sql operator for PostGIS coordinate extraction (ST_X, ST_Y)
         * 
         * Requires index on swipe(user_id, place_id, direction) for efficient anti-join.
         * Results are aggregated in Effect-land to nest images under each place.
         */
        findRecommendedForUser: (userId: number) =>
          DBQuery((db) =>
            db
              .select({
                place_id: placeTable.id,
                business_id: placeTable.business_id,
                name: placeTable.name,
                description: placeTable.description,
                coord_x: sql<number | null>`ST_X(${placeTable.coordinates})`,
                coord_y: sql<number | null>`ST_Y(${placeTable.coordinates})`,
                address: placeTable.address,
                created_at: placeTable.created_at,
                image_id: placeImageTable.id,
                image_url: placeImageTable.url,
              })
              .from(placeTable)
              .leftJoin(
                swipeTable,
                and(
                  eq(swipeTable.place_id, placeTable.id),
                  eq(swipeTable.user_id, userId),
                  eq(swipeTable.direction, "right")
                )
              )
              .leftJoin(placeImageTable, eq(placeTable.id, placeImageTable.place_id))
              .where(isNull(swipeTable.id))
              .orderBy(placeTable.id, asc(placeImageTable.order))
          ).pipe(
            Effect.map(aggregatePlacesWithImages),
            Effect.map(Arr.map(({ row, images }) => ({
              id: row.place_id,
              business_id: row.business_id,
              name: row.name,
              description: row.description,
              coordinates: row.coord_x !== null && row.coord_y !== null
                ? { x: row.coord_x, y: row.coord_y }
                : null,
              address: row.address,
              created_at: row.created_at,
              images
            } satisfies Place)))
          ),

        /**
         * Get recommended places for a user with distance calculation.
         * 
         * Uses a single query with:
         * - LEFT JOIN swipe with anti-pattern (WHERE swipe.id IS NULL) to exclude saved places
         * - LEFT JOIN place_image (to get images)
         * - sql operator for PostGIS functions:
         *   - ST_X, ST_Y for coordinate extraction
         *   - ST_DWithin for index-accelerated radius filtering
         *   - ST_Distance for distance calculation
         * 
         * Requires:
         * - GiST index on place.coordinates for efficient spatial queries
         * - Index on swipe(user_id, place_id, direction) for efficient anti-join
         * 
         * Results are ordered by distance and aggregated in Effect-land to nest images under each place.
         */
        findRecommendedWithDistance: (
          userId: number,
          userLat: number,
          userLon: number,
          radiusKm: number
        ) => {
          const userPoint = sql`ST_SetSRID(ST_MakePoint(${userLon}, ${userLat}), 4326)::geography`
          const distanceKm = sql<number>`ST_Distance(${placeTable.coordinates}::geography, ${userPoint}) / 1000`.as('distance_km')

          return DBQuery((db) =>
            db
              .select({
                place_id: placeTable.id,
                business_id: placeTable.business_id,
                name: placeTable.name,
                description: placeTable.description,
                coord_x: sql<number | null>`ST_X(${placeTable.coordinates})`,
                coord_y: sql<number | null>`ST_Y(${placeTable.coordinates})`,
                address: placeTable.address,
                created_at: placeTable.created_at,
                distance_km: distanceKm,
                image_id: placeImageTable.id,
                image_url: placeImageTable.url,
              })
              .from(placeTable)
              .leftJoin(
                swipeTable,
                and(
                  eq(swipeTable.place_id, placeTable.id),
                  eq(swipeTable.user_id, userId),
                  eq(swipeTable.direction, "right")
                )
              )
              .leftJoin(placeImageTable, eq(placeTable.id, placeImageTable.place_id))
              .where(
                and(
                  isNotNull(placeTable.coordinates),
                  sql`ST_DWithin(${placeTable.coordinates}::geography, ${userPoint}, ${radiusKm * 1000})`,
                  isNull(swipeTable.id)
                )
              )
              .orderBy(distanceKm, asc(placeImageTable.order))
          ).pipe(
            Effect.map(aggregatePlacesWithImages),
            Effect.map(Arr.map(({ row, images }) => ({
              id: row.place_id,
              business_id: row.business_id,
              name: row.name,
              description: row.description,
              coordinates: row.coord_x !== null && row.coord_y !== null
                ? { x: row.coord_x, y: row.coord_y }
                : null,
              address: row.address,
              created_at: row.created_at,
              images,
              distance_km: row.distance_km
            } satisfies PlaceWithDistance)))
          )
        }
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) { }
