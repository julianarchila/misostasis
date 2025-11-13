
// request.ts
import { Rpc, RpcGroup } from "@effect/rpc"
import { AuthMiddleware } from "./middleware"
import { OnboardUserPayload } from "@/server/schemas/user"
import { Unauthenticated } from "../schemas/error"

// Define a group of RPCs for user management.
// You can use the `RpcGroup.make` function to create a group of RPCs.
export class UserRpcs extends RpcGroup.make(
  Rpc.make("Onboard", {
    payload: OnboardUserPayload,
    error: Unauthenticated
  })
).prefix("User").middleware(AuthMiddleware) { }





export class PlaceRpcs extends RpcGroup.make(

  Rpc.make("CreatePlace")

){}
