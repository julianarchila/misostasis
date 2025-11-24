// src/hooks/useRecommendedPlaces.ts
import { useQuery } from "@tanstack/react-query";
import { getRecommendedOptions } from "@/data-access/places";

export const useRecommendedPlaces = () => {
  return useQuery(getRecommendedOptions);
};