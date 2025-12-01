import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMyPlacesOptions, updatePlaceOptions } from "@/data-access/places";
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

  const { mutate: updatePlace, isPending: isUpdatingPlace } = useMutation({
    ...updatePlaceOptions,
    throwOnError: false,
    onError: (error) => {
      error.match({
        Unauthenticated: () => {
          toast.error("You must be logged in to update this place.");
        },
        PlaceNotFound: () => {
          toast.error("This place no longer exists or you don't have permission to edit it.");
        },
        UploadError: (e) => {
          toast.error(`Failed to upload image: ${e.fileName}`);
        },
        OrElse: () => {
          toast.error("Failed to update place. Please try again.");
        },
      });
    },
    onSuccess: () => {
      toast.success("Changes saved successfully!");
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
      updatePlace({
        id: place.id,
        name: value.name,
        description: value.description,
        location: value.location,
        existingImages: value.existingImages,
        files: value.files,
      });
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
    isPending: isUpdatingPlace || form.state.isSubmitting,
    existingImages: form.getFieldValue("existingImages"),
    removeExistingImage,
  };
}
