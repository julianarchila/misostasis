
// request.ts
import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { AuthMiddleware } from "./middleware"
import { OnboardUserPayload, User } from "@/server/schemas/user"
import { Unauthenticated } from "../schemas/error"

// Define a group of RPCs for user management.
// You can use the `RpcGroup.make` function to create a group of RPCs.
export class UserRpcs extends RpcGroup.make(
  // Request to retrieve a list of users
  Rpc.make("UserList", {
    success: Schema.Array(User), // Succeed with a stream of users
  }),
  Rpc.make("UserById", {
    success: User,
    error: Schema.String, // Indicates that errors, if any, will be returned as strings
    payload: {
      id: Schema.String
    }
  }),
  Rpc.make("OnboardUser", {
    payload: OnboardUserPayload,
    error: Unauthenticated
  })
).middleware(AuthMiddleware) { }
