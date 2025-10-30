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

  build() {
    const db = (dbModule as any).getDb();
    const query = db.select().from(this.table as any);
    return this.whereConditions.length
      ? query.where(and(...this.whereConditions))
      : query;
  }
}