import Image from "next/image"
import { Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import type { Place } from "@/server/schemas/place"

type SavedPlacesListProps = {
  places: readonly Place[]
  favoritesById: Record<string, boolean>
  onToggleFavorite: (id: string) => void
}

export function SavedPlacesList({ places, favoritesById, onToggleFavorite }: SavedPlacesListProps) {
  if (places.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-base font-medium">No saved places yet</div>
        <div className="text-sm text-neutral-500 mt-1">
          Swipe right on places to add them here.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {places.map((p) => {
        const placeId = String(p.id)
        const isFavorite = !!favoritesById[placeId]
        const photoUrl = p.images?.[0]?.url ?? "/placeholder.png"
        // Hardcode category for now
        const category = "Restaurant"

        return (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={photoUrl} alt={p.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-medium">{p.name}</div>
                    <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                      {category}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 truncate">{p.description}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button asChild variant="outline" className="h-8 px-2">
                    <a href={routes.explorer.places.detail(placeId)}>Details</a>
                  </Button>
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    className={`h-8 w-8 p-0 ${isFavorite ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`}
                    onClick={() => onToggleFavorite(placeId)}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
