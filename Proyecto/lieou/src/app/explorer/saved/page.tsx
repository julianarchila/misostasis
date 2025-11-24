"use client";

import { SavedPlacesListContainer } from "./-components/SavedPlacesListContainer";
import { useQuery } from "@tanstack/react-query";
import { getMyPlacesOptions } from "@/data-access/places";
import type { Place as UiPlace } from "@/lib/mockPlaces";

export default function ExplorerSavedPage() {
  const { data } = useQuery(getMyPlacesOptions);

  const savedPlaces: UiPlace[] = (data ?? []).map((p: any) => ({
    id: String(p.id),
    name: p.name,
    photoUrl: p.images && p.images.length > 0 ? p.images[0].url : "/placeholder.png",
    category: "Other",
    description: p.description ?? "",
  }));

  return <SavedPlacesListContainer places={savedPlaces} />;
}


