"use client"

import { Card } from "@/components/ui/card"
import { FeedCardImageCarousel } from "./FeedCardImageCarousel"
import { FeedCardInfo } from "./FeedCardInfo"

type PlaceImage = {
  readonly id: number
  readonly url: string
}

export type FeedCardPlace = {
  readonly name: string
  readonly description: string | null
  readonly address: string | null
  readonly images?: readonly PlaceImage[]
}

type FeedCardProps = {
  place: FeedCardPlace
  /** Hardcoded for now - will come from API later */
  category?: string
  /** Distance from user's location */
  distance?: string
  /** Hardcoded for now - will come from API later */
  rating?: number
  /** Optional action buttons (pass/like, favorite, etc.) */
  children?: React.ReactNode
}

export function FeedCard({
  place,
  category = "Restaurant",
  distance,
  rating = 4.8,
  children,
}: FeedCardProps) {
  const images = place.images ?? []
  const hasActions = !!children

  return (
    <Card className="relative h-[calc(100%-60px)] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
      <FeedCardImageCarousel
        images={images}
        name={place.name}
      />

      <FeedCardInfo
        name={place.name}
        description={place.description}
        address={place.address}
        distance={distance}
        rating={rating}
        category={category}
        hasActions={hasActions}
      />

      {/* Action buttons - inside the card at bottom */}
      {children && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 px-6">
          {children}
        </div>
      )}
    </Card>
  )
}
