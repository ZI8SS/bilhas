import { NextResponse } from "next/server";
import { hasDatabase, requireDatabase } from "@/lib/db";
import { isEditorAuthorized } from "@/lib/editor-auth";
import { syncWorldCupToDatabase } from "@/lib/worldcup-sync";

type SyncRequest = {
  matchId?: string;
};

function worldCupIdFromExternalId(externalId?: string | null) {
  return externalId?.startsWith("worldcup:") ? externalId.replace("worldcup:", "") : null;
}

export async function POST(request: Request) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ ok: false, error: "database_not_configured" }, { status: 503 });
  }

  const body = (await request.json()) as SyncRequest;
  const matchId = body.matchId?.trim();

  if (!matchId) {
    return NextResponse.json({ ok: false, error: "match_required" }, { status: 400 });
  }

  const sql = requireDatabase();
  const rows = await sql<{ external_id: string | null }[]>`
    SELECT external_id
    FROM matches
    WHERE public_id = ${matchId}
    LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json({ ok: false, error: "match_not_found" }, { status: 404 });
  }

  const worldCupId = worldCupIdFromExternalId(rows[0].external_id);

  if (!worldCupId) {
    return NextResponse.json({ ok: false, error: "match_has_no_worldcup_id" }, { status: 400 });
  }

  const stats = await syncWorldCupToDatabase([worldCupId]);

  return NextResponse.json({ ok: true, stats });
}
