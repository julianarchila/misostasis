"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEditPlaceForm } from "./useEditPlaceForm";
import { ImageUpload, ImageItem } from "../../../-components/ImageUpload";
import { GradientBackground } from "@/components/GradientBackground";
import { MapPicker, type Coordinates } from "@/components/MapPicker";
import { ChevronLeft, Eye, Pencil, MapPin, Loader2 } from "lucide-react";
import type { Place } from "@/server/schemas/place";
import { routes } from "@/lib/routes";
import { useMutation } from "@tanstack/react-query";
import { reverseGeocodeOptions } from "@/data-access/places";

interface PlaceEditFormProps {
  place: Place;
}

export function PlaceEditForm({ place }: PlaceEditFormProps) {
  const router = useRouter();
  const { form, isPending } = useEditPlaceForm({ place });

  const { mutate: reverseGeocode, isPending: isGeocoding } = useMutation({
    ...reverseGeocodeOptions,
    onSuccess: (address) => {
      form.setFieldValue("address", address);
    },
  });

  const handleCoordinatesChange = useCallback(
    (coords: Coordinates | null, fieldOnChange: (coords: Coordinates | null) => void) => {
      fieldOnChange(coords);
      if (coords) {
        reverseGeocode(coords);
      }
    },
    [reverseGeocode]
  );

  // Images are managed independently with their own state
  const [images, setImages] = useState<ImageItem[]>(
    (place.images ?? []).map((img, i) => ({
      id: img.id,
      url: img.url,
      order: i,
    }))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <GradientBackground className="pb-20">
      <div className="relative mx-auto max-w-2xl px-6 py-6">
        {/* Header with back button and mode toggle */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(routes.business.places.detail(String(place.id)))}
            className="flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex rounded-full bg-white/20 p-1 backdrop-blur-sm">
            <Link
              href={routes.business.places.detail(String(place.id))}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-lg">
              <Pencil className="h-4 w-4" />
              Edit
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section - Using new ImageUpload with independent state */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Photos</h2>
              <p className="mt-1 text-sm text-gray-600">
                Drag to reorder. First photo is the main image.
              </p>
            </div>
            <ImageUpload
              placeId={place.id}
              images={images}
              onImagesChange={setImages}
              disabled={isPending}
              maxImages={6}
            />
          </div>

          {/* Name Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Name</h2>
              <p className="mt-1 text-sm text-gray-600">
                What&apos;s your place called?
              </p>
            </div>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div>
                    <Input
                      id="place-name"
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Luna Bistro"
                      disabled={isPending}
                      autoComplete="off"
                      className="h-12 border-2 border-gray-300 text-base font-medium focus-visible:ring-[#fd5564]"
                    />
                    {isInvalid && field.state.meta.errors.length > 0 && (
                      <p className="mt-2 text-sm text-red-600">
                        {typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : (field.state.meta.errors[0] as { message?: string })?.message}
                      </p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          </div>

          {/* Description Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Description</h2>
              <p className="mt-1 text-sm text-gray-600">
                What makes it special?
              </p>
            </div>
            <form.Field name="description">
              {(field) => (
                <Textarea
                  id="place-description"
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={5}
                  placeholder="Tell us about the vibe, menu, atmosphere..."
                  disabled={isPending}
                  className="resize-none border-2 border-gray-300 text-base leading-relaxed focus-visible:ring-[#fd5564]"
                />
              )}
            </form.Field>
          </div>

          {/* Coordinates Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Location</h2>
              <p className="mt-1 text-sm text-gray-600">
                Click on the map to update your place&apos;s location
              </p>
            </div>
            <form.Field name="coordinates">
              {(field) => (
                <MapPicker
                  value={field.state.value}
                  onChange={(coords) => handleCoordinatesChange(coords, field.handleChange)}
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>

          {/* Address Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Address</h2>
              <p className="mt-1 text-sm text-gray-600">
                Auto-filled from map location, or enter manually
              </p>
            </div>
            <form.Field name="address">
              {(field) => (
                <div className="relative">
                  {isGeocoding ? (
                    <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
                  ) : (
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  )}
                  <Input
                    id="place-address"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={isGeocoding ? "Fetching address..." : "123 Main St, City, Country"}
                    disabled={isPending || isGeocoding}
                    autoComplete="off"
                    className="h-12 border-2 border-gray-300 pl-12 text-base focus-visible:ring-[#fd5564]"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="h-14 w-full rounded-full bg-white text-lg font-bold text-[#fd5564] shadow-2xl hover:scale-[1.02] hover:bg-gray-50 disabled:hover:scale-100"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving changes...
                </>
              ) : (
                "Save changes"
              )}
            </Button>

            <Button
              type="button"
              onClick={() => router.push(routes.business.places.detail(String(place.id)))}
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-full text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </GradientBackground>
  );
}
