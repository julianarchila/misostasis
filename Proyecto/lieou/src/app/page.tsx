"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SwipeDeck } from "@/components/person/SwipeDeck";
import { mockPlaces, type Place } from "@/lib/mockPlaces";

export default function PersonPage() {
  const [saved, setSaved] = React.useState<Place[]>([]);
  const search = useSearchParams();
  const view = (search.get("view") ?? "discover") as "discover" | "saved";

  const handleSave = (place: Place) => {
    setSaved((prev) => (prev.find((p) => p.id === place.id) ? prev : [...prev, place]));
  };

  const handleDiscard = () => {
    // no-op for mock; could track discards if desired
  };

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-md px-4 py-4">
        {view === "discover" ? (
          <SwipeDeck places={mockPlaces} onSave={handleSave} onDiscard={handleDiscard} />
        ) : (
          <SavedList items={saved} />
        )}
      </div>
    </main>
  );
}

function SavedList({ items }: { items: Place[] }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-base font-medium">No saved places yet</div>
        <div className="text-sm text-neutral-500 mt-1">Swipe right on places to add them here.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                <Image src={p.photoUrl} alt={p.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium">{p.name}</div>
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">{p.category}</Badge>
                </div>
                <div className="text-xs text-neutral-500 truncate">{p.description}</div>
              </div>
              <Button variant="outline" className="ml-auto">View on map</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
