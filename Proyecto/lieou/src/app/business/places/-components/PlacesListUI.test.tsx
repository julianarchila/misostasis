/**
 * @vitest-environment jsdom
 */

import * as React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { PlacesListUI } from "./PlacesListUI";
import type { Place } from "@/server/schemas/place";

afterEach(() => {
  cleanup();
});

describe("PlacesListUI", () => {
  it("shows message when there are no places", () => {
    render(<PlacesListUI places={[]} />);
    expect(
      screen.getByText("No places yet. Create your first place!")
    ).toBeDefined();
  });

  it("renders places when provided", () => {
    const places: Place[] = [
      {
        id: 1,
        business_id: 101,
        name: "Test Place",
        description: "A cool description",
        coordinates: { x: -74.0721, y: 4.7110 },
        address: "Bogotá",
        created_at: new Date(),
      },
      {
        id: 2,
        business_id: 101,
        name: "Another Place",
        description: null,
        coordinates: null,
        address: null,
        created_at: new Date(),
      },
    ];

    render(<PlacesListUI places={places} />);

    // Names
    expect(screen.getByText("Test Place")).toBeDefined();
    expect(screen.getByText("Another Place")).toBeDefined();

    // Locations
    expect(screen.getByText("Bogotá")).toBeDefined();

    // 2 view links
    const links = screen.getAllByRole("link", { name: "View" });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("href")).toBe("/business/places/1");
    expect(links[1].getAttribute("href")).toBe("/business/places/2");
  });

  it("renders images when available and fallback when missing", () => {
    const places: Place[] = [
      {
        id: 1,
        business_id: 101,
        name: "Place with Image",
        description: "Has an image",
        coordinates: { x: -74.0721, y: 4.7110 },
        address: "Bogotá",
        created_at: new Date(),
        images: [
          {
            id: 1,
            place_id: 1,
            url: "https://example.com/image.jpg",
          },
        ],
      },
      {
        id: 2,
        business_id: 101,
        name: "Place without Image",
        description: "No images",
        coordinates: null,
        address: null,
        created_at: new Date(),
        images: [],
      },
    ];

    render(<PlacesListUI places={places} />);

    // Check that images are rendered
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(images[0].getAttribute("alt")).toBe("Place with Image");
    expect(images[0].getAttribute("src")).toContain("example.com");
  });
});
