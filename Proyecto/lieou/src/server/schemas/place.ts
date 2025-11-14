import { Schema } from "effect"

const NullableString = Schema.NullOr(Schema.String)
const NullableDate = Schema.NullOr(Schema.Date)

export const PlaceSchema = Schema.Struct({
  id: Schema.Number,
  business_id: Schema.Number,
  name: Schema.String,
  description: NullableString,
  location: NullableString,
  created_at: NullableDate,
})

export const CreatePlacePayloadSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(NullableString),
  location: Schema.optional(NullableString),
})

export const UpdatePlacePayloadSchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  description: Schema.optional(NullableString),
  location: Schema.optional(NullableString),
})

export type Place = Schema.Schema.Type<typeof PlaceSchema>
export type CreatePlacePayload = Schema.Schema.Type<typeof CreatePlacePayloadSchema>
export type UpdatePlacePayload = Schema.Schema.Type<typeof UpdatePlacePayloadSchema>


