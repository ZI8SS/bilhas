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
const seedsDir = path.join(process.cwd(), "db", "seeds");

const files = (await readdir(seedsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  console.log(`Seeding ${file}`);
  const seed = await readFile(path.join(seedsDir, file), "utf8");
  await sql.unsafe(seed);
}

await sql.end();
