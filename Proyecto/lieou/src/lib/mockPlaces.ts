export type Place = {
  id: string
  name: string
  photoUrl: string
  category: "Restaurant" | "Park" | "Cafe" | "Museum" | "Bar" | "Other"
  description: string
}

export const mockPlaces: Place[] = [
  {
    id: "p1",
    name: "Luna Bistro",
    photoUrl: "https://picsum.photos/seed/luna-bistro/900/1200",
    category: "Restaurant",
    description:
      "A cozy spot with seasonal dishes and a bright, airy interior. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: "p2",
    name: "Willow Park",
    photoUrl: "https://picsum.photos/seed/willow-park/900/1200",
    category: "Park",
    description:
      "Green lawns, shady trees, and quiet walking paths. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "p3",
    name: "Harbor Cafe",
    photoUrl: "https://picsum.photos/seed/harbor-cafe/900/1200",
    category: "Cafe",
    description:
      "Specialty coffee and fresh pastries near the water. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
  },
  {
    id: "p4",
    name: "Modern Art Wing",
    photoUrl: "https://picsum.photos/seed/modern-art-wing/900/1200",
    category: "Museum",
    description:
      "Rotating exhibits from emerging artists. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
  },
  {
    id: "p5",
    name: "Skyline Rooftop",
    photoUrl: "https://picsum.photos/seed/skyline-rooftop/900/1200",
    category: "Bar",
    description:
      "Cocktails with panoramic city views. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  },
]