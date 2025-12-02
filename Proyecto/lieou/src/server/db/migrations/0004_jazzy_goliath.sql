CREATE TABLE "user_location_preference" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_location_preference_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"coordinates" geometry(point),
	"search_radius_km" real DEFAULT 5 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_location_preference_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "coordinates" geometry(point);--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "user_location_preference" ADD CONSTRAINT "user_location_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_location_preference_coordinates_idx" ON "user_location_preference" USING gist ("coordinates");--> statement-breakpoint
CREATE INDEX "place_coordinates_idx" ON "place" USING gist ("coordinates");--> statement-breakpoint
ALTER TABLE "place" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "place" DROP COLUMN "maps_url";