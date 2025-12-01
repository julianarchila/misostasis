"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlaceFormActions } from "./PlaceFormActions";
import { useCreatePlaceForm } from "./useCreatePlaceForm";
import { ImageUpload } from "./ImageUpload";
import { GradientBackground } from "@/components/GradientBackground";
import { Sparkles, MapPin, Link as LinkIcon, Tag } from "lucide-react";

export function PlaceForm() {
  const { form, isPending } = useCreatePlaceForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <GradientBackground>
      <div className="relative mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white">
            Add your place
          </h1>
          <p className="mt-2 text-pretty text-lg text-white/90">
            Show the world what makes it special
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Photos</h2>
              <p className="mt-1 text-sm text-gray-600">
                Add at least one photo of your place
              </p>
            </div>
            <form.Field name="files">
              {(field) => (
                <ImageUpload
                  files={field.state.value}
                  onFilesChange={(files) => field.handleChange(files)}
                  disabled={isPending}
                  maxImages={6}
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
                What makes it special? (Optional)
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
                Where can people find you? (Optional)
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

          {/* Google Maps Link Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Google Maps</h2>
              <p className="mt-1 text-sm text-gray-600">
                Paste the &quot;Share&quot; link from Google Maps (Optional)
              </p>
            </div>
            <form.Field name="maps_url">
              {(field) => (
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="place-maps"
                    type="url"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    disabled={isPending}
                    autoComplete="off"
                    className="h-12 border-2 border-gray-300 pl-12 text-base focus-visible:ring-[#fd5564]"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Category/Tag Section */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Category</h2>
              <p className="mt-1 text-sm text-gray-600">
                What type of place is this? (Optional)
              </p>
            </div>
            <form.Field name="tag">
              {(field) => (
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="place-tag"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Cafeteria, Restaurant, Bar..."
                    disabled={isPending}
                    autoComplete="off"
                    className="h-12 border-2 border-gray-300 pl-12 text-base focus-visible:ring-[#fd5564]"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Submit Button */}
          <PlaceFormActions onReset={() => form.reset()} isLoading={isPending} />
        </form>
      </div>
    </GradientBackground>
  );
}
