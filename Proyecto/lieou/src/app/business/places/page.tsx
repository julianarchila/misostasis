"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockPlaces } from "@/lib/mockPlaces";

export default function BusinessPlacesListPage() {
  const places = mockPlaces; // mock data for skeleton

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {places.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-40 w-full bg-neutral-100">
              <Image
                src={p.photoUrl}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2">
                <div className="font-medium">{p.name}</div>
                <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                  {p.category}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-neutral-500 truncate pr-2">{p.description}</div>
                <Button asChild variant="outline" className="h-8 px-2">
                  <a href={`/business/places/${p.id}`}>View</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


