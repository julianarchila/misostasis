
// handlers.ts
import { Effect } from "effect"
import * as EArray from "effect/Array"
import { eq, sql } from "drizzle-orm"
import { user as userTable, user_location_preference as locationPrefTable } from "@/server/db/schema"
import { DB } from "@/server/db/service"
import type { UpdateLocationPreferencePayload } from "@/server/schemas/user"

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const { DBQuery } = yield* DB


      return {
        create: (payload: {
          clerk_id: string;
          email: string;
          fullName: string;
          role: string;
        }) => Effect.gen(function* () {

          return yield* DBQuery((db) => db.insert(userTable).values({ ...payload }).returning())
            .pipe(
              Effect.flatMap(EArray.head),
              Effect.catchTags({
                NoSuchElementException: () => Effect.die("Failed to create user"),
              }),
            )

        }),

        findByClerkId: (clerkId: string) => Effect.gen(function* () {
          return yield* DBQuery((db) =>
            db.select().from(userTable).where(eq(userTable.clerk_id, clerkId))
          ).pipe(
            Effect.flatMap(EArray.head),
            Effect.catchTags({
              NoSuchElementException: () => Effect.succeed(null),
            }),
          )
        }),

        /**
         * Get user's location preferences
         */
        getLocationPreference: (userId: number) => DBQuery((db) =>
          db.select().from(locationPrefTable)
            .where(eq(locationPrefTable.user_id, userId))
        ).pipe(
          Effect.flatMap(EArray.head),
          Effect.catchTags({
            NoSuchElementException: () => Effect.succeed(null),
          })
        ),

        /**
         * Update or create user's location preferences
         */
        upsertLocationPreference: (userId: number, payload: UpdateLocationPreferencePayload) =>
          DBQuery((db) =>
            db.insert(locationPrefTable)
              .values({
                user_id: userId,
                coordinates: sql`ST_SetSRID(ST_MakePoint(${payload.coordinates.x}, ${payload.coordinates.y}), 4326)`,
                search_radius_km: payload.search_radius_km ?? 5,
                updated_at: new Date()
              })
              .onConflictDoUpdate({
                target: locationPrefTable.user_id,
                set: {
                  coordinates: sql`ST_SetSRID(ST_MakePoint(${payload.coordinates.x}, ${payload.coordinates.y}), 4326)`,
                  search_radius_km: payload.search_radius_km ?? sql`${locationPrefTable.search_radius_km}`,
                  updated_at: new Date()
                }
              })
              .returning()
          ).pipe(
            Effect.flatMap(EArray.head),
            Effect.catchTags({
              NoSuchElementException: () => Effect.die("Failed to update location preference"),
            })
          )
      }
    }),
    dependencies: [DB.Default],
    accessors: true
  }
) { }

