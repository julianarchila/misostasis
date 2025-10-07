import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clerk_id: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const user_preferences = pgTable("user_preferences", {
  user_id: integer("user_id").references(() => users.id),
  tag_id: integer("tag_id").references(() => tags.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const places = pgTable("places", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  business_id: integer("business_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  created_at: timestamp("created_at").defaultNow(),
});

export const place_images = pgTable("place_images", {
  id: serial("id").primaryKey(),
  place_id: integer("place_id").references(() => places.id),
  url: text("url").notNull(),
});

export const place_tags = pgTable("place_tags", {
  place_id: integer("place_id").references(() => places.id),
  tag_id: integer("tag_id").references(() => tags.id),
});

export const swipes = pgTable("swipes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id),
  place_id: integer("place_id").references(() => places.id),
  direction: text("direction").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => users.id),
  place_id: integer("place_id").references(() => places.id),
  created_at: timestamp("created_at").defaultNow(),
});
