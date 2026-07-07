import { NextResponse } from "next/server";
import { hasDatabase, requireDatabase } from "@/lib/db";
import { isEditorAuthorized } from "@/lib/editor-auth";
import type { BilhasComment } from "@/lib/types";

type CreateTickerCommentRequest = {
  matchId?: string;
  minute?: string;
  text?: string;
  intensity?: BilhasComment["intensity"];
  featured?: boolean;
  mediaUrl?: string;
  mediaCredit?: string;
  mediaSourceUrl?: string;
  mediaLicense?: string;
  mediaKind?: string;
};

const intensities = new Set(["leve", "medio", "forte", "absurdo"]);

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ ok: false, error: "database_not_configured" }, { status: 503 });
  }

  const body = (await request.json()) as CreateTickerCommentRequest;
  const matchId = clean(body.matchId);
  const minute = clean(body.minute);
  const text = clean(body.text);
  const intensity = body.intensity && intensities.has(body.intensity) ? body.intensity : "medio";

  if (!matchId || !minute || !text) {
    return NextResponse.json({ ok: false, error: "match_minute_and_text_required" }, { status: 400 });
  }

  if (text.length > 420) {
    return NextResponse.json({ ok: false, error: "text_too_long" }, { status: 400 });
  }

  const sql = requireDatabase();
  const matches = await sql<{ id: string }[]>`
    SELECT id FROM matches WHERE public_id = ${matchId} LIMIT 1
  `;

  if (!matches.length) {
    return NextResponse.json({ ok: false, error: "match_not_found" }, { status: 404 });
  }

  const publicId = `manual-${crypto.randomUUID()}`;
  const rows = await sql<{ public_id: string }[]>`
    INSERT INTO bilhas_comments (
      public_id,
      match_id,
      minute,
      intensity,
      body,
      featured,
      media_url,
      media_credit,
      media_source_url,
      media_license,
      media_kind,
      published_at
    )
    VALUES (
      ${publicId},
      ${matches[0].id},
      ${minute},
      ${intensity}::comment_intensity,
      ${text},
      ${body.featured ?? true},
      ${clean(body.mediaUrl)},
      ${clean(body.mediaCredit)},
      ${clean(body.mediaSourceUrl)},
      ${clean(body.mediaLicense)},
      ${clean(body.mediaKind)},
      now()
    )
    RETURNING public_id
  `;

  return NextResponse.json({ ok: true, id: rows[0].public_id });
}
