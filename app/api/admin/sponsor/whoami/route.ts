import { NextResponse } from "next/server";
import { adminRole } from "@/lib/admin-auth";
import { isSponsorDbConfigured } from "@/lib/sponsor/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// UI のロール出し分け用（admin=書込可 / viewer=閲覧のみ）。
export async function GET(req: Request) {
  const role = adminRole(req);
  if (!role) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, role, dbConfigured: isSponsorDbConfigured() });
}
