export {}

export type Roles = 'explorer' | 'business'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean
      role?: Roles
      email?: string
    }
  }
}
