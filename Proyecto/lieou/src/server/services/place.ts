


// handlers.ts
import { Effect } from "effect"
import { AuthSession } from "@/server/rpc/middleware"
import { Unauthenticated } from "@/server/schemas/error"
import { PlaceRepository } from "../repositories/place"
import { CreatePlacePayload } from "../schemas/place"





export const authRequired = Effect.gen(function* () {
  const currentUser = yield* AuthSession
  return yield* Effect.if(currentUser === null, {
    onTrue: () => Effect.fail(new Unauthenticated({ message: "User is not authenticated" })),
    onFalse: () => Effect.succeed(currentUser!)
  })
})


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

