"use client";

import * as React from "react";
import { SwipeDeck } from "@/components/person/SwipeDeck";
import { mockPlaces, type Place } from "@/lib/mockPlaces";

export default function PersonPage() {
  const [saved, setSaved] = React.useState<Place[]>([]);

  const handleSave = (place: Place) => {
    setSaved((prev) => (prev.find((p) => p.id === place.id) ? prev : [...prev, place]));
  };

  const handleDiscard = () => {
    // no-op for mock; could track discards if desired
  };

  return <SwipeDeck places={mockPlaces} onSave={handleSave} onDiscard={handleDiscard} />;
}
