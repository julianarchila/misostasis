"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPlaces } from "@/lib/mockPlaces";

export default function BusinessPlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const place = mockPlaces.find((p) => p.id === id);

  if (!place) {
    return <div className="text-sm text-neutral-600">This is a mock page. Try another place.</div>;
  }

  return (
    <div className="mx-auto w-full">
      <div className="relative h-[42svh] w-full bg-neutral-100">
        <Image
          src={place.photoUrl}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, 1024px"
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


