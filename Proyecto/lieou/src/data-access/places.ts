import { eq, MyRpcClient } from "@/lib/effect-query";
import { Data, Effect } from "effect";
import type { CreatePlacePayload } from "@/server/schemas/place"
import { type Place as UiPlace } from "@/lib/mockPlaces";
import type { Place as ServerPlace } from "@/server/schemas/place";

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
  // optional tag name to attach to the place (server will create if missing)
  tag?: string
  // optional maps link
  maps_url?: string
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
 * Returns UI-friendly `Place[]` (ids as strings, photoUrl, category)
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
        (myPlaces as ServerPlace[])
          .flatMap((p) => (p.images && p.images.length > 0 ? p.images.map((i) => i.url) : []))
      )

      const filtered = (recommended as ServerPlace[]).filter((p) => {
        const url = p.images && p.images.length > 0 ? p.images[0].url : "/placeholder.png"
        return !myImageUrls.has(url)
      })

      const mapped: UiPlace[] = filtered.map((p) => ({
        id: String(p.id),
        name: p.name,
        photoUrl: p.images && p.images.length > 0 ? p.images[0].url : "/placeholder.png",
        category: "Other",
        description: p.description ?? "",
      }))

      return mapped
    }),
})


export class UploadError extends Data.TaggedError("UploadError")<{
  fileName: string
  cause: unknown
}> { }

