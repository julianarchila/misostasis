import { Schema } from "effect"

// ============================================================================
// Shared Field Validations
// ============================================================================

/**
 * User full name validation - must be at least 2 characters
 */
const UserFullNameValidation = Schema.String.pipe(
  Schema.minLength(2, { message: () => "Full name must be at least 2 characters" }),
  Schema.maxLength(100, { message: () => "Full name must be at most 100 characters" }),
  Schema.trimmed()
)

/**
 * User type validation - either "business" or "explorer"
 */
const UserTypeValidation = Schema.Union(
  Schema.Literal("business"),
  Schema.Literal("explorer")
)

// ============================================================================
// Entity Schemas
// ============================================================================

/**
 * User entity schema (minimal representation)
 */
export class User extends Schema.Class<User>("User")({
  id: Schema.String, // User's ID as a string
  name: Schema.String // User's name as a string
}) { }

// ============================================================================
// Form Schemas (for TanStack Form)
// ============================================================================

/**
 * Form schema for onboarding a user
 * - All fields are required
 * - Compatible with TanStack Form's type inference
 */
export const OnboardUserFormSchema = Schema.Struct({
  fullName: UserFullNameValidation,
  userType: UserTypeValidation
})

// ============================================================================
// API Payload Schemas (for RPC/HTTP endpoints)
// ============================================================================

/**
 * API payload for onboarding a user
 * - Matches the form schema (no optional fields)
 */
export const OnboardUserPayloadSchema = Schema.Struct({
  fullName: UserFullNameValidation,
  userType: UserTypeValidation
})

// Alias for backward compatibility
export const OnboardUserPayload = OnboardUserPayloadSchema

// ============================================================================
// Types
// ============================================================================

export type OnboardUserFormValues = Schema.Schema.Type<typeof OnboardUserFormSchema>
export type OnboardUserPayload = Schema.Schema.Type<typeof OnboardUserPayloadSchema>
