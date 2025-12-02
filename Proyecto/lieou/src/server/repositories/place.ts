import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq, sql, inArray } from "drizzle-orm"
import { 
  place as placeTable, 
  place_image as placeImageTable, 
  place_tag as placeTagTable, 
  tag as tagTable 
} from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type {
  Place,
  CreatePlacePayload,
  UpdatePlacePayload,
} from "@/server/schemas/place"

// Helper type for raw place query result
type RawPlaceRow = {
  id: number
  business_id: number
  name: string
  description: string | null
  coord_x: number | null
  coord_y: number | null
  address: string | null
  created_at: Date | null
}

// Helper to build Place from raw row + images
function buildPlace(
  row: RawPlaceRow,
  images: Array<{ id: number; place_id: number; url: string }>
): Place {
  return {
    id: row.id,
    business_id: row.business_id,
    name: row.name,
    description: row.description,
    coordinates: row.coord_x !== null && row.coord_y !== null
      ? { x: row.coord_x, y: row.coord_y }
      : null,
    address: row.address,
    created_at: row.created_at,
    images
  }
}

export class PlaceRepository extends Effect.Service<PlaceRepository>()(
  "PlaceRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB

      return {
        create: (payload: CreatePlacePayload & { business_id: number }) => DBQuery((db) =>
          db.transaction(async (tx) => {
            
            const { images, tag, coordinates, ...placeData } = payload

            // Build insert values with PostGIS point if coordinates provided
            const insertValues = coordinates 
              ? {
                  ...placeData,
                  coordinates: sql`ST_SetSRID(ST_MakePoint(${coordinates.x}, ${coordinates.y}), 4326)`
                }
              : placeData

            const [place] = await tx.insert(placeTable).values(insertValues).returning()

            if (!place) throw new Error("Failed to create place")

            if (tag) {
              await tx.insert(tagTable)
                .values({ name: tag })
                .onConflictDoNothing({ target: tagTable.name });

              const [tagRecord] = await tx.select()
                .from(tagTable)
                .where(eq(tagTable.name, tag));

              if (tagRecord) {
                await tx.insert(placeTagTable).values({
                  place_id: place.id,
                  tag_id: tagRecord.id
                });
              }
            }

            
            if (!images || images.length === 0) {
              return { ...place, images: [] }
            }

            const insertedImages = await tx.insert(placeImageTable).values(
              images.map(url => ({ place_id: place.id, url }))
            ).returning()

            return { ...place, images: insertedImages }
          })
        ),

        
        /**
         * Find a place by ID with images
         * Uses raw SQL to properly extract PostGIS geometry coordinates
         */
        findById: (id: number) => DBQuery(async (db) => {
          const result = await db
            .select({
              id: placeTable.id,
              business_id: placeTable.business_id,
              name: placeTable.name,
              description: placeTable.description,
              coord_x: sql<number | null>`ST_X(${placeTable.coordinates})`,
              coord_y: sql<number | null>`ST_Y(${placeTable.coordinates})`,
              address: placeTable.address,
              created_at: placeTable.created_at,
            })
            .from(placeTable)
            .where(eq(placeTable.id, id))
            .limit(1)

          if (result.length === 0) {
            return null
          }

          const row = result[0]
          const images = await db
            .select()
            .from(placeImageTable)
            .where(eq(placeImageTable.place_id, id))
            .orderBy(placeImageTable.order)

          return buildPlace(row, images.map(img => ({ 
            id: img.id, 
            place_id: img.place_id, 
            url: img.url 
          })))
        }),

        /**
         * Find all places by business ID with images
         * Uses raw SQL to properly extract PostGIS geometry coordinates
         */
        findByBusinessId: (businessId: number) => DBQuery(async (db) => {
          const placesResult = await db
            .select({
              id: placeTable.id,
              business_id: placeTable.business_id,
              name: placeTable.name,
              description: placeTable.description,
              coord_x: sql<number | null>`ST_X(${placeTable.coordinates})`,
              coord_y: sql<number | null>`ST_Y(${placeTable.coordinates})`,
              address: placeTable.address,
              created_at: placeTable.created_at,
            })
            .from(placeTable)
            .where(eq(placeTable.business_id, businessId))

          if (placesResult.length === 0) {
            return []
          }

          const placeIds = placesResult.map(p => p.id)
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

          return placesResult.map(row => buildPlace(row, imagesByPlace[row.id] || []))
        }),

        update: (id: number, payload: UpdatePlacePayload) => DBQuery((db) =>
          db.transaction(async (tx) => {
            const { images, coordinates, ...placeData } = payload

            // Build update values with PostGIS point if coordinates provided
            const updateValues = coordinates !== undefined
              ? coordinates 
                ? {
                    ...placeData,
                    coordinates: sql`ST_SetSRID(ST_MakePoint(${coordinates.x}, ${coordinates.y}), 4326)`
                  }
                : { ...placeData, coordinates: null }
              : placeData

            // Update place data
            const [updatedPlace] = await tx
              .update(placeTable)
              .set(updateValues)
              .where(eq(placeTable.id, id))
              .returning()

            if (!updatedPlace) throw new Error("Failed to update place")

            // Handle images if provided
            if (images !== undefined) {
              // Delete existing images
              await tx
                .delete(placeImageTable)
                .where(eq(placeImageTable.place_id, id))

              // Insert new images if any
              if (images.length > 0) {
                await tx.insert(placeImageTable).values(
                  images.map(url => ({ place_id: id, url }))
                )
              }
            }

            // Fetch complete place with images using raw SQL for geometry
            const result = await tx
              .select({
                id: placeTable.id,
                business_id: placeTable.business_id,
                name: placeTable.name,
                description: placeTable.description,
                coord_x: sql<number | null>`ST_X(${placeTable.coordinates})`,
                coord_y: sql<number | null>`ST_Y(${placeTable.coordinates})`,
                address: placeTable.address,
                created_at: placeTable.created_at,
              })
              .from(placeTable)
              .where(eq(placeTable.id, id))
              .limit(1)

            if (result.length === 0) throw new Error("Failed to fetch updated place")

            const row = result[0]
            const placeImages = await tx
              .select()
              .from(placeImageTable)
              .where(eq(placeImageTable.place_id, id))
              .orderBy(placeImageTable.order)

            return buildPlace(row, placeImages.map(img => ({ 
              id: img.id, 
              place_id: img.place_id, 
              url: img.url 
            })))
          })
        ),

        delete: (id: number) => DBQuery((db) =>
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
      }
    }),
    dependencies: [DB.Default],
    accessors: true,
  }
) { }
