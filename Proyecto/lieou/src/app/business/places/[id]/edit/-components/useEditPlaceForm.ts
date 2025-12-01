import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMyPlacesOptions } from "@/data-access/places";
import { UpdatePlaceFormSchema, type Place } from "@/server/schemas/place";
import { Schema } from "effect";
import { routes } from "@/lib/routes";

interface ExistingImage {
  id: number;
  url: string;
}

interface UseEditPlaceFormOptions {
  place: Place;
}

export function useEditPlaceForm({ place }: UseEditPlaceFormOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Extract existing images from the place
  const existingImages: ExistingImage[] = (place.images ?? []).map((img) => ({
    id: img.id,
    url: img.url,
  }));

  // Schema that allows files in the form state
  const FormValidator = UpdatePlaceFormSchema.pipe(
    Schema.omit("images"),
    Schema.extend(
      Schema.Struct({
        files: Schema.mutable(Schema.Array(Schema.Any)),
        existingImages: Schema.mutable(Schema.Array(Schema.Any)),
      })
    )
  );

  const form = useForm({
    defaultValues: {
      name: place.name,
      description: place.description ?? null,
      location: place.location ?? null,
      files: [] as File[],
      existingImages: existingImages,
    },
    validators: {
      onSubmit: Schema.standardSchemaV1(FormValidator),
    },
    onSubmit: async ({ value }) => {
      // Mock save for now - will wire up to API later
      console.log("Saving place:", {
        id: place.id,
        name: value.name,
        description: value.description,
        location: value.location,
        existingImages: value.existingImages,
        newFiles: value.files,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Changes saved!");

      // Invalidate queries to refetch
      queryClient.invalidateQueries({
        queryKey: getMyPlacesOptions.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["places", place.id],
      });

      router.push(routes.business.places.detail(String(place.id)));
    },
  });

  const removeExistingImage = (imageId: number) => {
    const current = form.getFieldValue("existingImages");
    form.setFieldValue(
      "existingImages",
      current.filter((img) => img.id !== imageId)
    );
  };

  return {
    form,
    isPending: form.state.isSubmitting,
    existingImages: form.getFieldValue("existingImages"),
    removeExistingImage,
  };
}
