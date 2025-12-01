import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlaceOptions, getMyPlacesOptions } from "@/data-access/places";
import { CreatePlaceFormSchema } from "@/server/schemas/place";
import { Schema } from "effect";

export function useCreatePlaceForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createPlace, isPending: isCreatingPlace } = useMutation({
    ...createPlaceOptions,
    throwOnError: false,
    onError: (error) => {
      error.match({
        Unauthenticated: () => {
          toast.error("You must be logged in to create a place.");
        },
        UploadError: (e) => {
          toast.error(`Failed to upload image: ${e.fileName}`);
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

  // Schema that allows files in the form state
  const FormValidator = CreatePlaceFormSchema.pipe(
      Schema.omit("images"),
      Schema.extend(
        Schema.Struct({
          files: Schema.mutable(Schema.Array(Schema.Any)),
        })
      )
  );

  const form = useForm({
    defaultValues: {
      name: "",
      description: null as string | null,
      location: null as string | null,
      maps_url: null as string | null,
      tag: null as string | null,
      files: [] as File[],
    },
    validators: {
      onSubmit: Schema.standardSchemaV1(FormValidator),
    },
    onSubmit: async ({ value }) => {
      createPlace({
        name: value.name,
        description: value.description || null,
        location: value.location || null,
        maps_url: value.maps_url || null,
        tag: value.tag || null,
        files: value.files
      });
    },
  });

  return { form, isPending: isCreatingPlace || form.state.isSubmitting };
}
