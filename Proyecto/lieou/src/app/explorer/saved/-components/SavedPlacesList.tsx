"use client";

import * as React from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Place } from "@/lib/mockPlaces";

type SavedPlacesListProps = {
  places: Place[];
};

export function SavedPlacesList({ places }: SavedPlacesListProps) {
  const [favoritesById, setFavoritesById] = React.useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavoritesById((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (places.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-base font-medium">No saved places yet</div>
        <div className="text-sm text-neutral-500 mt-1">
          Swipe right on places to add them here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((p) => {
        const isFavorite = !!favoritesById[p.id];
        return (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={p.photoUrl} alt={p.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-medium">{p.name}</div>
                    <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                      {p.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-500 truncate">{p.description}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button asChild variant="outline" className="h-8 px-2">
                    <a href={`/explorer/places/${p.id}`}>Details</a>
                  </Button>
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    className={`h-8 w-8 p-0 ${isFavorite ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}`}
                    onClick={() => toggleFavorite(p.id)}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
