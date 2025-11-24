import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq } from "drizzle-orm"
import { place as placeTable, place_image as placeImageTable, tag as tagTable, place_tag as placeTagTable } from "@/server/db/schema"
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
            const { images, tag, ...placeData } = payload as any
            const [place] = await tx.insert(placeTable).values(placeData).returning()

            if (!place) throw new Error("Failed to create place")

            let attachedTags: { id: number; name: string }[] = []

            // If a tag name was provided, ensure the tag exists and link it
            if (tag && typeof tag === "string" && tag.trim().length > 0) {
              const existing = await tx.query.tag.findFirst({ where: eq(tagTable.name, tag) })
              let tagId: number | undefined
              if (existing) {
                tagId = existing.id
                attachedTags = [{ id: existing.id, name: existing.name }]
              } else {
                const [insertedTag] = await tx.insert(tagTable).values({ name: tag }).returning()
                tagId = insertedTag?.id
                if (insertedTag) attachedTags = [{ id: insertedTag.id, name: insertedTag.name }]
              }

              if (tagId) {
                await tx.insert(placeTagTable).values({ place_id: place.id, tag_id: tagId })
              }
            }

            if (!images || images.length === 0) {
              return { ...place, images: [], tags: attachedTags }
            }

            const insertedImages = await tx.insert(placeImageTable).values(
              images.map((url: string) => ({ place_id: place.id, url }))
            ).returning()

            return { ...place, images: insertedImages, tags: attachedTags }
          })
        )
        ,

        findById: (id: number) => DBQuery(async (db) => {
          const place = await db.query.place.findFirst({ where: eq(placeTable.id, id), with: { images: true } })
          if (!place) return null

          // Fetch tags linked to this place
          const placeTags = await db.query.place_tag.findMany({ where: eq(placeTagTable.place_id, id) })
          const tags = [] as { id: number; name: string }[]
          for (const pt of placeTags) {
            if (pt.tag_id == null) continue
            const t = await db.query.tag.findFirst({ where: eq(tagTable.id, pt.tag_id) })
            if (t) tags.push({ id: t.id, name: t.name })
          }

          return { ...place, tags }
        }),

        findByBusinessId: (businessId: number) => DBQuery(async (db) => {
          const places = await db.query.place.findMany({ where: eq(placeTable.business_id, businessId), with: { images: true } })
          // Attach tags for each place
          const results = [] as any[]
          for (const p of places) {
            const placeTags = await db.query.place_tag.findMany({ where: eq(placeTagTable.place_id, p.id) })
            const tags = [] as { id: number; name: string }[]
            for (const pt of placeTags) {
              if (pt.tag_id == null) continue
              const t = await db.query.tag.findFirst({ where: eq(tagTable.id, pt.tag_id) })
              if (t) tags.push({ id: t.id, name: t.name })
            }
            results.push({ ...p, tags })
          }
          return results
        }),

        findRecommended: (excludeBusinessId?: number) => DBQuery(async (db) => {
          const places = await db.query.place.findMany({ with: { images: true } })
          const withTags = [] as any[]
          for (const p of places) {
            const placeTags = await db.query.place_tag.findMany({ where: eq(placeTagTable.place_id, p.id) })
            const tags = [] as { id: number; name: string }[]
            for (const pt of placeTags) {
              if (pt.tag_id == null) continue
              const t = await db.query.tag.findFirst({ where: eq(tagTable.id, pt.tag_id) })
              if (t) tags.push({ id: t.id, name: t.name })
            }
            withTags.push({ ...p, tags })
          }
          if (!excludeBusinessId) return withTags
          return withTags.filter(p => p.business_id !== excludeBusinessId)
        }),

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


