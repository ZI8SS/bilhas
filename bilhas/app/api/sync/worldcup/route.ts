import { NextRequest, NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db";
import { syncWorldCupToDatabase } from "@/lib/worldcup-sync";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function sync(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ ok: false, error: "database_not_configured" }, { status: 503 });
  }

  const stats = await syncWorldCupToDatabase();

  return NextResponse.json({ ok: true, stats });
}

export async function GET(request: NextRequest) {
  return sync(request);
}

export async function POST(request: NextRequest) {
  return sync(request);
}
