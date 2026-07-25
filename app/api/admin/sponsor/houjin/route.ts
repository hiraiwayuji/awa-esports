import { NextResponse } from "next/server";
import { canRead } from "@/lib/admin-auth";
import { lookupByNumber, searchByName, isHoujinConfigured, HOUJIN_SOURCE } from "@/lib/sponsor/houjin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 国税庁 法人番号 API の検索プロキシ（APIキーはサーバー側のみ）。
// ?number=13桁 または ?name=名称。未設定なら configured:false を返す。
export async function GET(req: Request) {
  if (!canRead(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  if (!isHoujinConfigured()) {
    return NextResponse.json({ ok: true, configured: false, source: HOUJIN_SOURCE });
  }

  const url = new URL(req.url);
  const number = url.searchParams.get("number");
  const name = url.searchParams.get("name");

  try {
    const result = number
      ? await lookupByNumber(number)
      : name
        ? await searchByName(name)
        : null;
    if (!result) {
      return NextResponse.json({ ok: false, error: "missing_query" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("houjin_lookup_error", e);
    return NextResponse.json({ ok: false, error: "lookup_failed", source: HOUJIN_SOURCE }, { status: 502 });
  }
}
