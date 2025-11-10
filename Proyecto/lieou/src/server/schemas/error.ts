import { Schema } from "effect";

// Define error schemas
export class Unauthenticated extends Schema.TaggedError<Unauthenticated>()(
  "Unauthenticated",
  {}
) { }


export class ClerkError extends Schema.TaggedError<ClerkError>()(
  "ClerkError",
  {}
){}


export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "DatabaseError",
  {}
) {}
