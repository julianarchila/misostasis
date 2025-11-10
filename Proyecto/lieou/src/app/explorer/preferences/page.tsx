"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ExplorerPreferencesPage() {
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 600); // mock
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldSet>
        <FieldLegend>Discovery</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldTitle>Max distance (km)</FieldTitle>
            <FieldContent>
              <Input type="number" min={1} max={200} placeholder="10" />
              <FieldDescription>We’ll prioritize places within this range.</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Price preference</FieldTitle>
            <FieldContent>
              <RadioGroup defaultValue="any" className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="price-any" value="any" />
                  <Label htmlFor="price-any">Any</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="price-$" value="$" />
                  <Label htmlFor="price-$">$</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="price-$$" value="$$" />
                  <Label htmlFor="price-$$">$$</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="price-$$$" value="$$$" />
                  <Label htmlFor="price-$$$">$$$</Label>
                </div>
              </RadioGroup>
              <FieldDescription>Select what best fits your typical outings.</FieldDescription>
            </FieldContent>
          </Field>

          <Field orientation="horizontal">
            <FieldLabel htmlFor="notify">
              <span className="text-sm font-medium">Notifications</span>
            </FieldLabel>
            <FieldContent>
              <div className="flex items-center gap-2">
                <Input id="notify" type="checkbox" className="h-4 w-4" />
                <Label htmlFor="notify" className="text-sm">Notify me about new matches</Label>
              </div>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>About you</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldTitle>Bio or notes</FieldTitle>
            <FieldContent>
              <Textarea placeholder="Tell us what you like to explore..." rows={4} />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-[#6c47ff] text-white">
          {loading ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}


