"use client";

import * as React from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { SwipeDeck } from "@/components/person/SwipeDeck";
import { mockPlaces, type Place } from "@/lib/mockPlaces";

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
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            <TabsContent value="discover" className="pt-4">
              <SwipeDeck places={mockPlaces} onSave={handleSave} onDiscard={handleDiscard} />
            </TabsContent>
            <TabsContent value="saved" className="pt-4">
              <SavedList items={saved} />
            </TabsContent>
          </Tabs>
        </div>
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
