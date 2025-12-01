import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Place } from "@/server/schemas/place";

interface PlaceDetailUIProps {
  place: Place;
}

export function PlaceDetailUI({ place }: PlaceDetailUIProps) {
  const firstImage = place.images && place.images.length > 0 ? place.images[0] : null;

  return (
    <div className="mx-auto w-full">
      <div className="relative h-[42svh] w-full bg-neutral-100">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-neutral-400">No image</span>
          </div>
        )}
      </div>

      <div className="py-4">
        <div className="mb-2 flex items-center gap-2">
          {place.location && (
            <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
              {place.location}
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-semibold">{place.name}</h1>
        <p className="mt-2 text-sm text-neutral-600">{place.description || "No description"}</p>

        {place.images && place.images.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-medium mb-3">All Images ({place.images.length})</h2>
            <div className="grid grid-cols-3 gap-3">
              {place.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-neutral-100">
                  <Image
                    src={img.url}
                    alt={`${place.name} - Image ${idx + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <Button variant="outline" disabled>
            Edit (coming soon)
          </Button>
          <Button variant="destructive" disabled>
            Unpublish
          </Button>
          <div className="ml-auto" />
        </div>
      </div>
    </div>
  );
}
