"use client"

import { SavedPlacesListContainer } from "./-components/SavedPlacesListContainer"
import { useQuery } from "@tanstack/react-query"
import { getSavedPlacesOptions } from "@/data-access/explorer"

export default function ExplorerSavedPage() {
  const { data: savedPlaces, isPending, isError, error } = useQuery(getSavedPlacesOptions)

  // Error state
  if (isError) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-xl bg-red-50 p-4 text-center">
          <p className="text-red-600 font-medium">Failed to load saved places</p>
          <p className="text-red-500 text-sm mt-1">{String(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <SavedPlacesListContainer 
      savedPlaces={savedPlaces ?? []} 
      isLoading={isPending}
    />
  )
}
