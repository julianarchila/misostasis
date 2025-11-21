import { render, screen } from "@testing-library/react";
import { PlacesListUI } from "./PlacesListUI";
import type { Place } from "@/server/schemas/place";

describe("PlacesListUI", () => {
  it("shows loading skeleton when isLoading = true", () => {
    render(<PlacesListUI isLoading={true} error={null} places={undefined} />);
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });

  it("shows error message when error is provided", () => {
    const error = new Error("Test error");
    render(<PlacesListUI isLoading={false} error={error} places={undefined} />);
    expect(screen.getByText("Error loading places: Test error")).toBeInTheDocument();
  });

  it("shows message when there are no places", () => {
    render(<PlacesListUI isLoading={false} error={null} places={[]} />);
    expect(
      screen.getByText("No places yet. Create your first place!")
    ).toBeInTheDocument();
  });

  it("renders places when provided", () => {
    const places: Place[] = [
      {
        id: 1,
        name: "Test Place",
        description: "A cool description",
        location: "Bogotá",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Another Place",
        description: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<PlacesListUI isLoading={false} error={null} places={places} />);

    // Names
    expect(screen.getByText("Test Place")).toBeInTheDocument();
    expect(screen.getByText("Another Place")).toBeInTheDocument();

    // Descriptions
    expect(screen.getByText("A cool description")).toBeInTheDocument();
    expect(screen.getByText("No description")).toBeInTheDocument();

    // Locations
    expect(screen.getByText("Bogotá")).toBeInTheDocument();

    // 2 view links
    const links = screen.getAllByRole("link", { name: "View" });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/business/places/1");
    expect(links[1]).toHaveAttribute("href", "/business/places/2");
  });
});