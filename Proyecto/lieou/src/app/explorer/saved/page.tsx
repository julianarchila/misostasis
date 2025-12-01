"use client"

import { SavedPlacesListContainer } from "./-components/SavedPlacesListContainer"
import { useQuery } from "@tanstack/react-query"
import { getMyPlacesOptions } from "@/data-access/places"

export default function ExplorerSavedPage() {
  const { data: places } = useQuery(getMyPlacesOptions)

  return <SavedPlacesListContainer places={places ?? []} />
}
