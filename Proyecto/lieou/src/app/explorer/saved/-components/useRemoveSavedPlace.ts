"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deletePlaceOptions, getMyPlacesOptions } from "@/data-access/places"
import { toast } from "sonner"

export function useRemoveSavedPlace() {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    ...deletePlaceOptions,
    onSuccess: () => {
      // Invalidate the saved places list
      queryClient.invalidateQueries({ queryKey: getMyPlacesOptions.queryKey })
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
