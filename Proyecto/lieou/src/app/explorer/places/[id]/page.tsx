"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Heart, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeedCard } from "@/components/FeedCard"
import { GradientBackground } from "@/components/GradientBackground"
import { getPlaceByIdOptions } from "@/data-access/places"
import { usePlaceFavorite } from "../-components/usePlaceFavorite"
import { routes } from "@/lib/routes"

export default function ExplorerPlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const placeId = Number(id)

  const { data: place, isLoading, error } = useQuery(getPlaceByIdOptions(placeId))
  const { isFavorite, toggleFavorite } = usePlaceFavorite(id)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading place</div>
  if (!place) {
    return <div className="text-sm text-neutral-600">Place not found</div>
  }

  // Build the Google Maps link
  const googleSearchLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`
  const mapsLink = place.maps_url ?? googleSearchLink

  return (
    <GradientBackground>
      <div className="flex h-full flex-col items-center justify-center px-4 py-8">
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
        >
          <Button
            variant={isFavorite ? "default" : "outline"}
            className={`rounded-full shadow-lg ${
              isFavorite
                ? "bg-rose-500 hover:bg-rose-600 text-white"
                : "bg-white border-gray-300"
            }`}
            onClick={toggleFavorite}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button variant="outline" className="rounded-full bg-white border-gray-300 shadow-lg" asChild>
            <a href={mapsLink} target="_blank" rel="noreferrer noopener">
              <MapPin className="mr-2 h-4 w-4" />
              Open in Maps
            </a>
          </Button>
        </FeedCard>

        <div className="mt-4">
          <Link
            href={routes.explorer.saved}
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Back to Saved
          </Link>
        </div>
      </div>
    </GradientBackground>
  )
}
