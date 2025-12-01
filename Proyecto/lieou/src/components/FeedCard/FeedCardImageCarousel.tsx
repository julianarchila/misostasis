"use client"

import * as React from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

type PlaceImage = {
  readonly id: number
  readonly url: string
}

type FeedCardImageCarouselProps = {
  images: readonly PlaceImage[]
  name: string
}

export function FeedCardImageCarousel({ images, name }: FeedCardImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  const hasImages = images.length > 0

  React.useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  if (!hasImages) {
    return (
      <div className="relative h-3/5 overflow-hidden">
        <div className="flex h-full items-center justify-center bg-gray-100">
          <p className="text-gray-400">No photos yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-3/5 overflow-hidden">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="pl-0">
              <div className="relative h-full" style={{ aspectRatio: "4/5" }}>
                <Image
                  src={image.url}
                  alt={`${name} - Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom navigation buttons */}
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-3 bg-white/90 border-0 shadow-lg hover:bg-white hover:scale-110 transition-transform" />
            <CarouselNext className="right-3 bg-white/90 border-0 shadow-lg hover:bg-white hover:scale-110 transition-transform" />
          </>
        )}
      </Carousel>

      {/* Image indicators at top */}
      {images.length > 1 && (
        <div className="absolute left-0 right-0 top-4 flex justify-center gap-1 px-4 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === current ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}


    </div>
  )
}
