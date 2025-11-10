
import { Schema } from "effect"
import { User } from "./user"
export const Session = Schema.Option(
  User,
)
export type Session = Schema.Schema.Type<typeof Session>

