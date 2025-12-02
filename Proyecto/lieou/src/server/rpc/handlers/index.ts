import { Layer } from "effect"
import { UserHandlersLive } from "./user.handler"
import { PlaceHandlersLive } from "./place.handler"
import { StorageHandlersLive } from "./storage.handler"
import { ImageHandlersLive } from "./image.handler"
import { ExplorerHandlersLive } from "./explorer.handler"
import { GeocodingHandlersLive } from "./geocoding.handler"

/**
 * Combined handlers for all RPC groups
 */
export const HandlersLive = Layer.mergeAll(
  UserHandlersLive,
  PlaceHandlersLive,
  StorageHandlersLive,
  ImageHandlersLive,
  ExplorerHandlersLive,
  GeocodingHandlersLive
)

export { UserHandlersLive, PlaceHandlersLive, StorageHandlersLive, ImageHandlersLive, ExplorerHandlersLive, GeocodingHandlersLive }
