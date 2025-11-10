

// handlers.ts
import { Effect, Option } from "effect"
import { AuthSession } from "@/server/rpc/middleware"
import { UserRepository } from "@/server/repositories/user"
import { type OnboardUserPayload } from "@/server/schemas/user"
import { ClerkError, Unauthenticated } from "@/server/schemas/error"

import { auth, clerkClient } from '@clerk/nextjs/server'




export const authRequired = Effect.gen(function* () {
  const currentUser = yield* AuthSession
  return yield* Effect.if(currentUser === null, {
    onTrue: () => Effect.fail(new Unauthenticated({ message: "User is not authenticated" })),
    onFalse: () => Effect.succeed(currentUser!)
  })
})

export const setOnboarded = (userId: string) => Effect.gen(function* () {
  const client = yield* Effect.promise(clerkClient)

  const res = yield* Effect.tryPromise({
    try: () => client.users.updateUser(userId, {
      publicMetadata: { onboardingComplete: true }
    }),
    catch: () => new ClerkError("There was an error updating the user metadata.")
  })

})

export class UserService extends Effect.Service<UserService>()(
  "UserService",
  {
    effect: Effect.gen(function* () {

      const userRepo = yield* UserRepository


      return {
        list: () => Effect.gen(function* () {
          const currentUser = yield* AuthSession
          yield* Effect.log(`Current User in getCurrentUser Service: ${currentUser}`)

          return yield* userRepo.findMany
        }),

        byId: (id: string) => userRepo.findById(id),

        onboard: (payload: OnboardUserPayload) => Effect.gen(function* () {
          const currentUser = yield* authRequired
          // TODO: use clerk client to get full user

          yield* userRepo.create({
            clerk_id: currentUser.user.id,
            email: currentUser.raw.sessionClaims?.metadata.email || "",
            role: payload.userType
          }).pipe(Effect.orDie)


          yield* setOnboarded(currentUser.user.id).pipe(Effect.orDie)
        })
      }

    }),

    dependencies: [UserRepository.Default],
    accessors: true
  }
) { }

