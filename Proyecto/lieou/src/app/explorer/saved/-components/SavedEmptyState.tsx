import { Heart, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { routes } from "@/lib/routes"

export function SavedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Decorative icon */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Heart className="h-10 w-10 text-gray-300" />
        </div>
        {/* Small decorative accent */}
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#fd5564]">
          <span className="text-xs text-white font-bold">0</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        No saved places yet
      </h2>
      <p className="text-gray-500 mb-6 max-w-xs">
        Swipe right on places you love to save them here for later
      </p>

      <Button 
        asChild
        className="rounded-full bg-gradient-to-r from-[#fd5564] to-[#ff8a5b] px-6 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Link href={routes.explorer.feed}>
          <Compass className="mr-2 h-4 w-4" />
          Start Exploring
        </Link>
      </Button>
    </div>
  )
}
