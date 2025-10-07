import { integer, pgTable, varchar, boolean } from "drizzle-orm/pg-core";

export const todoTable = pgTable("todo", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 256 }).notNull(),
  completed: boolean().notNull().default(false),
});
