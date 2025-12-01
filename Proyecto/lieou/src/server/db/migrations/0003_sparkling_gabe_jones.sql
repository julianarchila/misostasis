ALTER TABLE "swipe" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "swipe" ALTER COLUMN "place_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "swipe" ADD CONSTRAINT "swipe_user_place_unique" UNIQUE("user_id","place_id");