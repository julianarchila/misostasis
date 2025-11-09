"use client"

import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { MapPinIcon, StoreIcon, SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

const formSchema = z
  .object({
    userType: z.enum(["explorer", "business"]),
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be at most 50 characters."),
    businessName: z.string(),
    location: z
      .string()
      .min(2, "Location must be at least 2 characters.")
      .max(100, "Location must be at most 100 characters."),
  })
  .superRefine((data, ctx) => {
    // Validate user type selection
    if (!data.userType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a user type.",
        path: ["userType"],
      })
    }
    // Require business name if user type is business
    if (data.userType === "business" && !data.businessName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business name is required.",
        path: ["businessName"],
      })
    }
  })

export default function OnboardingPage() {
  const [selectedUserType, setSelectedUserType] = useState<
    "explorer" | "business" | null
  >(null)

  const form = useForm({
    defaultValues: {
      userType: "" as "explorer" | "business",
      fullName: "",
      businessName: "",
      location: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
      // TODO: Connect to backend
      alert(
        `Welcome ${value.fullName}! Your ${value.userType} account is being created.`
      )
    },
  })

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-pink-50 via-orange-50 to-rose-50 dark:from-pink-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
      <div className="container mx-auto min-h-full px-4 py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-2 text-white shadow-lg">
              <SparklesIcon className="size-5" />
              <span className="font-semibold">Welcome to Lieou</span>
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
              Let&apos;s get started
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover amazing places or share your business with explorers
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Complete your profile</CardTitle>
              <CardDescription>
                Just a few quick details to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
                className="space-y-6"
              >
                <FieldGroup>
                  {/* User Type Selection */}
                  <form.Field
                    name="userType"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        !field.state.meta.isValid
                      return (
                        <FieldSet>
                          <FieldLegend variant="label">
                            I want to...
                          </FieldLegend>
                          <FieldDescription>
                            Choose how you&apos;ll use Lieou
                          </FieldDescription>
                          <RadioGroup
                            name={field.name}
                            value={field.state.value}
                            onValueChange={(value) => {
                              field.handleChange(value as "explorer" | "business")
                              setSelectedUserType(value as "explorer" | "business")
                            }}
                          >
                            <FieldLabel
                              htmlFor="usertype-explorer"
                              className="cursor-pointer"
                            >
                              <Field
                                orientation="horizontal"
                                data-invalid={isInvalid}
                              >
                                <FieldContent>
                                  <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500">
                                      <MapPinIcon className="size-5 text-white" />
                                    </div>
                                    <div>
                                      <FieldTitle>Explore places</FieldTitle>
                                      <FieldDescription>
                                        Discover new spots and experiences
                                      </FieldDescription>
                                    </div>
                                  </div>
                                </FieldContent>
                                <RadioGroupItem
                                  value="explorer"
                                  id="usertype-explorer"
                                  aria-invalid={isInvalid}
                                />
                              </Field>
                            </FieldLabel>

                            <FieldLabel
                              htmlFor="usertype-business"
                              className="cursor-pointer"
                            >
                              <Field
                                orientation="horizontal"
                                data-invalid={isInvalid}
                              >
                                <FieldContent>
                                  <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
                                      <StoreIcon className="size-5 text-white" />
                                    </div>
                                    <div>
                                      <FieldTitle>Showcase my business</FieldTitle>
                                      <FieldDescription>
                                        Reach explorers and grow your audience
                                      </FieldDescription>
                                    </div>
                                  </div>
                                </FieldContent>
                                <RadioGroupItem
                                  value="business"
                                  id="usertype-business"
                                  aria-invalid={isInvalid}
                                />
                              </Field>
                            </FieldLabel>
                          </RadioGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </FieldSet>
                      )
                    }}
                  />

                  {/* Basic Information */}
                  {selectedUserType && (
                    <>
                      <form.Field
                        name="fullName"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="fullName">
                                Full name
                              </FieldLabel>
                              <Input
                                id="fullName"
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="John Doe"
                                autoComplete="name"
                              />
                              <FieldDescription>
                                This is how you&apos;ll appear on Lieou
                              </FieldDescription>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />

                      <form.Field
                        name="location"
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="location">
                                Location
                              </FieldLabel>
                              <Input
                                id="location"
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="City, Country"
                                autoComplete="address-level2"
                              />
                              <FieldDescription>
                                {selectedUserType === "business"
                                  ? "Where is your business located?"
                                  : "Where would you like to explore?"}
                              </FieldDescription>
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )
                        }}
                      />
                    </>
                  )}

                  {/* Business-specific fields */}
                  {selectedUserType === "business" && (
                    <form.Field
                      name="businessName"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="businessName">
                              Business name
                            </FieldLabel>
                            <Input
                              id="businessName"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Your awesome business"
                              autoComplete="organization"
                            />
                            <FieldDescription>
                              The name of your business or venue
                            </FieldDescription>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  )}
                </FieldGroup>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg hover:from-pink-600 hover:to-orange-600"
                  >
                    {selectedUserType === "business"
                      ? "Create business account"
                      : selectedUserType === "explorer"
                        ? "Start exploring"
                        : "Continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-muted-foreground mt-8 text-center text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
