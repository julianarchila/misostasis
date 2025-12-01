import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMyPlacesOptions, updatePlaceOptions } from "@/data-access/places";
import { UpdatePlaceFormSchema, type Place, type Coordinates } from "@/server/schemas/place";
import { Schema } from "effect";
import { routes } from "@/lib/routes";

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

  // Form schema - images are handled separately now
  const FormValidator = UpdatePlaceFormSchema.pipe(
    Schema.omit("images")
  );

  const form = useForm({
    defaultValues: {
      name: place.name,
      description: place.description ?? null,
      coordinates: place.coordinates ?? null as Coordinates | null,
      address: place.address ?? null,
    },
    validators: {
      onSubmit: Schema.standardSchemaV1(FormValidator),
    },
    onSubmit: async ({ value }) => {
      // Only update place metadata - images are managed independently
      updatePlace({
        id: place.id,
        name: value.name,
        description: value.description,
        coordinates: value.coordinates,
        address: value.address,
      });
    },
  });

  return {
    form,
    isPending: isUpdatingPlace || form.state.isSubmitting,
  };
}
