import { NextResponse } from "next/server";
import { canRead } from "@/lib/admin-auth";
import { isSponsorDbConfigured } from "@/lib/sponsor/supabase-admin";
import { loadScreeningContext } from "@/lib/sponsor/context";
import { runScreening } from "@/lib/sponsor/screening";
import { emptyCandidate, type ScreeningCandidate } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// スポンサー適合チェックを実行して結果を返す（保存はしない）。
// 認証は middleware（Basic）＋ここでも再確認（多層防御）。
export async function POST(req: Request) {
  if (!canRead(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSponsorDbConfigured()) {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // 受け取った候補データを既定値とマージ（未知キーは無視）。
  const base = emptyCandidate();
  const input = (body ?? {}) as Partial<ScreeningCandidate>;
  const candidate: ScreeningCandidate = {
    ...base,
    ...input,
    supportKinds: Array.isArray(input.supportKinds) ? input.supportKinds.map(String).slice(0, 20) : [],
    exclusivity: !!input.exclusivity,
    corporateVerified: !!input.corporateVerified,
  };

  try {
    const ctx = await loadScreeningContext();
    const result = runScreening(candidate, ctx);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error("sponsor_check_error", e);
    return NextResponse.json({ ok: false, error: "check_failed" }, { status: 502 });
  }
}
