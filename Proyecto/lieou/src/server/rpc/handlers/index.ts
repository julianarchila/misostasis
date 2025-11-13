import { Layer } from "effect"
import { UserHandlersLive } from "./user.handler"
import { PlaceHandlersLive } from "./place.handler"

/**
 * Combined handlers for all RPC groups
 */
export const HandlersLive = Layer.mergeAll(
  UserHandlersLive,
  PlaceHandlersLive
)

export { UserHandlersLive, PlaceHandlersLive }
