"use client"

import * as React from "react"
import { SwipeDeck } from "./-components/SwipeDeck"
import { useRecommendedPlaces } from "@/hooks/useRecommendedPlaces"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPlaceOptions, getMyPlacesOptions } from "@/data-access/places"
import type { Place } from "@/server/schemas/place"

export default function ExplorerPage() {
  const { data: places, isLoading, error } = useRecommendedPlaces()
  const queryClient = useQueryClient()

  const { mutate: createPlace } = useMutation({
    ...createPlaceOptions,
    throwOnError: false,
    onSuccess: () => {
      // Invalidate my places so the saved list will refresh
      queryClient.invalidateQueries({ queryKey: getMyPlacesOptions.queryKey })
    },
  })

  const handleSave = (place: Place) => {
    // Persist as a new place for the current user by creating it
    const imageUrls = place.images?.map((img) => img.url) ?? []

    createPlace({
      name: place.name,
      description: place.description,
      location: place.location,
      maps_url: place.maps_url,
      images: imageUrls,
    })
  }

  const handleDiscard = () => {
    // no-op for now; could track discards if desired
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading places</div>
  if (!places || places.length === 0) return <div>No places available</div>

  return <SwipeDeck places={places} onSave={handleSave} onDiscard={handleDiscard} />
}
