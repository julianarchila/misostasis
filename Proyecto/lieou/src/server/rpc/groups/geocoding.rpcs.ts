import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { CoordinatesSchema } from "@/server/schemas/place"
import { GeocodingError } from "@/server/schemas/error"

export class GeocodingRpcs extends RpcGroup.make(
  Rpc.make("ReverseGeocode", {
    payload: CoordinatesSchema,
    error: GeocodingError,
    success: Schema.String
  })
).prefix("Geocoding") {}
