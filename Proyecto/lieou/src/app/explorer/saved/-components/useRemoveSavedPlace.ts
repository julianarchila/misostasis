"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { unsavePlaceOptions, getSavedPlacesOptions, getRecommendedPlacesOptions } from "@/data-access/explorer"
import { toast } from "sonner"

export function useRemoveSavedPlace() {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    ...unsavePlaceOptions,
    onSuccess: () => {
      // Invalidate the saved places list and recommended places
      queryClient.invalidateQueries({ queryKey: getSavedPlacesOptions.queryKey })
      queryClient.invalidateQueries({ queryKey: getRecommendedPlacesOptions.queryKey })
      toast.success("Place removed from saved")
    },
    onError: (error) => {
      toast.error("Failed to remove place")
      console.error("Remove place error:", error)
    },
  })

  const removePlace = (placeId: number) => {
    mutate(placeId)
  }

  return {
    removePlace,
    isRemoving: isPending,
  }
}
