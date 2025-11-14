import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlaceOptions, getMyPlacesOptions } from "@/data-acess/places";
import { CreatePlaceFormSchema } from "@/server/schemas/place";
import { Schema } from "effect";

export function useCreatePlaceForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createPlace, isPending } = useMutation({
    ...createPlaceOptions,
    throwOnError: false,
    onError: (error) => {
      error.match({
        Unauthenticated: () => {
          toast.error("You must be logged in to create a place.");
        },
        OrElse: () => {
          toast.error("Failed to create place. Please try again.");
        },
      });
    },
    onSuccess: () => {
      toast.success("Place created successfully!");
      // Invalidate the my places query to refetch the list
      queryClient.invalidateQueries({
        queryKey: getMyPlacesOptions.queryKey
      });
      router.push("/business/places");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: null as string | null,
      location: null as string | null,
    },
    validators: {
      onSubmit: Schema.standardSchemaV1(CreatePlaceFormSchema),
    },
    onSubmit: async ({ value }) => {
      createPlace({
        name: value.name,
        description: value.description || null,
        location: value.location || null,
      });
    },
  });

  return { form, isPending };
}
