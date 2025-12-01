
"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPlacesOptions } from "@/data-access/places";
import { PlacesListUI } from "./PlacesListUI";
import { Card, CardContent } from "@/components/ui/card";

export function BusinessPlaceList() {
  const query = useQuery(getMyPlacesOptions);

  if (query.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-40 w-full bg-neutral-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return query.error.match({
      Unauthenticated: () => (
        <div className="text-center py-8">
          <p className="text-red-500">You must be signed in to view your places</p>
        </div>
      ),
      OrElse: (error) => (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading places: {String(error)}</p>
        </div>
      ),
    });
  }

  return <PlacesListUI places={query.data} />;
}


