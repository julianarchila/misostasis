import { Layer } from "effect"
import { UserHandlersLive } from "./user.handler"
import { PlaceHandlersLive } from "./place.handler"
import { StorageHandlersLive } from "./storage.handler"

/**
 * Combined handlers for all RPC groups
 */
export const HandlersLive = Layer.mergeAll(
  UserHandlersLive,
  PlaceHandlersLive,
  StorageHandlersLive
)

export { UserHandlersLive, PlaceHandlersLive, StorageHandlersLive }
