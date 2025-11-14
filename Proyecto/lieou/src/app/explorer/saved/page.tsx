"use client";

import { SavedPlacesList } from "./-components/SavedPlacesList";
import { mockPlaces } from "@/lib/mockPlaces";

export default function ExplorerSavedPage() {
  const savedPlaces = mockPlaces; // mock data for skeleton

  return <SavedPlacesList places={savedPlaces} />;
}


