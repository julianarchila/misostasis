import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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
  location: text("location"),
  maps_url: text("maps_url"), 
  created_at: timestamp("created_at").defaultNow(),
});

export const place_image = pgTable("place_image", {
  id: serial("id").primaryKey(),
  place_id: integer("place_id").references(() => place.id).notNull(),
  url: text("url").notNull(),
});

export const place_tag = pgTable("place_tag", {
  place_id: integer("place_id").references(() => place.id),
  tag_id: integer("tag_id").references(() => tag.id),
});

export const swipe = pgTable("swipe", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => user.id),
  place_id: integer("place_id").references(() => place.id),
  direction: text("direction").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

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