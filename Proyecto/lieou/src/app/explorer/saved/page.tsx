"use client";

import { SavedPlacesListContainer } from "./-components/SavedPlacesListContainer";
import { mockPlaces } from "@/lib/mockPlaces";

export default function ExplorerSavedPage() {
  const savedPlaces = mockPlaces; // mock data for skeleton

  return <SavedPlacesListContainer places={savedPlaces} />;
}


