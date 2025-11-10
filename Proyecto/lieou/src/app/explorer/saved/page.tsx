"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPlaces, type Place } from "@/lib/mockPlaces";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ExplorerNav } from "../-components/ExplorerNav";

export default function ExplorerSavedPage() {
  const [favoritesById, setFavoritesById] = React.useState<Record<string, boolean>>({});
  const savedPlaces: Place[] = mockPlaces; // mock data for skeleton

  const toggleFavorite = (id: string) => {
    setFavoritesById((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-md px-4 pb-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="h-14 flex items-center justify-between">
            <div className="text-lg font-semibold">Saved</div>
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal" >
                  <Button variant="outline" className="h-9 px-3 text-sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal" >
                  <Button className="h-9 px-3 text-sm rounded-full bg-[#6c47ff] text-white">Sign Up</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
          <div className="pt-3">
            <ExplorerNav />
          </div>
        </div>

        <div className="pt-4">
          {savedPlaces.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-base font-medium">No saved places yet</div>
            <div className="text-sm text-neutral-500 mt-1">
              Swipe right on places to add them here.
            </div>
          </div>
          ) : (
            <div className="space-y-3">
              {savedPlaces.map((p) => {
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
                            <Link href={`/explorer/places/${p.id}`}>Details</Link>
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
          )}
        </div>
      </div>
    </main>
  );
}


