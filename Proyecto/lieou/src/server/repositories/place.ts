import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq, sql } from "drizzle-orm"
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

        
        findById: (id: number) => DBQuery((db) =>
          db.query.place.findFirst({
            where: eq(placeTable.id, id),
            with: { 
              images: {
                orderBy: (images, { asc }) => [asc(images.order)]
              },
              tags: {
                with: {
                  tag: true
                }
              }
            } 
          })
        ).pipe(
          Effect.map(res => res ?? null)
        ),

        findByBusinessId: (businessId: number) => DBQuery((db) =>
          db.query.place.findMany({
            where: eq(placeTable.business_id, businessId),
            with: { 
              images: {
                orderBy: (images, { asc }) => [asc(images.order)]
              },
              tags: {
                with: {
                  tag: true
                }
              }
            } 
          })
        ),

        findRecommended: (excludeBusinessId?: number) => DBQuery((db) =>
          db.query.place.findMany({
            with: { 
              images: {
                orderBy: (images, { asc }) => [asc(images.order)]
              }
            }
          })
        ).pipe(
          Effect.map(res => {
            if (!excludeBusinessId) return res
            return res.filter(p => p.business_id !== excludeBusinessId)
          })
        ),

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

            // Fetch complete place with images
            const place = await tx.query.place.findFirst({
              where: eq(placeTable.id, id),
              with: { 
                images: {
                  orderBy: (images, { asc }) => [asc(images.order)]
                },
                tags: {
                  with: {
                    tag: true
                  }
                }
              }
            })

            if (!place) throw new Error("Failed to fetch updated place")

            return place
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
