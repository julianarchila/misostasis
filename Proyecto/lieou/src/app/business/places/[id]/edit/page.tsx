"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPlaceByIdOptions } from "@/data-access/places";
import { PlaceEditForm } from "./-components/PlaceEditForm";

export default function BusinessPlaceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const placeId = parseInt(id, 10);

  const { data: place, isLoading, error } = useQuery(getPlaceByIdOptions(placeId));

  // Handle loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#fd5564] via-[#fe6f5d] to-[#ff8a5b] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-6">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-2xl animate-pulse">
              <div className="h-6 bg-neutral-100 rounded w-1/3 mb-4" />
              <div className="aspect-[4/3] bg-neutral-100 rounded-xl" />
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-2xl animate-pulse">
              <div className="h-6 bg-neutral-100 rounded w-1/4 mb-4" />
              <div className="h-12 bg-neutral-100 rounded" />
            </div>
          </div>
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
        errorMessage = "You must be logged in to edit this place. Please sign in and try again.";
      },
      PlaceNotFound: () => {
        errorTitle = "Place Not Found";
        errorMessage = "This place doesn't exist or you don't have permission to edit it.";
      },
      OrElse: () => {
        errorTitle = "Error Loading Place";
        errorMessage = "Failed to load place details. Please try again later.";
      },
    });

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#fd5564] via-[#fe6f5d] to-[#ff8a5b] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-12">
          <div className="rounded-3xl bg-white p-8 shadow-2xl text-center">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-neutral-900">{errorTitle}</h2>
              <p className="text-sm text-neutral-600">{errorMessage}</p>
              <Button onClick={() => router.back()} className="mt-4">
                Go back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TypeScript narrowing - shouldn't happen at runtime
  if (!place) {
    return null;
  }

  // Render edit form
  return <PlaceEditForm place={place} />;
}
