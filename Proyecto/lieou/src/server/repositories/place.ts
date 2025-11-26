import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq } from "drizzle-orm"
import { place as placeTable, place_image as placeImageTable, place_tag as placeTagTable, tag as tagTable } from "@/server/db/schema"
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
            const { images, ...placeData } = payload
            const [place] = await tx.insert(placeTable).values(placeData).returning()

            if (!place) throw new Error("Failed to create place")

            if (!images || images.length === 0) {
              return { ...place, images: [] }
            }

            const insertedImages = await tx.insert(placeImageTable).values(
              images.map(url => ({ place_id: place.id, url }))
            ).returning()

            return { ...place, images: insertedImages }
          })
        )
        ,

        findById: (id: number) => DBQuery((db) =>
          db.query.place.findFirst({
            where: eq(placeTable.id, id),
            with: { 
              images: true,
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
              images: true,
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
            with: { images: true }
          })
        ).pipe(
          Effect.map(res => {
            if (!excludeBusinessId) return res
            return res.filter(p => p.business_id !== excludeBusinessId)
          })
        ),

        update: (id: number, payload: UpdatePlacePayload) => DBQuery((db) =>
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


