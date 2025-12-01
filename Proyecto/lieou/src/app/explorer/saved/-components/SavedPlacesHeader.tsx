import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type SavedPlacesHeaderProps = {
  count: number
}

export function SavedPlacesHeader({ count }: SavedPlacesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fd5564] to-[#ff8a5b]">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Saved Places</h1>
          <p className="text-sm text-gray-500">Your favorite spots</p>
        </div>
      </div>
      <Badge 
        variant="secondary" 
        className="bg-[#fd5564]/10 text-[#fd5564] font-semibold px-3 py-1"
      >
        {count} {count === 1 ? "place" : "places"}
      </Badge>
    </div>
  )
}
