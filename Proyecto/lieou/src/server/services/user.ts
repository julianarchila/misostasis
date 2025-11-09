

// handlers.ts
import { Effect, Layer, Ref } from "effect"
import { AuthMiddleware, CurrentUser } from "@/server/rpc/middleware"
import { User } from "@/server/schemas/user"

import { auth } from '@clerk/nextjs/server'
import { UserRepository } from "../repositories/user"

export class UserService extends Effect.Service<UserService>()(
  "UserService",
  {
    effect: Effect.gen(function* () {

      const userRepo = yield* UserRepository


      return {
        list:() => Effect.gen(function* () {
          const currentUser = yield* CurrentUser
          yield* Effect.log(`Current User in getCurrentUser Service: ${currentUser}`)

          return yield* userRepo.findMany
        }),

        byId: (id: string) => userRepo.findById(id),
        create: (name: string) => userRepo.create(name)
      }

    }),

    dependencies: [UserRepository.Default],
    accessors: true
  }
) { }

