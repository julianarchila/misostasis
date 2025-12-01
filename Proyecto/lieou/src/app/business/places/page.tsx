"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPlacesOptions } from "@/data-access/places";
import { PlacesListUI } from "./-components/PlacesListUI";
import { Card, CardContent } from "@/components/ui/card";
import { PlacesStatsCards } from "../-components/PlacesStatsCards";
import { BusinessPlaceList } from "./-components/PlacesList";

export default function BusinessPlacesListPage() {

  return (
    <main className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Places</h1>
        <p className="mt-1 text-lg text-gray-600">Manage your venues and track performance</p>
      </div>

      {/* Stats Cards */}
      <PlacesStatsCards />

      {/* Places Grid */}
      <BusinessPlaceList />
    </main>
  )
}
