# Effect Schema Patterns

This document describes the recommended patterns for defining and reusing schemas across the application using Effect Schema.

## Table of Contents

- [Overview](#overview)
- [The Pattern](#the-pattern)
- [Why This Pattern?](#why-this-pattern)
- [Schema Structure](#schema-structure)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Overview

We use **Effect Schema** as the single source of truth for validation across the entire application stack:
- **Forms** (TanStack Form + Shadcn UI)
- **API Payloads** (RPC endpoints)
- **Database Operations** (via services and repositories)

The key challenge is that forms and APIs have different requirements:
- **Forms**: All fields must be present (nullable for optional fields)
- **APIs**: Optional fields can be omitted from the payload entirely

---

## The Pattern

**Separate Form and API schemas with shared validation rules**

### Structure

```typescript
// 1. Define shared validation rules (single source of truth)
const FieldNameValidation = Schema.String.pipe(
  Schema.minLength(3, { message: () => "Must be at least 3 characters" }),
  Schema.maxLength(100, { message: () => "Must be at most 100 characters" }),
  Schema.trimmed()
)

// 2. Form schema - all fields present, nullable for optional
export const CreateEntityFormSchema = Schema.Struct({
  requiredField: FieldNameValidation,
  optionalField: Schema.NullOr(FieldNameValidation), // nullable, not optional
})

// 3. API schema - optional fields can be omitted
export const CreateEntityPayloadSchema = Schema.Struct({
  requiredField: FieldNameValidation,
  optionalField: Schema.optional(Schema.NullOr(FieldNameValidation)),
})

// 4. Export types
export type CreateEntityFormValues = Schema.Schema.Type<typeof CreateEntityFormSchema>
export type CreateEntityPayload = Schema.Schema.Type<typeof CreateEntityPayloadSchema>
```

### Key Differences

| Aspect | Form Schema | API Schema |
|--------|-------------|------------|
| Optional fields | `Schema.NullOr(Validation)` | `Schema.optional(Schema.NullOr(Validation))` |
| Type signature | `{ field: string \| null }` | `{ field?: string \| null }` |
| Default values | Must provide all fields | Can omit optional fields |
| TanStack Form | ✅ Compatible | ❌ Type errors |

---

## Why This Pattern?

### ✅ Advantages

1. **Single Source of Truth**: Validation rules defined once, reused everywhere
2. **Type Safety**: Full TypeScript inference for both contexts
3. **TanStack Form Compatibility**: Works seamlessly without type gymnastics
4. **Explicit and Clear**: Easy to see what forms vs APIs expect
5. **Maintainable**: Changes to validation rules update both schemas automatically
6. **No Duplication**: No need for separate Zod schemas

### ❌ What We Avoid

```typescript
// ❌ Don't duplicate validation rules
const zodSchema = z.object({
  name: z.string().min(3).max(100), // Duplicates Effect Schema rules
})

// ❌ Don't try to use API schemas directly in forms
export const CreatePlaceFormSchema = CreatePlacePayloadSchema // Type errors!

// ❌ Don't define validation inline
export const CreatePlaceFormSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(3)), // Hard to reuse
})
```

---

## Schema Structure

Every domain schema file should follow this structure:

```typescript
import { Schema } from "effect"

// ============================================================================
// Primitives
// ============================================================================

const NullableString = Schema.NullOr(Schema.String)
const NullableDate = Schema.NullOr(Schema.Date)

// ============================================================================
// Shared Field Validations
// ============================================================================

/**
 * Field validation - description of rules
 */
const FieldNameValidation = Schema.String.pipe(
  Schema.minLength(3, { message: () => "Error message" }),
  Schema.maxLength(100, { message: () => "Error message" }),
  Schema.trimmed()
)

// For nullable fields, wrap the validation:
const OptionalFieldValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(500, { message: () => "Error message" })
  )
)

// ============================================================================
// Entity Schemas (Database representation)
// ============================================================================

export const EntitySchema = Schema.Struct({
  id: Schema.Number,
  name: FieldNameValidation,
  description: OptionalFieldValidation,
  created_at: NullableDate,
})

// ============================================================================
// Form Schemas (for TanStack Form)
// ============================================================================

export const CreateEntityFormSchema = Schema.Struct({
  name: FieldNameValidation,
  description: OptionalFieldValidation, // NullOr, not optional
})

export const UpdateEntityFormSchema = Schema.Struct({
  name: FieldNameValidation,
  description: OptionalFieldValidation,
})

// ============================================================================
// API Payload Schemas (for RPC/HTTP endpoints)
// ============================================================================

export const CreateEntityPayloadSchema = Schema.Struct({
  name: FieldNameValidation,
  description: Schema.optional(OptionalFieldValidation),
})

export const UpdateEntityPayloadSchema = Schema.Struct({
  name: Schema.optional(FieldNameValidation),
  description: Schema.optional(OptionalFieldValidation),
})

// ============================================================================
// Types
// ============================================================================

export type Entity = Schema.Schema.Type<typeof EntitySchema>
export type CreateEntityFormValues = Schema.Schema.Type<typeof CreateEntityFormSchema>
export type CreateEntityPayload = Schema.Schema.Type<typeof CreateEntityPayloadSchema>
export type UpdateEntityFormValues = Schema.Schema.Type<typeof UpdateEntityFormSchema>
export type UpdateEntityPayload = Schema.Schema.Type<typeof UpdateEntityPayloadSchema>
```

---

## Usage Examples

### Example 1: Place Schema (Real Implementation)

See `src/server/schemas/place.ts` for the complete implementation.

**Highlights:**

```typescript
// Shared validation
const PlaceNameValidation = Schema.String.pipe(
  Schema.minLength(3, { message: () => "Place name must be at least 3 characters" }),
  Schema.maxLength(100, { message: () => "Place name must be at most 100 characters" }),
  Schema.trimmed()
)

const PlaceDescriptionValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(500, { message: () => "Description must be at most 500 characters" })
  )
)

// Form schema (for TanStack Form)
export const CreatePlaceFormSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
  location: PlaceLocationValidation,
})

// API schema (for RPC)
export const CreatePlacePayloadSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: Schema.optional(PlaceDescriptionValidation),
  location: Schema.optional(PlaceLocationValidation),
})
```

### Example 2: Using in TanStack Form

```typescript
// src/app/business/places/-components/useCreatePlaceForm.ts
import { useForm } from "@tanstack/react-form"
import { Schema } from "effect"
import { CreatePlaceFormSchema } from "@/server/schemas/place"

export function useCreatePlaceForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      description: null as string | null,
      location: null as string | null,
    },
    validators: {
      // Convert Effect Schema to Standard Schema V1 for TanStack Form
      onSubmit: Schema.standardSchemaV1(CreatePlaceFormSchema),
    },
    onSubmit: async ({ value }) => {
      // Transform form data to API payload
      createPlace({
        name: value.name,
        description: value.description || null,
        location: value.location || null,
      })
    },
  })

  return { form }
}
```

**Key points:**
- Use `Schema.standardSchemaV1()` to convert Effect Schema for TanStack Form
- Default values must include all fields (use `null` for nullable fields)
- Transform data in `onSubmit` if needed

### Example 3: Handling Nullable Fields in React

```tsx
// src/app/business/places/-components/PlaceForm.tsx
<form.Field name="description">
  {(field) => (
    <Textarea
      value={field.state.value ?? ""}  // Convert null to empty string
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

**Why?** Input elements expect `string`, but form values can be `string | null`. Use nullish coalescing (`??`) to provide a default empty string.

### Example 4: Using in RPC Handlers

```typescript
// src/server/rpc/groups/place.rpcs.ts
import { Rpc, RpcGroup } from "@effect/rpc"
import { CreatePlacePayloadSchema } from "@/server/schemas/place"

export class PlaceRpcs extends RpcGroup.make(
  Rpc.make("Create", {
    payload: CreatePlacePayloadSchema, // Use API schema, not form schema
    error: Unauthenticated
  })
).prefix("Place").middleware(AuthMiddleware) { }
```

---

## Best Practices

### 1. **Always Define Shared Validations**

```typescript
// ✅ Good - reusable
const EmailValidation = Schema.String.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: () => "Invalid email format"
  })
)

// ❌ Bad - not reusable
export const UserFormSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  )
})
```

### 2. **Use Descriptive Names**

```typescript
// ✅ Good
const PlaceNameValidation = Schema.String.pipe(...)

// ❌ Bad
const name = Schema.String.pipe(...)
const validation1 = Schema.String.pipe(...)
```

### 3. **Document Your Schemas**

```typescript
/**
 * Place description validation - optional, max 500 characters when present
 */
const PlaceDescriptionValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(500, { message: () => "Description must be at most 500 characters" })
  )
)
```

### 4. **Nullable vs Optional**

```typescript
// For FORMS: Use NullOr (field must be present, can be null)
const FormSchema = Schema.Struct({
  optionalField: Schema.NullOr(Schema.String) // { optionalField: string | null }
})

// For APIs: Use optional (field can be omitted)
const APISchema = Schema.Struct({
  optionalField: Schema.optional(Schema.NullOr(Schema.String)) // { optionalField?: string | null }
})
```

### 5. **Validation on Nullable Fields**

```typescript
// ✅ Good - validate the string, then make it nullable
const DescriptionValidation = Schema.NullOr(
  Schema.String.pipe(
    Schema.maxLength(500)
  )
)

// ❌ Bad - can't pipe on nullable
const DescriptionValidation = Schema.NullOr(Schema.String).pipe(
  Schema.maxLength(500) // Type error!
)
```

### 6. **Keep Forms and APIs Separate**

```typescript
// ✅ Good - separate schemas
export const CreatePlaceFormSchema = Schema.Struct({ ... })
export const CreatePlacePayloadSchema = Schema.Struct({ ... })

// ❌ Bad - trying to use one for both
export const CreatePlaceSchema = Schema.Struct({ ... })
// Used in both form and API - will cause issues
```

---

## Migration Guide

If you have existing Zod schemas:

1. **Extract validation rules** to shared Effect Schema validations
2. **Create form schema** using the shared validations (no optional fields)
3. **Create API schema** using the shared validations (with optional fields)
4. **Update forms** to use `Schema.standardSchemaV1(FormSchema)`
5. **Update RPC contracts** to use the API schema
6. **Remove Zod dependencies**

Example:

```typescript
// Before (Zod)
const placeFormSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500),
})

// After (Effect Schema)
const PlaceNameValidation = Schema.String.pipe(
  Schema.minLength(3),
  Schema.maxLength(100)
)

const PlaceDescriptionValidation = Schema.NullOr(
  Schema.String.pipe(Schema.maxLength(500))
)

export const CreatePlaceFormSchema = Schema.Struct({
  name: PlaceNameValidation,
  description: PlaceDescriptionValidation,
})
```

---

## Common Issues

### Issue 1: Type Error in Form Validators

**Problem:**
```typescript
validators: {
  onSubmit: CreatePlaceFormSchema, // Type error!
}
```

**Solution:**
```typescript
validators: {
  onSubmit: Schema.standardSchemaV1(CreatePlaceFormSchema), // ✅
}
```

### Issue 2: Nullable Field Type Errors in Inputs

**Problem:**
```typescript
<Input value={field.state.value} /> // Type error: null not assignable to string
```

**Solution:**
```typescript
<Input value={field.state.value ?? ""} /> // ✅
```

### Issue 3: Optional Fields in Forms

**Problem:**
```typescript
export const FormSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)), // Type errors in TanStack Form
})
```

**Solution:**
```typescript
export const FormSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.NullOr(Schema.String), // ✅ No optional
})
```

---

## Additional Resources

- [Effect Schema Documentation](https://effect.website/docs/schema/introduction)
- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Standard Schema V1 Spec](https://github.com/standard-schema/standard-schema)
- Project Examples:
  - `src/server/schemas/place.ts` - Complete place schema implementation
  - `src/server/schemas/user.ts` - User schema with validation
  - `src/app/business/places/-components/useCreatePlaceForm.ts` - Form usage
