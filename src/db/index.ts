import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

// Production (Vercel) connects to Neon through DATABASE_URL. Locally and in
// tests there is no DATABASE_URL, so we use PGlite: a real Postgres that runs
// in-process and saves to .pglite/ (or stays in memory with "memory://").
function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (url) {
    return drizzlePg(new Pool({ connectionString: url, max: 5 }), { schema });
  }
  const client = new PGlite(process.env.PGLITE_DIR ?? ".pglite");
  return drizzlePglite(client, { schema }) as unknown as Db;
}

const globalForDb = globalThis as unknown as { __preppedDb?: Db };

export const db: Db = globalForDb.__preppedDb ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.__preppedDb = db;
