"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, Heart, MapPin, Pencil, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Place } from "@/server/schemas/place";
import { routes } from "@/lib/routes";

interface PlaceDetailUIProps {
  place: Place;
}

export function PlaceDetailUI({ place }: PlaceDetailUIProps) {
  const router = useRouter();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const images = place.images ?? [];
  const hasImages = images.length > 0;

  // Hardcoded stats for now (will be added to API later)
  const stats = {
    views: 1247,
    likes: 89,
  };

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this place? This cannot be undone.")) {
      // Mock delete for now
      toast.success("Place deleted");
      router.push(routes.business.places.list);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fd5564] via-[#fe6f5d] to-[#ff8a5b] overflow-hidden pb-20">
      {/* Background blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 py-6">
        {/* Header with back button and edit button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(routes.business.places.list)}
            className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex rounded-full bg-white/20 p-1 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg">
              <Eye className="h-4 w-4" />
              Preview
            </div>
            <Link
              href={routes.business.places.edit(String(place.id))}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Preview Mode - Shows what explorers see */}
        <div className="space-y-4">
          {/* Image Carousel */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
            {hasImages ? (
              <div className="relative">
                <Carousel setApi={setApi} opts={{ loop: true }}>
                  <CarouselContent className="-ml-0">
                    {images.map((image, index) => (
                      <CarouselItem key={image.id} className="pl-0">
                        <div className="relative aspect-[4/5]">
                          <Image
                            src={image.url}
                            alt={`${place.name} - Image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 672px"
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

                {/* Image indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === current ? "w-6 bg-white" : "w-1.5 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Like button preview */}
                <div className="absolute bottom-4 right-4 z-10">
                  <div className="rounded-full bg-white/90 p-3 shadow-lg">
                    <Heart className="h-6 w-6 text-[#fd5564]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-gray-100">
                <p className="text-gray-400">No photos yet</p>
              </div>
            )}

            {/* Place info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>

              {place.location && (
                <div className="mt-2 flex items-center gap-1.5 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{place.location}</span>
                </div>
              )}

              {place.description && (
                <p className="mt-4 text-base leading-relaxed text-gray-600">{place.description}</p>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.views.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#fd5564]">{stats.likes}</p>
                <p className="text-sm text-gray-500">Likes</p>
              </div>
            </div>
          </div>

          {/* Delete Zone */}
          <div className="rounded-3xl border-2 border-dashed border-white/30 p-6">
            <h3 className="mb-2 text-center text-sm font-medium text-white/80">Danger Zone</h3>
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-full border-2 border-red-300 bg-white/10 text-white hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete this place
            </Button>
          </div>

          {/* Quick edit hint */}
          <p className="text-center text-sm text-white/80">Tap &quot;Edit&quot; to make changes</p>
        </div>
      </div>
    </div>
  );
}
