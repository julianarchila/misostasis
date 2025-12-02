import { Effect } from "effect"
import { SwipeRepository } from "@/server/repositories/swipe"
import { UserRepository } from "@/server/repositories/user"
import { PlaceRepository } from "@/server/repositories/place"
import { explorerRequired } from "@/server/utils/roles"
import { Unauthenticated, PlaceNotFound } from "@/server/schemas/error"
import type { SwipePayload } from "@/server/schemas/explorer"
import type { PlaceWithDistance } from "@/server/schemas/place"
import type { UpdateLocationPreferencePayload, UserLocationPreference } from "@/server/schemas/user"

export class ExplorerService extends Effect.Service<ExplorerService>()(
  "ExplorerService",
  {
    effect: Effect.gen(function* () {
      const swipeRepo = yield* SwipeRepository
      const userRepo = yield* UserRepository
      const placeRepo = yield* PlaceRepository

      return {
        /**
         * Record a swipe action (left or right)
         */
        swipe: (payload: SwipePayload) => Effect.gen(function* () {
          const session = yield* explorerRequired

          // Get the database user ID from the Clerk user ID
          const dbUser = yield* userRepo.findByClerkId(session.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          // Verify the place exists
          const place = yield* placeRepo.findById(payload.place_id)
          if (!place) {
            return yield* Effect.fail(new PlaceNotFound({ placeId: payload.place_id }))
          }

          return yield* swipeRepo.upsert({
            user_id: dbUser.id,
            place_id: payload.place_id,
            direction: payload.direction
          })
        }),

        /**
         * Get all places the current user has saved (swiped right on)
         */
        getSavedPlaces: () => Effect.gen(function* () {
          const session = yield* explorerRequired

          const dbUser = yield* userRepo.findByClerkId(session.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          return yield* swipeRepo.findSavedByUserId(dbUser.id)
        }),

        /**
         * Remove a saved place (delete the swipe)
         */
        unsavePlace: (placeId: number) => Effect.gen(function* () {
          const session = yield* explorerRequired

          const dbUser = yield* userRepo.findByClerkId(session.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          return yield* swipeRepo.delete(dbUser.id, placeId)
        }),

        /**
         * Get recommended places for the current user
         * Uses location-based filtering if user has set their location preferences
         * Falls back to all recommendations without distance if no location set
         */
        getRecommended: () => Effect.gen(function* () {
          const session = yield* explorerRequired

          const dbUser = yield* userRepo.findByClerkId(session.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          // Get user's location preference
          const locationPref = yield* userRepo.getLocationPreference(dbUser.id)

          // If user has location set, use proximity-based recommendations
          if (locationPref?.coordinates) {
            const { x: lon, y: lat } = locationPref.coordinates
            const radiusKm = locationPref.search_radius_km

            return yield* swipeRepo.findRecommendedWithDistance(
              dbUser.id,
              lat,
              lon,
              radiusKm
            )
          }

          // Fallback: return all recommendations without distance
          const places = yield* swipeRepo.findRecommendedForUser(dbUser.id)
          return places.map(p => ({ ...p, distance_km: null })) as PlaceWithDistance[]
        }),

        /**
         * Get a single place by ID (read-only view for explorers)
         */
        getPlaceById: (placeId: number) => Effect.gen(function* () {
          yield* explorerRequired

          const place = yield* placeRepo.findById(placeId)
          
          if (!place) {
            return yield* Effect.fail(new PlaceNotFound({ placeId }))
          }

          return place
        }),

        /**
         * Get user's location preference
         */
        getLocationPreference: () => Effect.gen(function* () {
          const session = yield* explorerRequired

          const dbUser = yield* userRepo.findByClerkId(session.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          const pref = yield* userRepo.getLocationPreference(dbUser.id)
          return pref as UserLocationPreference | null
        }),

        /**
         * Update user's location preference
         */
        updateLocationPreference: (payload: UpdateLocationPreferencePayload) =>
          Effect.gen(function* () {
            const session = yield* explorerRequired

            const dbUser = yield* userRepo.findByClerkId(session.user.id)
            
            if (!dbUser) {
              return yield* Effect.fail(new Unauthenticated({ 
                message: "User not found in database. Please complete onboarding first." 
              }))
            }

            return yield* userRepo.upsertLocationPreference(dbUser.id, payload)
          })
      }
    }),

    dependencies: [SwipeRepository.Default, UserRepository.Default, PlaceRepository.Default],
    accessors: true
  }
) { }
