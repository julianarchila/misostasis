import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Place } from "@/server/schemas/place";
import Link from "next/link";

interface PlacesListUIProps {
  places: readonly Place[];
}

export function PlacesListUI({ places }: PlacesListUIProps) {
  if (places.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No places yet. Create your first place!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {places.map((p) => {
        const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;

        return (
          <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-40 w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                {firstImage ? (
                  <Image
                    src={firstImage.url}
                    alt={p.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-neutral-400 text-sm">No image</span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate">{p.name}</div>
                  {p.location && (
                    <Badge variant="secondary" className="bg-neutral-100 text-neutral-700 text-xs flex-shrink-0">
                      {p.location}
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-neutral-500 truncate pr-2">
                    {p.description || "No description"}
                  </div>
                  <Button asChild variant="outline" className="h-8 px-2 flex-shrink-0">
                    <Link href={`/business/places/${p.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}