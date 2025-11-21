"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPlaceByIdOptions } from "@/data-access/places";
import { PlaceDetailUI } from "./-components/PlaceDetailUI";

export default function BusinessPlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const placeId = parseInt(id, 10);

  const { data: place, isLoading, error } = useQuery(getPlaceByIdOptions(placeId));

  // Handle loading state
  if (isLoading) {
    return (
      <div className="mx-auto w-full">
        <div className="relative h-[42svh] w-full bg-neutral-100 animate-pulse" />
        <div className="py-4 space-y-3">
          <div className="h-6 bg-neutral-100 rounded animate-pulse w-1/3" />
          <div className="h-4 bg-neutral-100 rounded animate-pulse w-full" />
        </div>
      </div>
    );
  }

  // Handle error state with typed error matching
  if (error) {
    let errorMessage = "An unexpected error occurred";
    let errorTitle = "Error";

    error.match({
      Unauthenticated: () => {
        errorTitle = "Authentication Required";
        errorMessage = "You must be logged in to view this place. Please sign in and try again.";
      },
      PlaceNotFound: () => {
        errorTitle = "Place Not Found";
        errorMessage = "This place doesn't exist or you don't have permission to view it.";
      },
      OrElse: () => {
        errorTitle = "Error Loading Place";
        errorMessage = "Failed to load place details. Please try again later.";
      },
    });

    return (
      <div className="mx-auto w-full max-w-md py-12 text-center">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">{errorTitle}</h2>
          <p className="text-sm text-neutral-600">{errorMessage}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // TypeScript narrowing - shouldn't happen at runtime
  if (!place) {
    return null;
  }

  // Render success state
  return <PlaceDetailUI place={place} />;
}
