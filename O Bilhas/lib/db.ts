import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const ssl = process.env.DATABASE_SSL === "true" ? "require" : false;

export const hasDatabase = Boolean(databaseUrl);

export const sql = databaseUrl
  ? postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl,
    })
  : null;

export function requireDatabase() {
  if (!sql) {
    throw new Error("DATABASE_URL is required outside mock development mode.");
  }

  return sql;
}
