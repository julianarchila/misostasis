import { useQuery } from "@tanstack/react-query";
import { getMyPlacesOptions } from "@/data-access/places";

export function useMyPlaces() {
  return useQuery(getMyPlacesOptions);
}
