import { eq, MyRpcClient } from "@/lib/effect-query";
import { Data, Effect } from "effect";
import type { CreatePlacePayload, Coordinates } from "@/server/schemas/place";

// ============================================================================
// Geocoding
// ============================================================================

/**
 * Mutation options for reverse geocoding coordinates to address
 */
export const reverseGeocodeOptions = eq.mutationOptions({
  mutationFn: (coords: Coordinates) =>
    Effect.gen(function* () {
      const rpcClient = yield* MyRpcClient;
      return yield* rpcClient.GeocodingReverseGeocode(coords);
    }),
});

/**
 * Query options for fetching user's places (business users)
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
 * Query options for fetching a single place by ID (business users)
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
 * Mutation options for creating a new place (business users)
 */
export const createPlaceOptions = eq.mutationOptions({
  mutationFn: (input: CreatePlaceInput) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient
    let imageUrls: string[] = []

    if (input.images && input.images.length > 0) {
      // Use provided image URLs directly
      imageUrls = input.images
    } else if (input.files && input.files.length > 0) {
      imageUrls = yield* Effect.forEach(input.files, uploadImage, { concurrency: "unbounded" })
    }

    return yield* rpcClient.PlaceCreate({
      name: input.name,
      description: input.description,
      coordinates: input.coordinates,
      address: input.address,
      tag: input.tag,
      images: imageUrls.length > 0 ? imageUrls : undefined
    })
  })
})

/**
 * Mutation options for updating a place (business users)
 */
type UpdatePlaceInput = {
  id: number
  name?: string
  description?: string | null
  coordinates?: Coordinates | null
  address?: string | null
}

export const updatePlaceOptions = eq.mutationOptions({
  mutationFn: (input: UpdatePlaceInput) => Effect.gen(function* () {
    const rpcClient = yield* MyRpcClient

    return yield* rpcClient.PlaceUpdate({
      id: input.id,
      data: {
        name: input.name,
        description: input.description,
        coordinates: input.coordinates,
        address: input.address,
      }
    })
  })
})

/**
 * Mutation options for deleting a place (business users)
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

