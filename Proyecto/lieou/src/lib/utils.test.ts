import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("merges class names and deduplicates correctly", () => {
    const r = cn("p-4", "p-4", "text-red-500")
    expect(r).toBe("p-4 text-red-500")
  })

  it("ignores falsy values", () => {
    const r = cn("px-2", false && "bg-blue", null as any, undefined as any, "")
    expect(r).toBe("px-2")
  })

  it("handles conditional classes", () => {
    const cond = true
    const r = cn("flex", cond && "items-center")
    expect(r).toBe("flex items-center")
  })

  it("removes conflicting Tailwind classes", () => {
    const r = cn("p-2", "p-4")
    expect(r).toBe("p-4")
  })

  it("handles arrays inside clsx", () => {
    const r = cn(["p-2", ["text-sm"]], "flex")
    expect(r).toBe("p-2 text-sm flex")
  })

  it("handles objects with boolean keys", () => {
    const r = cn("p-2", { "hidden": false, "block": true })
    expect(r).toBe("p-2 block")
  })

  it("handles multiple conflicting classes and keeps the last one", () => {
    const r = cn("text-red-500", "text-blue-500", "text-green-500")
    expect(r).toBe("text-green-500")
  })
})
