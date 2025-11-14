import { useState } from "react";

export function useSavedPlacesFavorites() {
  const [favoritesById, setFavoritesById] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavoritesById((prev) => ({ ...prev, [id]: !prev[id] }));
    // TODO: Add mutation to save favorite status to server
  };

  return {
    favoritesById,
    toggleFavorite,
  };
}
