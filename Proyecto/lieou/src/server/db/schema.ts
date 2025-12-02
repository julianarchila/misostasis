import { pgTable, serial, text, integer, timestamp, boolean, unique, real, geometry, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const todo = pgTable("todo", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
})

export const user = pgTable("user", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clerk_id: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// User location preferences for proximity-based recommendations
export const user_location_preference = pgTable("user_location_preference", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => user.id).notNull().unique(),
  coordinates: geometry("coordinates", { type: "point", mode: "xy", srid: 4326 }),
  search_radius_km: real("search_radius_km").notNull().default(5), // Default 5km
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_location_preference_coordinates_idx").using("gist", table.coordinates)
]);

export const tag = pgTable("tag", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const user_preference = pgTable("user_preference", {
  user_id: integer("user_id").references(() => user.id),
  tag_id: integer("tag_id").references(() => tag.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const place = pgTable("place", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  business_id: integer("business_id").references(() => user.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // PostGIS geometry column for coordinates (longitude, latitude)
  coordinates: geometry("coordinates", { type: "point", mode: "xy", srid: 4326 }),
  address: text("address"), // Optional human-readable address
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  // Spatial index for efficient proximity queries
  index("place_coordinates_idx").using("gist", table.coordinates)
]);

export const place_image = pgTable("place_image", {
  id: serial("id").primaryKey(),
  place_id: integer("place_id").references(() => place.id, { onDelete: 'cascade' }).notNull(),
  url: text("url").notNull(),
  storage_key: text("storage_key"),
  order: integer("order").notNull().default(0),
  status: text("status").notNull().default("confirmed"),
  created_at: timestamp("created_at").defaultNow(),
});

export const place_tag = pgTable("place_tag", {
  place_id: integer("place_id").references(() => place.id),
  tag_id: integer("tag_id").references(() => tag.id),
});

export const swipe = pgTable("swipe", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => user.id).notNull(),
  place_id: integer("place_id").references(() => place.id).notNull(),
  direction: text("direction").notNull(), // "left" | "right"
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("swipe_user_place_unique").on(table.user_id, table.place_id),
  // Index for efficient anti-join in recommendation queries
  index("swipe_user_place_direction_idx").on(table.user_id, table.place_id, table.direction)
]);

export const favorite = pgTable("favorite", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => user.id),
  place_id: integer("place_id").references(() => place.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const placeRelations = relations(place, ({ many }) => ({
  images: many(place_image),
  tags: many(place_tag),
}));

export const placeImageRelations = relations(place_image, ({ one }) => ({
  place: one(place, {
    fields: [place_image.place_id],
    references: [place.id],
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  placeTags: many(place_tag),
}));

export const placeTagRelations = relations(place_tag, ({ one }) => ({
  place: one(place, {
    fields: [place_tag.place_id],
    references: [place.id],
  }),
  tag: one(tag, {
    fields: [place_tag.tag_id],
    references: [tag.id],
  }),
}));

export const swipeRelations = relations(swipe, ({ one }) => ({
  user: one(user, {
    fields: [swipe.user_id],
    references: [user.id],
  }),
  place: one(place, {
    fields: [swipe.place_id],
    references: [place.id],
  }),
}));

export const userLocationPreferenceRelations = relations(user_location_preference, ({ one }) => ({
  user: one(user, {
    fields: [user_location_preference.user_id],
    references: [user.id],
  }),
}));