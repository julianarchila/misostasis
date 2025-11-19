import { eq, MyRpcClient } from "@/lib/effect-query";
import { Effect } from "effect";
import type { CreatePlacePayload } from "@/server/schemas/place"

/**
 * Query options for fetching user's places
 */
export const getMyPlacesOptions = eq.queryOptions({
  queryKey: ["places", "my-places"],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.PlaceGetMyPlaces()
    }),
})

type CreatePlaceInput = Omit<CreatePlacePayload, "images"> & {
  files?: File[]
}

/**
 * Mutation options for creating a new place
 */
export const createPlaceOptions = eq.mutationOptions({
  mutationFn: (input: CreatePlaceInput) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    let imageUrls: string[] = []

    if (input.files && input.files.length > 0) {
      imageUrls = yield* Effect.forEach(input.files, (file) => Effect.gen(function*() {
        // Read file as base64
        const base64 = yield* Effect.tryPromise({
            try: () => {
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`))
                reader.readAsDataURL(file)
              })
            },
            catch: (error) => new UploadError({ message: `Failed to read file ${file.name}`, cause: error })
        })
        
        // Extract base64 data (remove data URI prefix)
        const base64Data = base64.split(',')[1]

        // Upload through backend
        const { publicUrl } = yield* rpcClient.StorageUploadImage({
            filename: file.name,
            contentType: file.type,
            data: base64Data
        })

        return publicUrl
      }), { concurrency: "unbounded" })
    }

    return yield* rpcClient.PlaceCreate({
      name: input.name,
      description: input.description,
      location: input.location,
      images: imageUrls.length > 0 ? imageUrls : undefined
    })
  })
})

export class UploadError {
  readonly _tag = "UploadError"
  constructor(readonly props: { message: string, cause: unknown }) {}
}


