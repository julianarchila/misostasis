"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlaceFormActions } from "./PlaceFormActions";
import { useCreatePlaceForm } from "./useCreatePlaceForm";

export function PlaceForm() {
  const { form, isPending } = useCreatePlaceForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {/* Name Field */}
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="place-name">Place Name</FieldLabel>
                  <Input
                    id="place-name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g. Luna Bistro"
                    disabled={isPending}
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Choose a memorable name for your place
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Description Field */}
          <form.Field name="description">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="place-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="place-description"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    rows={4}
                    placeholder="Short description to highlight your place..."
                    disabled={isPending}
                    className="min-h-[100px]"
                  />
                  <FieldDescription>
                    Keep it concise and engaging (optional)
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {/* Location Field */}
          <form.Field name="location">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="place-location">Location</FieldLabel>
                  <Input
                    id="place-location"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g. 123 Main St, New York, NY"
                    disabled={isPending}
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Address or location details (optional)
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <PlaceFormActions onReset={() => form.reset()} isLoading={isPending} />
    </form>
  );
}
