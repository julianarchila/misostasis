"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEditPlaceForm } from "./useEditPlaceForm";
import { ImageUpload } from "../../../-components/ImageUpload";
import { ChevronLeft, Eye, Pencil, MapPin, Loader2, X } from "lucide-react";
import type { Place } from "@/server/schemas/place";
import { routes } from "@/lib/routes";

interface PlaceEditFormProps {
  place: Place;
}

export function PlaceEditForm({ place }: PlaceEditFormProps) {
  const router = useRouter();
  const { form, isPending, removeExistingImage } = useEditPlaceForm({ place });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  const existingImages = form.getFieldValue("existingImages");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fd5564] via-[#fe6f5d] to-[#ff8a5b] overflow-hidden pb-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

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
          {/* Existing Photos Section */}
          {existingImages.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Current Photos</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Remove photos you no longer want
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`group relative overflow-hidden rounded-xl ${
                      index === 0 && existingImages.length > 1 ? "col-span-3 aspect-[4/3]" : "aspect-square"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      disabled={isPending}
                      className="absolute right-2 top-2 rounded-full bg-white/95 p-2 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900">
                        Main photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Photos Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Photos</h2>
              <p className="mt-1 text-sm text-gray-600">
                Upload additional photos for your place
              </p>
            </div>
            <form.Field name="files">
              {(field) => (
                <ImageUpload
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                  disabled={isPending}
                  maxImages={6 - existingImages.length}
                />
              )}
            </form.Field>
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
                          : field.state.meta.errors[0]?.message}
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

          {/* Location Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Location</h2>
              <p className="mt-1 text-sm text-gray-600">
                Where can people find you?
              </p>
            </div>
            <form.Field name="location">
              {(field) => (
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="place-location"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="123 Main St, City, State"
                    disabled={isPending}
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
    </div>
  );
}
