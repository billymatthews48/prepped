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

const migrationsFolder = "./drizzle";

if (process.argv.includes("--local")) {
  const client = new PGlite(process.env.PGLITE_DIR ?? ".pglite");
  await migratePglite(drizzlePglite(client), { migrationsFolder });
  await client.close();
  console.log("Local database migrated.");
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
