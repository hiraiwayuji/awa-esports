import { NextResponse } from "next/server";
import { requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbUpdate, sbGetById } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";
import { CategoryInput } from "@/lib/sponsor/validate";
import type { SponsorCategory } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function guard(req: Request, id: string): NextResponse | null {
  if (!requireAdmin(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  if (!UUID.test(id)) return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  return null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const g = guard(req, params.id);
  if (g) return g;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = CategoryInput.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const before = await sbGetById<SponsorCategory>("awa_sponsor_categories", params.id);
    const updated = await sbUpdate<SponsorCategory>("awa_sponsor_categories", params.id, {
      ...parsed.data,
      updated_at: new Date().toISOString(),
    });
    await writeAudit({ action: "update", targetType: "sponsor_category", targetId: params.id, before, after: updated, userId: adminUserName(req) });
    return NextResponse.json({ ok: true, row: updated });
  } catch (e) {
    console.error("category_update_error", e);
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const g = guard(req, params.id);
  if (g) return g;
  try {
    const before = await sbGetById<SponsorCategory>("awa_sponsor_categories", params.id);
    await sbUpdate<SponsorCategory>("awa_sponsor_categories", params.id, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    });
    await writeAudit({ action: "soft_delete", targetType: "sponsor_category", targetId: params.id, before, userId: adminUserName(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("category_delete_error", e);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 502 });
  }
}
