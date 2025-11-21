import { Schema, Data } from "effect";

// Define error schemas
export class Unauthenticated extends Schema.TaggedError<Unauthenticated>()(
  "Unauthenticated",
  {}
) { }


export class ClerkError extends Schema.TaggedError<ClerkError>()(
  "ClerkError",
  {}
){}



export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause?: unknown
  message?: string
}> {}



export class StorageError extends Data.TaggedError("StorageError")<{
  cause?: unknown
  message?: string
}> {}



export class PlaceNotFound extends Schema.TaggedError<PlaceNotFound>()(
  "PlaceNotFound",
  {
    placeId: Schema.Number
  }
) {}
