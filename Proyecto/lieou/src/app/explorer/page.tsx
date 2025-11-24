
"use client";

import * as React from "react";
import { SwipeDeck } from "./-components/SwipeDeck";
import { useRecommendedPlaces } from "@/hooks/useRecommendedPlaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlaceOptions, getMyPlacesOptions } from "@/data-access/places";
import { type Place } from "@/lib/mockPlaces";

export default function ExplorerPage() {
  const { data: places, isLoading, error } = useRecommendedPlaces();
  const [, setSaved] = React.useState<Place[]>([]);
  const queryClient = useQueryClient();

  const { mutate: createPlace } = useMutation({
    ...createPlaceOptions,
    throwOnError: false,
    onSuccess: () => {
      // Invalidate my places so the saved list will refresh
      queryClient.invalidateQueries({ queryKey: getMyPlacesOptions.queryKey });
    },
  });

  const handleSave = (place: Place) => {
    // Optimistic local add (keeps existing behavior while mutation runs)
    setSaved((prev) => (prev.find((p) => p.id === place.id) ? prev : [...prev, place]));

    // Persist as a new place for the current user by creating it
    // We pass the photo URL as an image; description is optional
    createPlace({
      name: place.name,
      description: place.description || null,
      location: null,
      images: [place.photoUrl],
    });
  };

  const handleDiscard = () => {
    // no-op for mock; could track discards if desired
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading places</div>;
  if (!places || places.length === 0) return <div>No places available</div>;

  return <SwipeDeck places={places} onSave={handleSave} onDiscard={handleDiscard} />;
}