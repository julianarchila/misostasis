import { eq, MyRpcClient } from "@/lib/effect-query";
import { Data, Effect } from "effect";
import type { CreatePlacePayload, Place } from "@/server/schemas/place";

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

/**
 * Query options for fetching a single place by ID
 */
export const getPlaceByIdOptions = (placeId: number) => eq.queryOptions({
  queryKey: ["places", placeId],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.PlaceGetById({ id: placeId })
    }),
})

type CreatePlaceInput = Omit<CreatePlacePayload, "images"> & {
  files?: File[]
  images?: string[]
  tag?: string | null
}



const uploadImage = Effect.fn("uploadImage")(function* (file: File) {
  const rpcClient = yield* MyRpcClient

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
    catch: (error) => new UploadError({ fileName: file.name, cause: error })
  })

  return publicUrl

})


/**
 * Mutation options for creating a new place
 */
export const createPlaceOptions = eq.mutationOptions({
  mutationFn: (input: CreatePlaceInput) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    let imageUrls: string[] = []

    if (input.images && input.images.length > 0) {
      // Use provided image URLs directly (e.g., when saving a recommended place)
      imageUrls = input.images
    } else if (input.files && input.files.length > 0) {
      imageUrls = yield* Effect.forEach(input.files, uploadImage, { concurrency: "unbounded" })
    }

    return yield* rpcClient.PlaceCreate({
      name: input.name,
      description: input.description,
      location: input.location,
      maps_url: input.maps_url,
      tag: input.tag,
      images: imageUrls.length > 0 ? imageUrls : undefined
    })
  })
})


/**
 * Query options for fetching recommended places (explorer)
 * Returns server Place[] directly, filtering out places the user already saved
 */
export const getRecommendedOptions = eq.queryOptions({
  queryKey: ["places", "recommended"],
  queryFn: () =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient

      // Fetch recommended places and the user's own places so we can exclude
      // any recommended items that the user already saved. We compare by image URL
      // (the saved flow stores the recommended place's photoUrl as an image URL).
      const recommended = yield* rpcClient.PlaceGetRecommended()
      const myPlaces = yield* rpcClient.PlaceGetMyPlaces()

      const myImageUrls = new Set<string>(
        (myPlaces as Place[])
          .flatMap((p) => (p.images && p.images.length > 0 ? p.images.map((i) => i.url) : []))
      )

      const filtered = (recommended as Place[]).filter((p) => {
        const url = p.images && p.images.length > 0 ? p.images[0].url : "/placeholder.svg"
        return !myImageUrls.has(url)
      })

      return filtered
    }),
})

/**
 * Mutation options for updating a place
 * Note: Images are now managed independently via ImageRpcs
 */
type UpdatePlaceInput = {
  id: number
  name?: string
  description?: string | null
  location?: string | null
}

export const updatePlaceOptions = eq.mutationOptions({
  mutationFn: (input: UpdatePlaceInput) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient

    return yield* rpcClient.PlaceUpdate({
      id: input.id,
      data: {
        name: input.name,
        description: input.description,
        location: input.location,
      }
    })
  })
})

/**
 * Mutation options for deleting a place
 */
export const deletePlaceOptions = eq.mutationOptions({
  mutationFn: (placeId: number) =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient
      return yield* rpcClient.PlaceDelete({ id: placeId })
    }),
})


export class UploadError extends Data.TaggedError("UploadError")<{
  fileName: string
  cause: unknown
}> { }

