// request.ts
import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"

// Define a user with an ID and name
export class User extends Schema.Class<User>("User")({
  id: Schema.String, // User's ID as a string
  name: Schema.String // User's name as a string
}) {}
