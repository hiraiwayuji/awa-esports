import { NextResponse } from "next/server";
import { canRead, requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbSelect, sbInsert } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";
import { emptyCandidate, type ScreeningCandidate } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 審査履歴 一覧
export async function GET(req: Request) {
  if (!canRead(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  try {
    const rows = await sbSelect(
      "awa_sponsor_screenings",
      "select=*&is_deleted=eq.false&order=created_at.desc&limit=200",
    );
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    console.error("screenings_list_error", e);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}

// 審査結果を保存（履歴として残す）。admin のみ。
export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!isSponsorDbConfigured()) return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const b = (body ?? {}) as {
    candidate?: Partial<ScreeningCandidate>;
    result?: {
      verdict?: string;
      riskLevel?: string;
      checks?: unknown[];
      competitors?: unknown[];
      recommendedActions?: unknown[];
      missingDocs?: unknown[];
      preContractChecks?: unknown[];
    };
  };
  if (!b.candidate || !b.result) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  const candidate = { ...emptyCandidate(), ...b.candidate };
  const verdict = String(b.result.verdict ?? "gray");
  if (!["green", "yellow", "orange", "red", "gray"].includes(verdict)) {
    return NextResponse.json({ ok: false, error: "invalid_verdict" }, { status: 400 });
  }

  const requiredActions = [
    ...(Array.isArray(b.result.recommendedActions) ? b.result.recommendedActions : []),
    ...(Array.isArray(b.result.preContractChecks) ? b.result.preContractChecks : []),
    ...(Array.isArray(b.result.missingDocs)
      ? b.result.missingDocs.map((m) => `不足資料：${String(m)}`)
      : []),
  ];

  try {
    const created = await sbInsert("awa_sponsor_screenings", {
      candidate_company_name: candidate.companyName.slice(0, 200),
      candidate_data: candidate,
      screening_result: verdict,
      risk_level: String(b.result.riskLevel ?? "").slice(0, 100),
      matched_rules: Array.isArray(b.result.checks) ? b.result.checks : [],
      matched_competitors: Array.isArray(b.result.competitors) ? b.result.competitors : [],
      required_actions: requiredActions,
      screened_by: adminUserName(req),
      final_decision: "pending",
    });
    const id = (created as { id: string }).id;
    await writeAudit({ action: "screening_save", targetType: "sponsor_screening", targetId: id, after: { verdict }, userId: adminUserName(req) });
    return NextResponse.json({ ok: true, row: created });
  } catch (e) {
    console.error("screening_save_error", e);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
  }
}
