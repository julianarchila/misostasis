/**
 * @vitest-environment jsdom
 */

import * as React from "react"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { describe, expect, it, vi, afterEach, beforeAll } from "vitest"

import { SwipeDeck } from "../SwipeDeck"
import type { PlaceWithDistance } from "@/server/schemas/place"

// Mock browser APIs for Embla Carousel
beforeAll(() => {
  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    root = null
    rootMargin = ""
    thresholds = []
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  })

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: MockResizeObserver,
  })
})

const createPlaces = (): PlaceWithDistance[] => [
  {
    id: 1,
    business_id: 1,
    name: "First Place",
    description: "First description",
    coordinates: { x: -74.0721, y: 4.7110 },
    address: "Location 1",
    created_at: null,
    images: [{ id: 1, place_id: 1, url: "https://example.com/first.jpg" }],
    distance_km: 1.5,
  },
  {
    id: 2,
    business_id: 1,
    name: "Second Place",
    description: "Second description",
    coordinates: { x: -74.0621, y: 4.7210 },
    address: "Location 2",
    created_at: null,
    images: [{ id: 2, place_id: 2, url: "https://example.com/second.jpg" }],
    distance_km: 2.3,
  },
]

afterEach(() => {
  cleanup()
})

describe("SwipeDeck", () => {
  it("renders the first place and advances after liking with the button", async () => {
    const places = createPlaces()
    const onSave = vi.fn()
    const onDiscard = vi.fn()

    render(<SwipeDeck places={places} onSave={onSave} onDiscard={onDiscard} />)

    expect(screen.getAllByText(places[0].name)[0]).toBeDefined()
    const likeButton = screen.getAllByLabelText("Like")
    expect(likeButton[0]).toBeDefined()
    fireEvent.click(likeButton[0])

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(places[0])
    await screen.findAllByText(places[1].name)
    expect(onDiscard).not.toHaveBeenCalled()
  })

  it("renders the first place and advances after passing with the button", async () => {
    const places = createPlaces()
    const onSave = vi.fn()
    const onDiscard = vi.fn()

    render(<SwipeDeck places={places} onSave={onSave} onDiscard={onDiscard} />)

    expect(screen.getAllByText(places[0].name)[0]).toBeDefined()
    const passButton = screen.getAllByLabelText("Pass")
    expect(passButton[0]).toBeDefined()
    fireEvent.click(passButton[0])

    expect(onDiscard).toHaveBeenCalledTimes(1)
    expect(onDiscard).toHaveBeenCalledWith(places[0])
    await screen.findAllByText(places[1].name)
    expect(onSave).not.toHaveBeenCalled()
  })

  it("renders completion message immediately when places is empty", () => {
    const onSave = vi.fn()
    const onDiscard = vi.fn()

    render(<SwipeDeck places={[]} onSave={onSave} onDiscard={onDiscard} />)

    expect(screen.getAllByText("You've seen all places nearby!")[0]).toBeDefined()
    expect(onSave).not.toHaveBeenCalled()
    expect(onDiscard).not.toHaveBeenCalled()
  })
})
