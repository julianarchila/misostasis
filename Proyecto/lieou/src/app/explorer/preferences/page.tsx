"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradientBackground } from "@/components/GradientBackground";
import { MapPicker, type Coordinates } from "@/components/MapPicker";
import { MapPin, Locate, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { 
  getLocationPreferenceOptions, 
  updateLocationPreferenceOptions 
} from "@/data-access/explorer";

export default function ExplorerPreferencesPage() {
  const queryClient = useQueryClient();
  const [coordinates, setCoordinates] = React.useState<Coordinates | null>(null);
  const [radius, setRadius] = React.useState<string>("5");
  const [isLocating, setIsLocating] = React.useState(false);

  const { data: locationPref, isLoading } = useQuery(getLocationPreferenceOptions);
  
  const updateMutation = useMutation({
    ...updateLocationPreferenceOptions,
    throwOnError: false,
    onSuccess: () => {
      toast.success("Location preferences saved!");
      queryClient.invalidateQueries({ queryKey: ["explorer"] });
    },
    onError: () => {
      toast.error("Failed to save location preferences. Please try again.");
    }
  });

  React.useEffect(() => {
    if (locationPref) {
      if (locationPref.coordinates) {
        setCoordinates(locationPref.coordinates);
      }
      setRadius(locationPref.search_radius_km.toString());
    }
  }, [locationPref]);

  const handleGetCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          x: position.coords.longitude,
          y: position.coords.latitude,
        });
        setIsLocating(false);
        toast.success("Location detected!");
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An error occurred while getting your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSave = () => {
    if (!coordinates) {
      toast.error("Please select a location on the map");
      return;
    }

    const radiusNum = parseFloat(radius);
    const finalRadius = isNaN(radiusNum) || radiusNum <= 0 ? 5 : Math.min(radiusNum, 100);

    updateMutation.mutate({
      coordinates,
      search_radius_km: finalRadius
    });
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <div className="flex h-full items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="mx-auto max-w-md px-6 py-12">
        {/* Back button */}
        <Link 
          href={routes.explorer.root}
          className="mb-6 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to explore</span>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Location Settings</h1>
          <p className="mt-2 text-white/90">
            Set your location to discover nearby places
          </p>
        </div>

        <div className="space-y-6">
          {/* Map Picker */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Your Location</h2>
              <p className="mt-1 text-sm text-gray-600">
                Click on the map to set your location
              </p>
            </div>
            
            <MapPicker
              value={coordinates}
              onChange={setCoordinates}
              disabled={updateMutation.isPending}
            />

            {/* Current Location Button */}
            <Button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating || updateMutation.isPending}
              variant="outline"
              className="mt-4 w-full border-2 border-gray-300"
            >
              <Locate className="mr-2 h-4 w-4" />
              {isLocating ? "Detecting location..." : "Use Current Location"}
            </Button>

            {/* Coordinate inputs for fine-tuning */}
            {coordinates && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={coordinates.y}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setCoordinates({ ...coordinates, y: val });
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="h-10 border-2 border-gray-300 text-sm focus-visible:ring-[#fd5564]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={coordinates.x}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setCoordinates({ ...coordinates, x: val });
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="h-10 border-2 border-gray-300 text-sm focus-visible:ring-[#fd5564]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Search Radius */}
          <div className="rounded-3xl bg-white p-6 shadow-2xl">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search Radius (km)
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="5"
              className="border-2 border-gray-300 focus-visible:ring-[#fd5564]"
            />
            <p className="mt-2 text-sm text-gray-500">
              Show places within {radius || 5}km of your location
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !coordinates}
            className="w-full bg-gradient-to-r from-[#fd5564] to-[#ff8a5b] py-6 text-lg font-semibold text-white shadow-xl hover:opacity-90"
          >
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>

          {/* Info text */}
          {!locationPref?.coordinates && (
            <p className="text-center text-sm text-white/80">
              Set your location to see places near you and their distances
            </p>
          )}
        </div>
      </div>
    </GradientBackground>
  );
}
