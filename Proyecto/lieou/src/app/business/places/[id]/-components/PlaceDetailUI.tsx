"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Pencil, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { FeedCard } from "@/components/FeedCard"
import { GradientBackground } from "@/components/GradientBackground"
import type { Place } from "@/server/schemas/place"
import { routes } from "@/lib/routes"
import { deletePlaceOptions } from "@/data-access/places"

interface PlaceDetailUIProps {
  place: Place
}

export function PlaceDetailUI({ place }: PlaceDetailUIProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    ...deletePlaceOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places", "my-places"] })
      toast.success("Place deleted successfully")
      router.push(routes.business.places.list)
    },
    onError: (error) => {
      error.match({
        Unauthenticated: () => {
          toast.error("You must be logged in to delete this place")
        },
        PlaceNotFound: () => {
          toast.error("This place doesn't exist or you don't have permission to delete it")
        },
        OrElse: () => {
          toast.error("Failed to delete place. Please try again.")
        },
      })
    },
  })

  // Hardcoded stats for now (will be added to API later)
  const stats = {
    views: 1247,
    likes: 89,
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this place? This cannot be undone.")) {
      deleteMutation.mutate(place.id)
    }
  }

  return (
    <GradientBackground>
      <div className="relative mx-auto max-w-2xl px-6 py-6 min-h-screen overflow-hidden pb-20">
        {/* Header with back button and edit button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(routes.business.places.list)}
            className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex rounded-full bg-white/20 p-1 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg">
              <Eye className="h-4 w-4" />
              Preview
            </div>
            <Link
              href={routes.business.places.edit(String(place.id))}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Preview Mode - Shows exactly what explorers see */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <FeedCard
              place={{
                name: place.name,
                description: place.description,
                location: place.location,
                images: place.images,
              }}
              category="Restaurant"
              distance="0.5 mi"
              rating={4.8}
            />
          </div>

          {/* Stats Card */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.views.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#fd5564]">{stats.likes}</p>
                <p className="text-sm text-gray-500">Likes</p>
              </div>
            </div>
          </div>

          {/* Delete Zone */}
          <div className="rounded-3xl border-2 border-dashed border-white/30 p-6">
            <h3 className="mb-2 text-center text-sm font-medium text-white/80">Danger Zone</h3>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-full border-2 border-red-300 bg-white/10 text-white hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMutation.isPending ? "Deleting..." : "Delete this place"}
            </Button>
          </div>

          {/* Quick edit hint */}
          <p className="text-center text-sm text-white/80">Tap &quot;Edit&quot; to make changes</p>
        </div>
      </div>
    </GradientBackground>
  )
}
