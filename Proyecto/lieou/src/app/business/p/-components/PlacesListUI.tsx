import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Place } from "@/server/schemas/place";
import Link from "next/link";

import { MapPin, Eye, Heart } from "lucide-react"


interface PlacesListUIProps {
  places: readonly Place[];
}

export function PlacesListUI({ places }: PlacesListUIProps) {
  if (places.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No places yet. Create your first place!</p>
      </div>
    );
  }

  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => {

        const firstImage = place.images && place.images.length > 0 ? place.images[0].url : "/placeholder.svg";
        return (
          <Card
            key={place.id}
            className="group overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={firstImage}
                alt={place.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute right-3 top-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    "Active" === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  }`}
                >
                  {/* {place.status} */}
                  Active
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{place.location}</span>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{Number(1823).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-[#fd5564]" />
                  <span className="font-medium text-gray-900">{187}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-2 font-medium hover:border-[#fd5564] hover:text-[#fd5564] bg-transparent"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-2 font-medium hover:border-[#fd5564] hover:text-[#fd5564] bg-transparent"
                >
                  View
                </Button>
              </div>
            </div>
          </Card>
        )})}
      </div>
}
