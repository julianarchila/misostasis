"use client"

import { SavedPlacesListContainer } from "./-components/SavedPlacesListContainer"
import { useQuery } from "@tanstack/react-query"
import { getMyPlacesOptions } from "@/data-access/places"

export default function ExplorerSavedPage() {
  const { data: places, isPending, isError, error } = useQuery(getMyPlacesOptions)

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
      places={places ?? []} 
      isLoading={isPending}
    />
  )
}
