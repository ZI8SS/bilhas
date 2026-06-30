import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const ssl = process.env.DATABASE_SSL === "true" ? "require" : false;
const sql = postgres(databaseUrl, { max: 1, ssl });
const migrationsDir = path.join(process.cwd(), "db", "migrations");

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  const version = file.replace(/\.sql$/, "");
  const migration = await readFile(path.join(migrationsDir, file), "utf8");
  const checksum = createHash("sha256").update(migration).digest("hex");
  const existing = await sql`
    SELECT checksum FROM schema_migrations WHERE version = ${version}
  `;

  if (existing.length && existing[0].checksum !== checksum) {
    throw new Error(`Migration checksum changed after apply: ${file}`);
  }

  if (existing.length) {
    console.log(`Skipping ${file}`);
    continue;
  }

  console.log(`Applying ${file}`);
  await sql.begin(async (transaction) => {
    await transaction.unsafe(migration);
    await transaction`
      INSERT INTO schema_migrations (version, checksum)
      VALUES (${version}, ${checksum})
    `;
  });
}

await sql.end();
