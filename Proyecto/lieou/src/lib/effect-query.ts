// src/utils/effect-query.ts
import { createEffectQuery } from "effect-query";
import { Effect, Layer } from "effect";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { UserRpcs, User } from "@/requests"
import { FetchHttpClient } from "@effect/platform";


export const RpcProtocolLive = RpcClient.layerProtocolHttp({
  url: "/rpc"
}).pipe(
  Layer.provide([
    FetchHttpClient.layer,
    RpcSerialization.layerNdjson
  ])
)

export class MyRpcClient extends Effect.Service<MyRpcClient>()(
  'example/MyRpcClient',
  {
    dependencies: [],
    scoped: RpcClient.make(UserRpcs)
  }
) { }

export const LiveLayer = MyRpcClient.Default.pipe(
  Layer.provideMerge(RpcProtocolLive)
);

export const eq = createEffectQuery(LiveLayer);


