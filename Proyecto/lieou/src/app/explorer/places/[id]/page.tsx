"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlaceByIdOptions } from "@/data-access/places";
import { PlaceDetailCardContainer } from "../-components/PlaceDetailCardContainer";
import type { Place as UiPlace } from "@/lib/mockPlaces";

export default function ExplorerPlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const placeId = Number(id);

  const { data: serverPlace, isLoading, error } = useQuery(getPlaceByIdOptions(placeId));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading place</div>;
  if (!serverPlace) {
    return <div className="text-sm text-neutral-600">Place not found</div>;
  }

  const place: UiPlace = {
    id: String(serverPlace.id),
    name: serverPlace.name,
    photoUrl: serverPlace.images && serverPlace.images.length > 0 ? serverPlace.images[0].url : "/placeholder.png",
    category: "Other",
    description: serverPlace.description ?? "",
    mapsUrl: serverPlace.mapsUrl
  };

  return <PlaceDetailCardContainer place={place} />;
}


