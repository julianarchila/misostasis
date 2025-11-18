import { Effect } from "effect"
import { AuthSession } from "@/server/rpc/middlewares/auth"
import { ClerkError, Unauthenticated } from "@/server/schemas/error"
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Ensures the user is authenticated, otherwise fails with Unauthenticated error.
 * @returns The authenticated session
 */
export const authRequired = Effect.gen(function* () {
  const currentUser = yield* AuthSession
  return yield* Effect.if(currentUser === null, {
    onTrue: () => Effect.fail(new Unauthenticated({ message: "User is not authenticated" })),
    onFalse: () => Effect.succeed(currentUser!)
  })
})

/**
 * Updates the public metadata for a Clerk user.
 */
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

/**
 * Fetches a Clerk user by their ID.
 */
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