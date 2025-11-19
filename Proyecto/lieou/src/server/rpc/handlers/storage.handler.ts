import { Effect, Layer } from "effect"
import { StorageRpcs } from "@/server/rpc/groups/storage.rpcs"
import { StorageService } from "@/server/services/storage"

export const StorageHandlersLive = StorageRpcs.toLayer(
  Effect.gen(function* () {
    const storageService = yield* StorageService

    return {
      StorageGetPresignedUrl: ({ filename, contentType }: { filename: string; contentType: string }) => Effect.gen(function*(){
          // Generate a unique key
          const key = `places/${crypto.randomUUID()}-${filename}`
          const uploadUrl = yield* storageService.getPresignedUploadUrl(key, contentType).pipe(Effect.orDie)
          const publicUrl = storageService.getPublicUrl(key)
          
          return { uploadUrl, publicUrl, key }
      })
    }
  })
).pipe(Layer.provide(StorageService.Default))
