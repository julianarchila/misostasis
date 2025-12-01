"use client"

import * as React from "react"
import { SwipeDeck } from "./-components/SwipeDeck"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRecommendedPlacesOptions, getSavedPlacesOptions, swipeOptions } from "@/data-access/explorer"
import type { PlaceWithDistance } from "@/server/schemas/place"

export default function ExplorerPage() {
  const { data: places, isLoading, error } = useQuery(getRecommendedPlacesOptions)
  const queryClient = useQueryClient()

  const { mutate: swipe } = useMutation({
    ...swipeOptions,
    throwOnError: false,
    onSuccess: (_, variables) => {
      // Only invalidate saved places when swiping right
      if (variables.direction === "right") {
        queryClient.invalidateQueries({ queryKey: getSavedPlacesOptions.queryKey })
      }
    },
  })

  const handleSave = (place: PlaceWithDistance) => {
    swipe({ place_id: place.id, direction: "right" })
  }

  const handleDiscard = (place: PlaceWithDistance) => {
    swipe({ place_id: place.id, direction: "left" })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading places</div>
  if (!places || places.length === 0) return <div>No places available</div>

  return <SwipeDeck places={places} onSave={handleSave} onDiscard={handleDiscard} />
}
