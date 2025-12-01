"use client"

import { SavedPlacesList } from "./SavedPlacesList"
import { useSavedPlacesFavorites } from "./useSavedPlacesFavorites"
import type { Place } from "@/server/schemas/place"

type SavedPlacesListContainerProps = {
  places: readonly Place[]
}

export function SavedPlacesListContainer({ places }: SavedPlacesListContainerProps) {
  const { favoritesById, toggleFavorite } = useSavedPlacesFavorites()

  return (
    <SavedPlacesList 
      places={places} 
      favoritesById={favoritesById} 
      onToggleFavorite={toggleFavorite} 
    />
  )
}
