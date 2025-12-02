"use client"

import * as React from "react"
import { SwipeDeck } from "./-components/SwipeDeck"
import { LoadingState } from "./-components/LoadingState"
import { ErrorState } from "./-components/ErrorState"
import { EmptyState } from "./-components/EmptyState"
import { GradientBackground } from "@/components/GradientBackground"
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

  if (isLoading) {
    return (
      <GradientBackground>
        <div className="flex h-full items-center justify-center px-4 py-8">
          <LoadingState />
        </div>
      </GradientBackground>
    )
  }

  if (error) {
    return (
      <GradientBackground>
        <div className="flex h-full items-center justify-center px-4 py-8">
          <ErrorState />
        </div>
      </GradientBackground>
    )
  }

  if (!places || places.length === 0) {
    return (
      <GradientBackground>
        <div className="flex h-full items-center justify-center px-4 py-8">
          <EmptyState />
        </div>
      </GradientBackground>
    )
  }

  return <SwipeDeck places={places} onSave={handleSave} onDiscard={handleDiscard} />
}
