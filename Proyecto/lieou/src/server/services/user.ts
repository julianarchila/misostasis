import { Effect } from "effect"
import { UserRepository } from "@/server/repositories/user"
import { type OnboardUserPayload } from "@/server/schemas/user"
import { authRequired, getClerkUserById, setPublicMetadata } from "@/server/utils/auth"

export class UserService extends Effect.Service<UserService>()(
  "UserService",
  {
    effect: Effect.gen(function* () {

      const userRepo = yield* UserRepository


      return {
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

