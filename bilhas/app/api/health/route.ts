import { NextResponse } from "next/server";
import { hasDatabase, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase || !sql) {
    return NextResponse.json({
      ok: true,
      database: "mock",
    });
  }

  await sql`SELECT 1`;

  return NextResponse.json({
    ok: true,
    database: "postgres",
  });
}
