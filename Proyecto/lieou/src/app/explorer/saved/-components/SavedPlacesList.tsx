import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, ExternalLink, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import type { SavedPlace } from "@/server/schemas/explorer"

type SavedPlacesListProps = {
  savedPlaces: readonly SavedPlace[]
  favoritesById: Record<string, boolean>
  onToggleFavorite: (id: string) => void
  onRemove: (placeId: number) => void
  isRemoving?: boolean
}

export function SavedPlacesList({ 
  savedPlaces, 
  favoritesById, 
  onToggleFavorite, 
  onRemove,
  isRemoving 
}: SavedPlacesListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {savedPlaces.map((savedPlace) => {
        const place = savedPlace.place
        const placeId = String(place.id)
        const isFavorite = !!favoritesById[placeId]
        const photoUrl = place.images?.[0]?.url ?? "/placeholder.svg"
        
        // Build Google Maps link
        const googleSearchLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`
        const mapsLink = place.maps_url ?? googleSearchLink

        return (
          <Card
            key={savedPlace.swipe_id}
            className="group overflow-hidden rounded-2xl border-0 bg-white shadow-sm transition-all hover:shadow-lg p-0"
          >
            {/* Image section */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={photoUrl}
                alt={place.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              
              {/* Action buttons overlay */}
              <div className="absolute right-3 top-3 flex gap-2">
                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(place.id)}
                  disabled={isRemoving}
                  className="h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-red-500 hover:text-white text-gray-600 transition-all"
                  aria-label="Remove from saved"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                {/* Favorite button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(placeId)}
                  className={`h-9 w-9 rounded-full backdrop-blur-sm transition-all ${
                    isFavorite 
                      ? "bg-[#fd5564] hover:bg-[#fd5564]/90 text-white" 
                      : "bg-white/80 hover:bg-white text-gray-600"
                  }`}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Title on image */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-bold text-white truncate">{place.name}</h3>
                {place.location && (
                  <div className="flex items-center gap-1 text-white/90 text-sm mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{place.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content section */}
            <div className="p-4">
              {/* Description */}
              {place.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {place.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 rounded-full border-2 font-medium hover:border-[#fd5564] hover:text-[#fd5564]"
                >
                  <Link href={routes.explorer.places.detail(placeId)}>
                    View Details
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="rounded-full border-2 hover:border-[#fd5564] hover:text-[#fd5564]"
                >
                  <a href={mapsLink} target="_blank" rel="noreferrer noopener" aria-label="Open in Maps">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
