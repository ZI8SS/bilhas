import { NextResponse } from "next/server";
import { hasDatabase, requireDatabase } from "@/lib/db";
import { isEditorAuthorized } from "@/lib/editor-auth";
import type { BilhasComment } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateCommentRequest = {
  minute?: string;
  text?: string;
  intensity?: BilhasComment["intensity"];
  featured?: boolean;
  published?: boolean;
};

const intensities = new Set(["leve", "medio", "forte", "absurdo"]);

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ ok: false, error: "database_not_configured" }, { status: 503 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateCommentRequest;
  const minute = clean(body.minute);
  const text = clean(body.text);
  const intensity = body.intensity && intensities.has(body.intensity) ? body.intensity : null;

  if (!minute || !text || !intensity) {
    return NextResponse.json({ ok: false, error: "minute_text_and_intensity_required" }, { status: 400 });
  }

  if (text.length > 420) {
    return NextResponse.json({ ok: false, error: "text_too_long" }, { status: 400 });
  }

  const sql = requireDatabase();
  const rows = await sql<{ public_id: string }[]>`
    UPDATE bilhas_comments
    SET
      minute = ${minute},
      intensity = ${intensity}::comment_intensity,
      body = ${text},
      featured = ${body.featured ?? false},
      published_at = CASE
        WHEN ${body.published ?? true} THEN COALESCE(published_at, now())
        ELSE NULL
      END,
      updated_at = now()
    WHERE public_id = ${id}
    RETURNING public_id
  `;

  if (!rows.length) {
    return NextResponse.json({ ok: false, error: "comment_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: rows[0].public_id });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ ok: false, error: "database_not_configured" }, { status: 503 });
  }

  const { id } = await context.params;
  const sql = requireDatabase();
  const rows = await sql<{ public_id: string }[]>`
    DELETE FROM bilhas_comments
    WHERE public_id = ${id}
    RETURNING public_id
  `;

  if (!rows.length) {
    return NextResponse.json({ ok: false, error: "comment_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id: rows[0].public_id });
}
