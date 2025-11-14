import * as z from "zod";

export const placeFormSchema = z.object({
  name: z
    .string()
    .min(3, "Place name must be at least 3 characters.")
    .max(100, "Place name must be at most 100 characters."),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters."),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters."),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

export const placeFormDefaults: PlaceFormValues = {
  name: "",
  description: "",
  location: "",
};
