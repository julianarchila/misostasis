import 'dotenv/config';
import * as schema from './schema';

import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle({
  schema,
  connection: process.env.DATABASE_URL!,
})
