"use client";

import { SavedPlacesListContainer } from "./-components/SavedPlacesListContainer";
import { useQuery } from "@tanstack/react-query";
import { getMyPlacesOptions } from "@/data-access/places";
import type { Place as UiPlace } from "@/lib/mockPlaces";
import type { Place } from "@/server/schemas/place";


type PlaceWithImages = Place & {
  images?: { url: string }[];
};

export default function ExplorerSavedPage() {
  const { data } = useQuery(getMyPlacesOptions);

  const placesData = (data as PlaceWithImages[]) ?? [];

  const savedPlaces: UiPlace[] = placesData.map((p) => ({
    id: String(p.id),
    name: p.name,
    
    photoUrl: p.images?.[0]?.url ?? "/placeholder.png",
    category: "Other",
    description: p.description ?? "",
  }));

  return <SavedPlacesListContainer places={savedPlaces} />;
}