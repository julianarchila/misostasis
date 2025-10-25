// db.ts
import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

let instance: NodePgDatabase<typeof schema> | undefined;

export function getDb(): NodePgDatabase<typeof schema> {
  if (!instance) {
    instance = drizzle({
      schema,
      connection: process.env.DATABASE_URL!,
    });
  }
  return instance;
}