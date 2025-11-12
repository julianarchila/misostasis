"use client";

import * as React from "react";
import Image from "next/image";
import { X, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Place } from "@/lib/mockPlaces";

type SwipeDeckProps = {
  places: Place[];
  onSave: (place: Place) => void;
  onDiscard: (place: Place) => void;
};

export function SwipeDeck({ places, onSave, onDiscard }: SwipeDeckProps) {
  const [index, setIndex] = React.useState(0);
  const active = places[index];

  const completeSwipe = (direction: "left" | "right") => {
    if (!active) return;
    if (direction === "right") onSave(active);
    if (direction === "left") onDiscard(active);
    setIndex((i) => i + 1);
  };

  const handleButton = (dir: "left" | "right") => () => completeSwipe(dir);

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="text-xl font-medium">You&apos;re all caught up</div>
        <div className="text-sm text-neutral-500">Check back later for more places.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative h-[70svh] select-none">
        <Card
          className="absolute inset-0 overflow-hidden rounded-2xl shadow-lg will-change-transform"
        >
          <CardContent className="p-0 h-full">
            <div className="relative h-full">
              <Image
                src={active.photoUrl}
                alt={active.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 p-4 pt-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {active.category}
                  </Badge>
                </div>
                <h2 className="text-2xl font-semibold">{active.name}</h2>
                <p className="text-sm text-white/90 line-clamp-3 mt-1">{active.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <Button
          variant="outline"
          className="h-14 w-14 rounded-full border-2 border-red-500 text-red-600"
          onClick={handleButton("left")}
          aria-label="Discard"
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow"
          onClick={handleButton("right")}
          aria-label="Save"
        >
          <Heart className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
}


