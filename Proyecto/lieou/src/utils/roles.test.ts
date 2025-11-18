import { describe, it, expect, vi, beforeEach } from "vitest"
import { checkRole, getRole } from "./roles"
import { auth } from "@clerk/nextjs/server"

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn()
}))

describe("roles utils", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("checkRole returns true when roles match", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: { metadata: { role: "business" } }
    })

    const result = await checkRole("business")
    expect(result).toBe(true)
  })

  it("checkRole returns false when roles mismatch", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: { metadata: { role: "explorer" } }
    })

    const result = await checkRole("business")
    expect(result).toBe(false)
  })

  it("checkRole returns false when sessionClaims is null", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: null
    })

    const result = await checkRole("business")
    expect(result).toBe(false)
  })

  it("checkRole returns false when metadata is missing", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: {}
    })

    const result = await checkRole("business")
    expect(result).toBe(false)
  })

  it("getRole returns role", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: { metadata: { role: "explorer" } }
    })

    const result = await getRole()
    expect(result).toBe("explorer")
  })

  it("getRole returns undefined when role missing", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: { metadata: {} }
    })

    const result = await getRole()
    expect(result).toBeUndefined()
  })

  it("getRole returns undefined when metadata missing", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: {}
    })

    const result = await getRole()
    expect(result).toBeUndefined()
  })

  it("getRole returns undefined when sessionClaims null", async () => {
    ;(auth as any).mockResolvedValue({
      sessionClaims: null
    })

    const result = await getRole()
    expect(result).toBeUndefined()
  })
})