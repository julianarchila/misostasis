import { describe, it, expect, beforeEach } from "vitest"
import { mockPlaces, type Place } from "./mockPlaces"

describe("mockPlaces dataset", () => {
  let data: Place[]

  beforeEach(() => {
    // Clonar para prevenir mutaciones accidentales
    data = structuredClone(mockPlaces)
  })

  it("should be an array", () => {
    expect(Array.isArray(data)).toBe(true)
  })

  it("should contain at least 1 place", () => {
    expect(data.length).toBeGreaterThan(0)
  })

  it("should not be empty", () => {
    expect(data.length).toBe(5)
  })


  it("each item should contain the required fields with correct types", () => {
    data.forEach((p) => {
      expect(typeof p.id).toBe("string")
      expect(typeof p.name).toBe("string")
      expect(typeof p.photoUrl).toBe("string")
      expect(typeof p.description).toBe("string")
      expect(
        ["Restaurant", "Park", "Cafe", "Museum", "Bar", "Other"].includes(
          p.category
        )
      ).toBe(true)
    })
  })


  it("ids should be unique", () => {
    const ids = data.map((p) => p.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it("each id should follow the format 'p<number>'", () => {
    data.forEach((p) => {
      expect(/^p\d+$/.test(p.id)).toBe(true)
    })
  })


  it("names should be non-empty and properly formatted", () => {
    data.forEach((p) => {
      expect(p.name.length).toBeGreaterThan(0)
      expect(/^[A-Za-z0-9 .'-]+$/.test(p.name)).toBe(true)
    })
  })

  it("names should be unique", () => {
    const names = data.map((p) => p.name.toLowerCase())
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it("photoUrl should be a valid HTTP/HTTPS URL", () => {
    data.forEach((p) => {
      expect(() => new URL(p.photoUrl)).not.toThrow()
      expect(p.photoUrl.startsWith("https://")).toBe(true)
    })
  })

  it("photoUrl should include a picsum seed", () => {
    data.forEach((p) =>
      expect(p.photoUrl.includes("/seed/")).toBe(true)
    )
  })

  it("all categories should be valid", () => {
    const allowed = ["Restaurant", "Park", "Cafe", "Museum", "Bar", "Other"]
    data.forEach((p) => {
      expect(allowed.includes(p.category)).toBe(true)
    })
  })

  it("should contain at least one place per known category except 'Other'", () => {
    const categories = data.map((p) => p.category)
    expect(categories).toContain("Restaurant")
    expect(categories).toContain("Park")
    expect(categories).toContain("Cafe")
    expect(categories).toContain("Museum")
    expect(categories).toContain("Bar")
  })

  it("descriptions should not be empty", () => {
    data.forEach((p) => {
      expect(p.description.length).toBeGreaterThan(20)
    })
  })

  it("descriptions should be human-readable text", () => {
    data.forEach((p) => {
      expect(/^[A-Za-z0-9 '".,\-–:]+/.test(p.description)).toBe(true)
    })
  })

  it("should not allow mutation of the dataset", () => {
    // Mutación local permitida
    data[0].name = "Changed Name"
    expect(data[0].name).toBe("Changed Name")

    // Pero mockPlaces original debe permanecer intacto
    expect(mockPlaces[0].name).toBe("Luna Bistro")
  })

  it("should not accidentally mutate the exported array", () => {
    // Intento de push local
    data.push({
      id: "p999",
      name: "Fake Place",
      photoUrl: "https://example.com",
      category: "Other",
      description: "Fake item",
    })

    // El array original no cambia
    expect(mockPlaces.length).toBe(5)
  })

  it("should match the dataset snapshot", () => {
    expect(mockPlaces).toMatchSnapshot()
  })
})
