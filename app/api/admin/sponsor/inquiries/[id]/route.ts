import { NextResponse } from "next/server";
import { requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbUpdate, sbGetById } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ["new", "reviewing", "done", "closed"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  if (!UUID.test(params.id)) return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const b = (body ?? {}) as { status?: string; admin_memo?: string };
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.status !== undefined) {
    if (!STATUSES.includes(String(b.status))) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }
    patch.status = b.status;
  }
  if (b.admin_memo !== undefined) {
    patch.admin_memo = String(b.admin_memo).slice(0, 4000);
  }

  try {
    const before = await sbGetById("awa_sponsor_inquiries", params.id);
    const updated = await sbUpdate("awa_sponsor_inquiries", params.id, patch);
    await writeAudit({ action: "inquiry_update", targetType: "sponsor_inquiry", targetId: params.id, before, after: patch, userId: adminUserName(req) });
    return NextResponse.json({ ok: true, row: updated });
  } catch (e) {
    console.error("inquiry_update_error", e);
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}

// 論理削除
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  if (!UUID.test(params.id)) return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  try {
    await sbUpdate("awa_sponsor_inquiries", params.id, { is_deleted: true, updated_at: new Date().toISOString() });
    await writeAudit({ action: "soft_delete", targetType: "sponsor_inquiry", targetId: params.id, userId: adminUserName(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("inquiry_delete_error", e);
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 502 });
  }
}
