import { NextResponse } from "next/server";
import { canRead } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbSelect } from "@/lib/sponsor/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 公開ページからの問い合わせ一覧（非公開・運営のみ）
export async function GET(req: Request) {
  if (!canRead(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  try {
    const rows = await sbSelect(
      "awa_sponsor_inquiries",
      "select=*&is_deleted=eq.false&order=created_at.desc&limit=300",
    );
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    console.error("inquiries_list_error", e);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}
