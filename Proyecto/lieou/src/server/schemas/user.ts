// request.ts
import { Schema } from "effect"

// Define a user with an ID and name
export class User extends Schema.Class<User>("User")({
  id: Schema.String, // User's ID as a string
  name: Schema.String // User's name as a string
}) { }


export const OnboardUserPayload = Schema.Struct({
  businessName: Schema.optional(Schema.String),
  fullName: Schema.String,
  location: Schema.String,
  userType: Schema.Union(
    Schema.Literal("business"),
    Schema.Literal("explorer")
  )
})

export type OnboardUserPayload = Schema.Schema.Type<typeof OnboardUserPayload>
