"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin } from "lucide-react";
import type { Place } from "@/lib/mockPlaces";

type PlaceDetailCardProps = {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function PlaceDetailCard({ place, isFavorite, onToggleFavorite }: PlaceDetailCardProps) {
  return (
    <div className="mx-auto w-full">
      <div className="relative h-[48svh] w-full bg-neutral-100">
        <Image
          src={place.photoUrl}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          priority
        />
      </div>

      <div className="py-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
            {place.category}
          </Badge>
        </div>
        <h1 className="text-xl font-semibold">{place.name}</h1>
        <p className="mt-2 text-sm text-neutral-600">{place.description}</p>

        <div className="mt-6 flex items-center gap-2">
          <Button
            variant={isFavorite ? "default" : "outline"}
            className={`${isFavorite ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`}
            onClick={onToggleFavorite}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favorited" : "Add to favorites"}
          </Button>
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Open in Maps
          </Button>
        </div>

        <div className="mt-6">
          <Link href="/explorer/saved" className="text-sm text-neutral-600 hover:text-neutral-900">
            Back to Saved
          </Link>
        </div>
      </div>
    </div>
  );
}
