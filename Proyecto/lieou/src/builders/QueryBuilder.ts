import { SQL, and } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';
import * as dbModule from '@/db';

export class QueryBuilder<T extends ReturnType<typeof pgTable>> {
  constructor(private table: T) {}
  private whereConditions: SQL[] = [];

  where(condition: SQL): this {
    this.whereConditions.push(condition);
    return this;
  }

  // Keep the convenience of calling `getDb()` inside the builder.
  // This `build` is synchronous: it calls the project's `getDb()` helper
  // directly. We still cast the table to `any` when calling `.from(...)`
  // to avoid Drizzle's strict table-shape checks inside a generic builder.
  build() {
    const db = (dbModule as any).getDb();
    const query = db.select().from(this.table as any); // ahora sí tipa bien
    return this.whereConditions.length
      ? query.where(and(...this.whereConditions))
      : query;
  }
}