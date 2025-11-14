import { Effect } from "effect"
import { PlaceRepository } from "@/server/repositories/place"
import { UserRepository } from "@/server/repositories/user"
import { CreatePlacePayload } from "@/server/schemas/place"
import { authRequired } from "@/server/utils/auth"
import { Unauthenticated } from "@/server/schemas/error"

export class PlaceService extends Effect.Service<PlaceService>()(
  "PlaceService",
  {
    effect: Effect.gen(function* () {

      const placeRepo = yield* PlaceRepository
      const userRepo = yield* UserRepository


      return {
        create: (payload: CreatePlacePayload) => Effect.gen(function*(){
          const currentUser = yield* authRequired

          // Get the database user ID from the Clerk user ID
          const dbUser = yield* userRepo.findByClerkId(currentUser.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          return yield* placeRepo.create({
            ...payload,
            business_id: dbUser.id
          })

        }),

        getMyPlaces: () => Effect.gen(function*(){
          const currentUser = yield* authRequired

          // Get the database user ID from the Clerk user ID
          const dbUser = yield* userRepo.findByClerkId(currentUser.user.id)
          
          if (!dbUser) {
            return yield* Effect.fail(new Unauthenticated({ 
              message: "User not found in database. Please complete onboarding first." 
            }))
          }

          return yield* placeRepo.findByBusinessId(dbUser.id)
        })
      }

    }),

    dependencies: [PlaceRepository.Default, UserRepository.Default],
    accessors: true
  }
) { }

