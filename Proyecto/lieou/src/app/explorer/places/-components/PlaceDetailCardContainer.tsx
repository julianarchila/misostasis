"use client";

import { PlaceDetailCard } from "./PlaceDetailCard";
import { usePlaceFavorite } from "./usePlaceFavorite";
import type { Place } from "@/lib/mockPlaces";

type PlaceDetailCardContainerProps = {
  place: Place;
};

export function PlaceDetailCardContainer({ place }: PlaceDetailCardContainerProps) {
  const { isFavorite, toggleFavorite } = usePlaceFavorite(place.id);

  return (
    <PlaceDetailCard 
      place={place} 
      isFavorite={isFavorite} 
      onToggleFavorite={toggleFavorite} 
    />
  );
}
