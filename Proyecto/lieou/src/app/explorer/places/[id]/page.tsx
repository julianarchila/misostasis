"use client";

import * as React from "react";
import { mockPlaces } from "@/lib/mockPlaces";
import { PlaceDetailCardContainer } from "../-components/PlaceDetailCardContainer";

export default function ExplorerPlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const place = mockPlaces.find((p) => p.id === id);

  if (!place) {
    return (
      <div className="text-sm text-neutral-600">This is a mock page. Try another place.</div>
    );
  }

  return <PlaceDetailCardContainer place={place} />;
}


