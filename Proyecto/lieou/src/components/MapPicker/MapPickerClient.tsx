"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet with webpack/bundlers
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface Coordinates {
  x: number; // longitude
  y: number; // latitude
}

interface MapPickerClientProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
  disabled?: boolean;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

function LocationMarker({
  position,
  onChange,
}: {
  position: Coordinates | null;
  onChange: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(e) {
      onChange({
        x: e.latlng.lng,
        y: e.latlng.lat,
      });
    },
  });

  if (!position) return null;

  return (
    <Marker position={[position.y, position.x]} icon={markerIcon} />
  );
}

function RecenterMap({
  position,
  defaultCenter,
}: {
  position: Coordinates | null;
  defaultCenter: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.y, position.x], map.getZoom());
    }
  }, [position, map, defaultCenter]);

  return null;
}

export function MapPickerClient({
  value,
  onChange,
  disabled = false,
  defaultCenter = [4.6097, -74.0817], // Bogota, Colombia as default
  defaultZoom = 13,
}: MapPickerClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    );
  }

  const center: [number, number] = value
    ? [value.y, value.x]
    : defaultCenter;

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-64 w-full rounded-xl border-2 border-gray-300"
        style={{ cursor: disabled ? "not-allowed" : "crosshair" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!disabled && (
          <LocationMarker position={value} onChange={onChange} />
        )}
        {value && <Marker position={[value.y, value.x]} icon={markerIcon} />}
        <RecenterMap position={value} defaultCenter={defaultCenter} />
      </MapContainer>
      {disabled && (
        <div className="absolute inset-0 z-[1000] rounded-xl bg-gray-900/10" />
      )}
    </div>
  );
}
