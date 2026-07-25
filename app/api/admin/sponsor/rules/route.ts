import { NextResponse } from "next/server";
import { canRead, requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbSelect, sbInsert } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";
import { RuleInput, nullifyDates } from "@/lib/sponsor/validate";
import type { TournamentRule } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!canRead(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  try {
    const rows = await sbSelect<TournamentRule>(
      "awa_tournament_sponsor_rules",
      "select=*&is_deleted=eq.false&order=created_at.desc",
    );
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    console.error("rules_list_error", e);
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
  const parsed = RuleInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const row = nullifyDates(parsed.data, ["effective_from", "effective_to", "last_checked_at"]);
  try {
    const created = await sbInsert<TournamentRule>("awa_tournament_sponsor_rules", row);
    await writeAudit({ action: "create", targetType: "tournament_rule", targetId: created.id, after: created, userId: adminUserName(req) });
    return NextResponse.json({ ok: true, row: created });
  } catch (e) {
    console.error("rule_create_error", e);
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 502 });
  }
}
