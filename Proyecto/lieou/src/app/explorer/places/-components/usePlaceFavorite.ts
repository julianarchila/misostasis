import { useState } from "react";

export function usePlaceFavorite(_placeId: string) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    // TODO: Add mutation to save favorite status to server
    // TODO: Use placeId when implementing server persistence
  };

  return {
    isFavorite,
    toggleFavorite,
  };
}
