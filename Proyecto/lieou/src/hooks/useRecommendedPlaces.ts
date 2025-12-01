// src/hooks/useRecommendedPlaces.ts
import { useQuery } from "@tanstack/react-query";
import { getRecommendedPlacesOptions } from "@/data-access/explorer";

export const useRecommendedPlaces = () => {
  return useQuery(getRecommendedPlacesOptions);
};