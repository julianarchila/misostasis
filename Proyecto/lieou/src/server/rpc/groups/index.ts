import { UserRpcs } from "./user.rpcs"
import { PlaceRpcs } from "./place.rpcs"

/**
 * Combined RPC groups for the entire application
 */
export const AppRpcs = UserRpcs.merge(PlaceRpcs)

export { UserRpcs, PlaceRpcs }
