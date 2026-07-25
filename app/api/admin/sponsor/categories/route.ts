import { NextResponse } from "next/server";
import { canRead, requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbSelect, sbInsert } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";
import { CategoryInput } from "@/lib/sponsor/validate";
import type { SponsorCategory } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!canRead(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  try {
    const rows = await sbSelect<SponsorCategory>(
      "awa_sponsor_categories",
      "select=*&is_deleted=eq.false&order=parent_category.asc,category_name.asc",
    );
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    console.error("categories_list_error", e);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = CategoryInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const created = await sbInsert<SponsorCategory>("awa_sponsor_categories", parsed.data);
    await writeAudit({ action: "create", targetType: "sponsor_category", targetId: created.id, after: created, userId: adminUserName(req) });
    return NextResponse.json({ ok: true, row: created });
  } catch (e) {
    console.error("category_create_error", e);
    // 一意制約（category_name 重複）
    const msg = e instanceof Error && e.message.includes("23505") ? "duplicate_category" : "create_failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
