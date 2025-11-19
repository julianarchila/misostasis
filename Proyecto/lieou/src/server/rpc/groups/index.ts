import { UserRpcs } from "./user.rpcs"
import { PlaceRpcs } from "./place.rpcs"
import { StorageRpcs } from "./storage.rpcs"
import { RpcLoggingMiddleware } from "@/server/rpc/middlewares/logging"

/**
 * Combined RPC groups for the entire application
 */
export const AppRpcs = UserRpcs.merge(PlaceRpcs).merge(StorageRpcs)
  .middleware(RpcLoggingMiddleware) 


export { UserRpcs, PlaceRpcs, StorageRpcs }
