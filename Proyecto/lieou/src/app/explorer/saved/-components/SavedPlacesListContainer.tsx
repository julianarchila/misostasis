"use client"

import { SavedPlacesList } from "./SavedPlacesList"
import { SavedEmptyState } from "./SavedEmptyState"
import { SavedPlacesHeader } from "./SavedPlacesHeader"
import { useSavedPlacesFavorites } from "./useSavedPlacesFavorites"
import { Card, CardContent } from "@/components/ui/card"
import type { Place } from "@/server/schemas/place"

type SavedPlacesListContainerProps = {
  places: readonly Place[]
  isLoading?: boolean
}

// Skeleton loader for cards
function SavedPlacesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden rounded-2xl border-0 p-0">
          <CardContent className="p-0">
            {/* Image skeleton */}
            <div className="aspect-[16/10] w-full bg-gray-100 animate-pulse" />
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
              <div className="flex gap-2 pt-2">
                <div className="h-10 bg-gray-100 rounded-full animate-pulse flex-1" />
                <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SavedPlacesListContainer({ places, isLoading }: SavedPlacesListContainerProps) {
  const { favoritesById, toggleFavorite } = useSavedPlacesFavorites()

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header - always show */}
      <SavedPlacesHeader count={places.length} />
      
      {/* Content */}
      {isLoading ? (
        <SavedPlacesSkeleton />
      ) : places.length === 0 ? (
        <SavedEmptyState />
      ) : (
        <SavedPlacesList 
          places={places} 
          favoritesById={favoritesById} 
          onToggleFavorite={toggleFavorite} 
        />
      )}
    </div>
  )
}
