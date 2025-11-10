"use client"

import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { MapPinIcon, StoreIcon } from "lucide-react"
import { useState } from "react"
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
import { FormActions } from "./FormActions"
import { useMutation } from "@tanstack/react-query"
import { onboardUserOptions } from "@/data-acess/users"

import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  userType: z.enum(["explorer", "business"], {
    message: "Please select a user type.",
  }),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),
})

export function OnboardingForm() {
  const [selectedUserType, setSelectedUserType] = useState<
    "explorer" | "business" | null
  >(null)

  const { user } = useUser()
  const router = useRouter()


  const { mutate: onBoardUser, isPending } = useMutation({
    ...onboardUserOptions,
    throwOnError: false,
    onError: (error) => {
      error.match({
        Unauthenticated: () => {
          toast.error("You must be logged in to complete onboarding.")
        },
        OrElse: () => {
          toast.error("An unexpected error occurred. Please try again.")
        }
      })
    },
    onSuccess: async () => {
      // Reload user to ensure publicMetadata is fresh
      await user?.reload()
      const role =
        selectedUserType ??
        ((user?.publicMetadata as Record<string, unknown>)?.role as "explorer" | "business" | undefined)
      router.replace(role === "business" ? "/business" : "/explorer")
    }
  })

  const form = useForm({
    defaultValues: {
      userType: "" as "explorer" | "business",
      fullName: user?.fullName || "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
      onBoardUser(value)
    },
  })

  return (
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
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <FieldSet>
                    <FieldLegend variant="label">I want to...</FieldLegend>
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
                      disabled={isPending}
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
            </form.Field>

            {/* Basic Information */}
            {selectedUserType && (
              <form.Field
                name="fullName"
              >
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                      <Input
                        id="fullName"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isPending}
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
              </form.Field>
            )}
          </FieldGroup>

          {/* Submit Button */}
          <FormActions
            selectedUserType={selectedUserType}
            onReset={() => form.reset()}
            isLoading={isPending}
          />
        </form>
      </CardContent>
    </Card>
  )
}

