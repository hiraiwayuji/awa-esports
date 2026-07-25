import { NextResponse } from "next/server";
import { canRead, requireAdmin, adminUserName } from "@/lib/admin-auth";
import { isSponsorDbConfigured, sbSelect, sbInsert } from "@/lib/sponsor/supabase-admin";
import { writeAudit } from "@/lib/sponsor/audit";
import { CompanyInput, nullifyDates } from "@/lib/sponsor/validate";
import type { SponsorCompany } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard(req: Request, write: boolean): NextResponse | null {
  if (write ? !requireAdmin(req) : !canRead(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSponsorDbConfigured()) {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  }
  return null;
}

// 一覧取得（?format=csv で CSV 出力）
export async function GET(req: Request) {
  const g = guard(req, false);
  if (g) return g;
  try {
    const rows = await sbSelect<SponsorCompany>(
      "awa_sponsor_companies",
      "select=*&is_deleted=eq.false&order=created_at.desc",
    );
    const url = new URL(req.url);
    if (url.searchParams.get("format") === "csv") {
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="awa_sponsors.csv"`,
        },
      });
    }
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    console.error("companies_list_error", e);
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 502 });
  }
}

// 新規作成（admin のみ）
export async function POST(req: Request) {
  const g = guard(req, true);
  if (g) return g;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = CompanyInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const row = nullifyDates(parsed.data, ["contract_start", "contract_end"]);
  try {
    const created = await sbInsert<SponsorCompany>("awa_sponsor_companies", row);
    await writeAudit({
      action: "create",
      targetType: "sponsor_company",
      targetId: created.id,
      after: created,
      userId: adminUserName(req),
    });
    return NextResponse.json({ ok: true, row: created });
  } catch (e) {
    console.error("companies_create_error", e);
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 502 });
  }
}

function toCsv(rows: SponsorCompany[]): string {
  const cols: (keyof SponsorCompany)[] = [
    "legal_name",
    "brand_name",
    "corporate_number",
    "partner_type",
    "status",
    "category_name",
    "contract_start",
    "contract_end",
    "exclusivity",
    "exclusivity_scope",
    "region_scope",
    "event_scope",
    "game_scope",
    "website_url",
    "created_at",
  ];
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("；") : v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(",");
  const lines = rows.map((r) => cols.map((c) => esc(r[c])).join(","));
  return "﻿" + [header, ...lines].join("\n");
}
