import { NextResponse } from "next/server";
import { hasDatabase, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase || !sql) {
    return NextResponse.json({
      ok: true,
      database: "none",
      source: process.env.WORLD_CUP_SOURCE === "disabled" ? "mock" : "worldcup-api",
    });
  }

  await sql`SELECT 1`;

  return NextResponse.json({
    ok: true,
    database: "postgres",
    source: "database",
  });
}
