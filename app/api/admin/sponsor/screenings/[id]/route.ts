import { NextResponse } from "next/server";
import { requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbUpdate, sbGetById } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DECISIONS = ["pending", "approved", "conditional", "rejected"];

// 最終判定（人間の承認）を記録する。admin のみ。
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
  const b = (body ?? {}) as { final_decision?: string; decision_reason?: string };
  const decision = String(b.final_decision ?? "");
  if (!DECISIONS.includes(decision)) {
    return NextResponse.json({ ok: false, error: "invalid_decision" }, { status: 400 });
  }
  const reason = String(b.decision_reason ?? "").slice(0, 4000);

  try {
    const before = await sbGetById("awa_sponsor_screenings", params.id);
    const user = adminUserName(req);
    const updated = await sbUpdate("awa_sponsor_screenings", params.id, {
      final_decision: decision,
      decision_reason: reason,
      approved_by: decision === "pending" ? "" : user,
      approved_at: decision === "pending" ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await writeAudit({
      action: "screening_decision",
      targetType: "sponsor_screening",
      targetId: params.id,
      before,
      after: { final_decision: decision, decision_reason: reason },
      userId: user,
    });
    return NextResponse.json({ ok: true, row: updated });
  } catch (e) {
    console.error("screening_decision_error", e);
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}
