"use client";

import { useMyPlaces } from "./useMyPlaces";
import { PlacesListUI } from "./PlacesListUI";

export function PlacesList() {
  const { data: places, isLoading, error } = useMyPlaces();

  return <PlacesListUI places={places} isLoading={isLoading} error={error} />;
}
