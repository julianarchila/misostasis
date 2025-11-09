"use client";

import { eq, MyRpcClient } from "@/lib/effect-query";
import { useQuery } from "@tanstack/react-query"
import { Effect } from "effect";


const listUserOptions = eq.queryOptions({
  queryKey: ["hello"],
  queryFn: () => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    return yield* rpcClient.UserList()
  })
})

export default function Page() {

  const { data, isLoading } = useQuery(listUserOptions)


  if (isLoading) {
    return <div>Loading...</div>
  }


  return <div>{JSON.stringify(data)}</div>

}

