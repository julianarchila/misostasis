import { Effect } from "effect"
import { SwipeRepository } from "@/server/repositories/swipe"
import { UserRepository } from "@/server/repositories/user"
import { PlaceRepository } from "@/server/repositories/place"
import { explorerRequired } from "@/server/utils/roles"
import { Unauthenticated, PlaceNotFound } from "@/server/schemas/error"
import type { SwipePayload } from "@/server/schemas/explorer"

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
         * Excludes places they've already saved and their own places (if they're also a business)
         */
        getRecommended: () => Effect.gen(function* () {
          const session = yield* explorerRequired

          const dbUser = yield* userRepo.findByClerkId(session.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          // Pass the user's id to exclude their own places if they happen to be a business too
          return yield* swipeRepo.findRecommendedForUser(dbUser.id, dbUser.id)
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
        })
      }
    }),

    dependencies: [SwipeRepository.Default, UserRepository.Default, PlaceRepository.Default],
    accessors: true
  }
) { }
