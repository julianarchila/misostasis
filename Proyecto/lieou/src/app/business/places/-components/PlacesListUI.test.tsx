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
  it("shows loading skeleton when isLoading = true", () => {
    render(<PlacesListUI isLoading={true} error={null} places={undefined} />);
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });

  it("shows error message when error is provided", () => {
    const error = new Error("Test error");
    render(<PlacesListUI isLoading={false} error={error} places={undefined} />);
    expect(screen.getByText("Error loading places: Test error")).toBeDefined();
  });

  it("shows message when there are no places", () => {
    render(<PlacesListUI isLoading={false} error={null} places={[]} />);
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

    render(<PlacesListUI isLoading={false} error={null} places={places} />);

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
});
