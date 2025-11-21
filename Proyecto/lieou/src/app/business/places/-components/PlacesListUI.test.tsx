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
        location: "Bogotá",
        created_at: new Date(),
      },
      {
        id: 2,
        business_id: 101,
        name: "Another Place",
        description: null,
        location: null,
        created_at: new Date(),
      },
    ];

    render(<PlacesListUI places={places} />);

    // Names
    expect(screen.getByText("Test Place")).toBeDefined();
    expect(screen.getByText("Another Place")).toBeDefined();

    // Descriptions
    expect(screen.getByText("A cool description")).toBeDefined();
    expect(screen.getByText("No description")).toBeDefined();

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
        location: "Bogotá",
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
        location: null,
        created_at: new Date(),
        images: [],
      },
    ];

    render(<PlacesListUI places={places} />);

    // Check that the image is rendered with correct src
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute("alt")).toBe("Place with Image");
    expect(images[0].getAttribute("src")).toContain("example.com");

    // Check that the "No image" fallback is shown
    expect(screen.getByText("No image")).toBeDefined();
  });
});
