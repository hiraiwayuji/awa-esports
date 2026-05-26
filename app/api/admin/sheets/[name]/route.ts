import { NextResponse } from "next/server";
import { getSheetRows, type SheetName } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: SheetName[] = ["trainee", "player_contract"];

export async function GET(
  _req: Request,
  { params }: { params: { name: string } },
) {
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
