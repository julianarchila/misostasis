"use client"

import * as React from "react"
import { X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedCard } from "@/components/FeedCard"
import { GradientBackground } from "@/components/GradientBackground"
import { EmptyState } from "./EmptyState"
import type { PlaceWithDistance } from "@/server/schemas/place"

type SwipeDeckProps = {
  places: readonly PlaceWithDistance[]
  onSave: (place: PlaceWithDistance) => void
  onDiscard: (place: PlaceWithDistance) => void
}

export function SwipeDeck({ places, onSave, onDiscard }: SwipeDeckProps) {
  const [index, setIndex] = React.useState(0)
  const active = places[index]

  const completeSwipe = (direction: "left" | "right") => {
    if (!active) return
    if (direction === "right") onSave(active)
    if (direction === "left") onDiscard(active)
    setIndex((i) => i + 1)
  }

  const handleButton = (dir: "left" | "right") => () => completeSwipe(dir)

  // Format distance for display
  const formatDistance = (distanceKm: number | null | undefined): string | undefined => {
    if (distanceKm === null || distanceKm === undefined) return undefined
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`
    }
    return `${distanceKm.toFixed(1)} km`
  }

  return (
    <GradientBackground>
      <div className="flex h-full items-center justify-center px-4 py-8">
        {active ? (
          <FeedCard
            place={{
              name: active.name,
              description: active.description,
              address: active.address,
              images: active.images,
            }}
            category="Restaurant"
            distance={formatDistance(active.distance_km)}
            rating={4.8}
          >
            <Button
              onClick={handleButton("left")}
              size="lg"
              variant="outline"
              className="h-16 w-16 rounded-full border-2 border-gray-300 bg-white p-0 shadow-xl transition-transform hover:scale-110 hover:border-gray-400"
              aria-label="Pass"
            >
              <X className="h-7 w-7 text-gray-600" />
            </Button>
            <Button
              onClick={handleButton("right")}
              size="lg"
              className="h-16 w-16 rounded-full bg-gradient-to-br from-[#fd5564] to-[#ff8a5b] p-0 shadow-2xl transition-transform hover:scale-110"
              aria-label="Like"
            >
              <Heart className="h-7 w-7 text-white" />
            </Button>
          </FeedCard>
        ) : (
          <EmptyState />
        )}
      </div>
    </GradientBackground>
  )
}
