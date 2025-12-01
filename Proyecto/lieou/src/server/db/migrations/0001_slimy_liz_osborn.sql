ALTER TABLE "place" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "place_image" ALTER COLUMN "place_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "maps_url" text;