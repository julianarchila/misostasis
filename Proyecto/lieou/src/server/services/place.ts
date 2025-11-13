import { Effect } from "effect"
import { PlaceRepository } from "@/server/repositories/place"
import { CreatePlacePayload } from "@/server/schemas/place"
import { authRequired } from "@/server/utils/auth"

export class PlaceService extends Effect.Service<PlaceService>()(
  "PlaceService",
  {
    effect: Effect.gen(function* () {

      const userRepo = yield* PlaceRepository 


      return {
        create: (payload: CreatePlacePayload) => Effect.gen(function*(){
          yield* authRequired

          return yield* userRepo.create(payload)

        })
      }

    }),

    dependencies: [PlaceRepository.Default],
    accessors: true
  }
) { }

