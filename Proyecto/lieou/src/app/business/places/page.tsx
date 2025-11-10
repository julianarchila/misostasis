"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockPlaces } from "@/lib/mockPlaces";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { BusinessNav } from "../-components/BusinessNav";

export default function BusinessPlacesListPage() {
  const places = mockPlaces; // mock data for skeleton

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="h-14 flex items-center justify-between">
            <div className="text-lg font-semibold">Business</div>
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
            <BusinessNav />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-4">
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
                      <Link href={`/business/places/${p.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}


