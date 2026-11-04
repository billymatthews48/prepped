// Applies the SQL migrations in ./drizzle.
//   node scripts/migrate.mjs --local   -> local PGlite database in .pglite/
//   node scripts/migrate.mjs           -> Neon, but only on a Vercel production build
// Preview builds and local `npm run build` skip, so unmerged branches never
// change the live database.
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { rmSync } from "node:fs";

const migrationsFolder = "./drizzle";

async function migrateLocal(dir) {
  const client = new PGlite(dir);
  try {
    await migratePglite(drizzlePglite(client), { migrationsFolder });
  } finally {
    await client.close().catch(() => {});
  }
}

if (process.argv.includes("--local")) {
  const dir = process.env.PGLITE_DIR ?? ".pglite";
  try {
    await migrateLocal(dir);
    console.log("Local database migrated.");
  } catch (error) {
    // PGlite's files get damaged if the dev server is force-killed mid-write.
    // This folder only ever holds local test data, so rebuild it from scratch.
    console.warn(`Local database at ${dir} was damaged (${error.cause?.message ?? error.message}). Rebuilding it empty.`);
    rmSync(dir, { recursive: true, force: true });
    await migrateLocal(dir);
    console.log("Local database rebuilt and migrated.");
  }
} else if (process.env.VERCEL_ENV === "production") {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set for the production build.");
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  await migratePg(drizzlePg(pool), { migrationsFolder });
  await pool.end();
  console.log("Production database migrated.");
} else {
  console.log("Skipping migrations (not a production build).");
}
