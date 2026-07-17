import { NextResponse } from "next/server";
import { getSheetRows, type SheetName } from "@/lib/sheets";
import { isAdminAuthed } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: SheetName[] = ["trainee", "player_contract"];

export async function GET(
  req: Request,
  { params }: { params: { name: string } },
) {
  // middleware に加え、この API 自身でも認証を再確認する（多層防御）。
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const name = params.name as SheetName;
  if (!VALID.includes(name)) {
    return NextResponse.json({ ok: false, error: "invalid_sheet" }, { status: 400 });
  }

  try {
    const rows = await getSheetRows(name);
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    console.error("admin_get_rows_error", e);
    return NextResponse.json(
      { ok: false, error: "sheets_read_failed" },
      { status: 502 },
    );
  }
}
