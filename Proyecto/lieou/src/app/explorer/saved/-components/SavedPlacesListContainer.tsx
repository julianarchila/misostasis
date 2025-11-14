"use client";

import { SavedPlacesList } from "./SavedPlacesList";
import { useSavedPlacesFavorites } from "./useSavedPlacesFavorites";
import type { Place } from "@/lib/mockPlaces";

type SavedPlacesListContainerProps = {
  places: Place[];
};

export function SavedPlacesListContainer({ places }: SavedPlacesListContainerProps) {
  const { favoritesById, toggleFavorite } = useSavedPlacesFavorites();

  return (
    <SavedPlacesList 
      places={places} 
      favoritesById={favoritesById} 
      onToggleFavorite={toggleFavorite} 
    />
  );
}
