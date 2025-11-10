import { Schema } from "effect";

// Define error schemas
export class Unauthenticated extends Schema.TaggedError<Unauthenticated>()(
  "Unauthenticated",
  {}
) { }
