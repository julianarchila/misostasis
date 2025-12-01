import { MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type FeedCardInfoProps = {
  name: string
  description: string | null
  location: string | null
  distance?: string
  rating?: number
  category?: string
  /** Whether there are action buttons below - adds extra bottom padding */
  hasActions?: boolean
}

export function FeedCardInfo({
  name,
  description,
  location,
  distance,
  rating,
  category,
  hasActions = false,
}: FeedCardInfoProps) {
  return (
    <div className={`h-2/5 overflow-y-auto px-5 py-4 ${hasActions ? "pb-24" : ""}`}>
      {category && (
        <div className="mb-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-medium">
            {category}
          </Badge>
        </div>
      )}

      <div className="mb-2">
        <h2 className="text-balance text-xl font-bold text-gray-900">{name}</h2>
        <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
          {distance && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{distance}</span>
            </div>
          )}
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
          )}
        </div>
      </div>

      {description && (
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
          {description}
        </p>
      )}

      {location && (
        <div className="mt-2 text-sm text-gray-500">
          <MapPin className="mr-1 inline h-4 w-4" />
          {location}
        </div>
      )}
    </div>
  )
}
