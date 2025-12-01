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
import { ImageUpload } from "./ImageUpload";

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
                    value={field.state.value ?? ""}
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
                    value={field.state.value ?? ""}
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
                    value={field.state.value ?? ""}
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

          {/* Image Upload Field */}
          <form.Field name="files">
            {(field) => (
              <Field>
                <FieldLabel>Images</FieldLabel>
                <ImageUpload
                  value={field.state.value}
                  onChange={(files) => field.handleChange(files)}
                  disabled={isPending}
                />
                <FieldDescription>
                  Upload images of your place
                </FieldDescription>
              </Field>
            )}
          </form.Field>
          
          {/* Google Maps Link Field */}
          <form.Field name="maps_url">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="place-maps">Google Maps Link</FieldLabel>
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
                />
                <FieldDescription>
                  Opcional: Pega el link de &quot;Compartir&quot; de Google Maps.
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Tag Field */}
          <form.Field name="tag">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="place-tag">Categoría principal</FieldLabel>
                <Input
                  id="place-tag"
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej. Cafetería"
                  disabled={isPending}
                  autoComplete="off"
                />
                <FieldDescription>
                  Opcional: Añade una categoría para este lugar.
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <PlaceFormActions onReset={() => form.reset()} isLoading={isPending} />
    </form>
  );
}
