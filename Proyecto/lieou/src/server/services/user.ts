

// handlers.ts
import { Effect, Layer, Ref, Option } from "effect"
import { AuthMiddleware, CurrentUser } from "@/server/rpc/middleware"
import { User } from "@/server/schemas/user"

import { auth } from '@clerk/nextjs/server'
import { UserRepository } from "@/server/repositories/user"
import { type OnboardUserPayload } from "@/server/schemas/user"
import { Unauthenticated } from "@/server/schemas/error"



export const authRequired = Effect.gen(function* () {
  const currentUser = yield* CurrentUser
  yield* Effect.log(`Current User in authRequired: ${currentUser}`)
  console.log(currentUser)
  return yield* Option.match(currentUser, {
    onSome: (session) => Effect.succeed(session),
    onNone: () => Effect.fail(new Unauthenticated({ message: "User is not authenticated" }))
  })

})

export class UserService extends Effect.Service<UserService>()(
  "UserService",
  {
    effect: Effect.gen(function* () {

      const userRepo = yield* UserRepository


      return {
        list: () => Effect.gen(function* () {
          const currentUser = yield* CurrentUser
          yield* Effect.log(`Current User in getCurrentUser Service: ${currentUser}`)

          return yield* userRepo.findMany
        }),

        byId: (id: string) => userRepo.findById(id),
        create: (name: string) => userRepo.create(name),

        onboard: (payload: OnboardUserPayload) => Effect.gen(function* () {

          const currentUser = yield* authRequired


          yield* Effect.log(`Current User in onboard: ${currentUser}`)
          yield* Effect.log(`Onboarding payload: ${JSON.stringify(payload)}`)


        })
      }

    }),

    dependencies: [UserRepository.Default],
    accessors: true
  }
) { }

