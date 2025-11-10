"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { BusinessNav } from "../../-components/BusinessNav";

export default function BusinessNewPlacePage() {
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 700); // mock submit
  }

  return (
    <main className="min-h-[100svh] bg-white">
      <div className="mx-auto w-full max-w-2xl px-4 pb-6">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="h-14 flex items-center justify-between">
            <div className="text-lg font-semibold">Create a new place</div>
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

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <FieldSet>
            <FieldLegend>Basic info</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldTitle>Name</FieldTitle>
                <FieldContent>
                  <Input placeholder="e.g. Luna Bistro" />
                </FieldContent>
              </Field>

              <Field>
                <FieldTitle>Category</FieldTitle>
                <FieldContent>
                  <RadioGroup defaultValue="Restaurant" className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {["Restaurant", "Park", "Cafe", "Museum", "Bar", "Other"].map((c) => {
                      const id = `cat-${c}`;
                      return (
                        <div key={c} className="flex items-center gap-2">
                          <RadioGroupItem id={id} value={c} />
                          <Label htmlFor={id}>{c}</Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </FieldContent>
              </Field>

              <Field>
                <FieldTitle>Description</FieldTitle>
                <FieldContent>
                  <Textarea rows={4} placeholder="Short description to highlight your place..." />
                  <FieldDescription>Keep it concise and engaging.</FieldDescription>
                </FieldContent>
              </Field>

              <Field>
                <FieldTitle>Photo URL</FieldTitle>
                <FieldContent>
                  <Input placeholder="https://example.com/photo.jpg" />
                  <FieldDescription>You can add a proper uploader later.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" asChild variant="outline">
              <Link href="/business/places">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#6c47ff] text-white">
              {loading ? "Creating..." : "Create place"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}


