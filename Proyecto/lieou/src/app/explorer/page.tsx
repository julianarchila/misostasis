"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { SwipeDeck } from "@/components/person/SwipeDeck";
import { mockPlaces, type Place } from "@/lib/mockPlaces";
import { ExplorerNav } from "./-components/ExplorerNav";

export default function PersonPage() {
  const [saved, setSaved] = React.useState<Place[]>([]);

  const handleSave = (place: Place) => {
    setSaved((prev) => (prev.find((p) => p.id === place.id) ? prev : [...prev, place]));
  };

  const handleDiscard = () => {
    // no-op for mock; could track discards if desired
  };

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-md px-4 pb-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="h-14 flex items-center justify-between">
            <div className="text-lg font-semibold">Discover</div>
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
          <SwipeDeck places={mockPlaces} onSave={handleSave} onDiscard={handleDiscard} />
        </div>
      </div>
    </main>
  );
}
