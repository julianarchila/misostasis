"use client";

import dynamic from "next/dynamic";
import type { Coordinates } from "./MapPickerClient";

const MapPickerClient = dynamic(
  () => import("./MapPickerClient").then((mod) => mod.MapPickerClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

interface MapPickerProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
  disabled?: boolean;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export function MapPicker(props: MapPickerProps) {
  return <MapPickerClient {...props} />;
}

export type { Coordinates };
