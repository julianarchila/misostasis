import { Effect } from "effect"
import { AuthSession } from "@/server/rpc/middlewares/auth"
import { Unauthenticated } from "@/server/schemas/error"

export type Role = "explorer" | "business"

/**
 * Requires the user to have a specific role.
 * First checks authentication, then validates role from session metadata.
 */
export const roleRequired = (expectedRole: Role) =>
  Effect.gen(function* () {
    const session = yield* AuthSession
    
    if (session === null) {
      return yield* Effect.fail(new Unauthenticated({ message: "User is not authenticated" }))
    }

    const userRole = session.raw.sessionClaims?.metadata?.role as Role | undefined

    if (userRole !== expectedRole) {
      return yield* Effect.fail(new Unauthenticated({ 
        message: `This action requires ${expectedRole} role` 
      }))
    }

    return session
  })

/**
 * Requires the user to be an explorer
 */
export const explorerRequired = roleRequired("explorer")

/**
 * Requires the user to be a business user
 */
export const businessRequired = roleRequired("business")
