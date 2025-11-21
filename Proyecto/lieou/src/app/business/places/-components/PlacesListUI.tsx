import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Place } from "@/server/schemas/place";

interface PlacesListUIProps {
  places?: readonly Place[];
  isLoading: boolean;
  error: Error | null;
}

export function PlacesListUI({ places, isLoading, error }: PlacesListUIProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden" role="status">
            <CardContent className="p-0">
              <div className="h-40 w-full bg-neutral-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-neutral-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading places: {error.message}</p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No places yet. Create your first place!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {places.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-40 w-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400 text-sm">No image</span>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2">
                <div className="font-medium">{p.name}</div>
                {p.location && (
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">
                    {p.location}
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-neutral-500 truncate pr-2">
                  {p.description || "No description"}
                </div>
                <Button asChild variant="outline" className="h-8 px-2">
                  <a href={`/business/places/${p.id}`}>View</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}