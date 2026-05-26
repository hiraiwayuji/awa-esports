import { NextResponse } from "next/server";
import { updateSheetRow, type SheetName } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: SheetName[] = ["trainee", "player_contract"];

// 管理画面からの編集を許可するカラム（whitelist）
const EDITABLE_FIELDS = new Set([
  "ステータス",
  "管理者メモ",
  "誓約書/契約書URL",
  "Discord メッセージURL",
]);

export async function PATCH(
  req: Request,
  { params }: { params: { name: string; index: string } },
) {
  const name = params.name as SheetName;
  if (!VALID.includes(name)) {
    return NextResponse.json({ ok: false, error: "invalid_sheet" }, { status: 400 });
  }

  const rowIndex = Number.parseInt(params.index, 10);
  if (!Number.isFinite(rowIndex) || rowIndex < 0) {
    return NextResponse.json({ ok: false, error: "invalid_index" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  // editable fields のみ通す
  const updates: Record<string, string> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (!EDITABLE_FIELDS.has(k)) continue;
    if (typeof v !== "string") continue;
    if (v.length > 2000) continue;
    updates[k] = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "no_editable_fields" }, { status: 400 });
  }

  try {
    await updateSheetRow(name, rowIndex, updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin_update_row_error", e);
    return NextResponse.json(
      { ok: false, error: "sheets_update_failed" },
      { status: 502 },
    );
  }
}
