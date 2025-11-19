import { Effect, Layer } from "effect"
import { StorageRpcs } from "@/server/rpc/groups/storage.rpcs"
import { StorageService } from "@/server/services/storage"

export const StorageHandlersLive = StorageRpcs.toLayer(
  Effect.gen(function* () {
    const storageService = yield* StorageService

    return {
      StorageUploadImage: ({ filename, contentType, data }: { filename: string; contentType: string; data: string }) => Effect.gen(function*(){
          return yield* storageService.uploadImage({ filename, contentType, data }).pipe(Effect.orDie)
      })
    }
  })
).pipe(Layer.provide(StorageService.Default))
