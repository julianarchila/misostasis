"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function BusinessNewPlacePage() {
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 700); // mock submit
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldSet>
        <FieldLegend>Basic info</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldTitle>Name</FieldTitle>
            <FieldContent>
              <Input placeholder="e.g. Luna Bistro" />
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Category</FieldTitle>
            <FieldContent>
              <RadioGroup defaultValue="Restaurant" className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {["Restaurant", "Park", "Cafe", "Museum", "Bar", "Other"].map((c) => {
                  const id = `cat-${c}`;
                  return (
                    <div key={c} className="flex items-center gap-2">
                      <RadioGroupItem id={id} value={c} />
                      <Label htmlFor={id}>{c}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Description</FieldTitle>
            <FieldContent>
              <Textarea rows={4} placeholder="Short description to highlight your place..." />
              <FieldDescription>Keep it concise and engaging.</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Photo URL</FieldTitle>
            <FieldContent>
              <Input placeholder="https://example.com/photo.jpg" />
              <FieldDescription>You can add a proper uploader later.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-[#6c47ff] text-white">
          {loading ? "Creating..." : "Create place"}
        </Button>
      </div>
    </form>
  );
}


