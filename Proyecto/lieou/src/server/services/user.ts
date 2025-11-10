

// handlers.ts
import { Effect } from "effect"
import { AuthSession } from "@/server/rpc/middleware"
import { UserRepository } from "@/server/repositories/user"
import { type OnboardUserPayload } from "@/server/schemas/user"
import { ClerkError, Unauthenticated } from "@/server/schemas/error"

import { clerkClient } from '@clerk/nextjs/server'




export const authRequired = Effect.gen(function* () {
  const currentUser = yield* AuthSession
  return yield* Effect.if(currentUser === null, {
    onTrue: () => Effect.fail(new Unauthenticated({ message: "User is not authenticated" })),
    onFalse: () => Effect.succeed(currentUser!)
  })
})

export const setPublicMetadata = (userId: string, metadata: Record<string, unknown>) =>
  Effect.gen(function* () {
    const client = yield* Effect.promise(clerkClient)
    yield* Effect.tryPromise({
      try: () =>
        client.users.updateUser(userId, {
          publicMetadata: metadata
        }),
      catch: () => new ClerkError("There was an error updating the user metadata.")
    })
  })


export const getClerkUserById = (userId: string) => Effect.gen(function* () {
  const client = yield* Effect.promise(clerkClient)

  const user = yield* Effect.tryPromise({
    try: () => client.users.getUser(userId),
    catch: () => new ClerkError("There was an error fetching the user.")
  })

  if (!user.primaryEmailAddress) {
    return yield* Effect.fail(new ClerkError("User does not have a primary email address."))
  }

  return user



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

          const clerkUser = yield* getClerkUserById(currentUser.user.id).pipe(Effect.orDie)


          yield* userRepo.create({
            clerk_id: currentUser.user.id,
            email: clerkUser.primaryEmailAddress!.emailAddress,
            fullName: payload.fullName,
            role: payload.userType
          }).pipe(Effect.orDie)


          yield* setPublicMetadata(currentUser.user.id, {
            onboardingComplete: true,
            role: payload.userType
          }).pipe(Effect.orDie)
        })
      }

    }),

    dependencies: [UserRepository.Default],
    accessors: true
  }
) { }

