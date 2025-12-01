
import { MapPin, Eye, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PlacesStatsCards() {
  return <div className="mb-8 grid gap-6 md:grid-cols-3">
    <Card className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Views</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">5,120</p>
          <p className="mt-1 text-sm text-green-600">+12% from last week</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Eye className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </Card>

    <Card className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Total Likes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">402</p>
          <p className="mt-1 text-sm text-green-600">+8% from last week</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Heart className="h-6 w-6 text-[#fd5564]" />
        </div>
      </div>
    </Card>

    <Card className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Active Places</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {10}
          </p>
          <p className="mt-1 text-sm text-gray-500">of {11} total</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
          {/* Placeholder for Store icon */}
        </div>
      </div>
    </Card>
  </div>
}
