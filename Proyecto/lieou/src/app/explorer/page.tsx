
"use client";

import * as React from "react";
import { SwipeDeck } from "./-components/SwipeDeck";
import { useRecommendedPlaces } from "@/hooks/useRecommendedPlaces";
import { type Place } from "@/lib/mockPlaces";

export default function ExplorerPage() {
  const { data: places, isLoading, error } = useRecommendedPlaces();
  const [, setSaved] = React.useState<Place[]>([]);

  const handleSave = (place: Place) => {
    setSaved((prev) => (prev.find((p) => p.id === place.id) ? prev : [...prev, place]));
  };

  const handleDiscard = () => {
    // no-op for mock; could track discards if desired
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading places</div>;
  if (!places || places.length === 0) return <div>No places available</div>;

  return <SwipeDeck places={places} onSave={handleSave} onDiscard={handleDiscard} />;
}