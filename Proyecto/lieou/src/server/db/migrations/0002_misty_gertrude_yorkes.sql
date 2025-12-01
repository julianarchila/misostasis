ALTER TABLE "place_image" DROP CONSTRAINT "place_image_place_id_place_id_fk";
--> statement-breakpoint
ALTER TABLE "place_image" ADD COLUMN "storage_key" text;--> statement-breakpoint
ALTER TABLE "place_image" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "place_image" ADD COLUMN "status" text DEFAULT 'confirmed' NOT NULL;--> statement-breakpoint
ALTER TABLE "place_image" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "place_image" ADD CONSTRAINT "place_image_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;