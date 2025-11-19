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
        // Get presigned URL
        const { uploadUrl, publicUrl } = yield* rpcClient.StorageGetPresignedUrl({
            filename: file.name,
            contentType: file.type
        })

        // Upload file to R2
        yield* Effect.tryPromise({
            try: () => fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            }),
            catch: (error) => new UploadError({ message: `Failed to upload image ${file.name}`, cause: error })
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


