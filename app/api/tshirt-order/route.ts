import { NextResponse } from "next/server";
import { z } from "zod";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import {
  TSHIRT_MAX_PER_SIZE,
  TSHIRT_SIZES,
  normalizeTshirtItems,
  tshirtTotals,
  type TshirtItems,
} from "@/lib/tshirt-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const qty = z.number().int().min(0).max(TSHIRT_MAX_PER_SIZE);
const ItemsSchema = z.object(
  Object.fromEntries(TSHIRT_SIZES.map((s) => [s.key, qty.optional()])) as Record<
    string,
    z.ZodOptional<typeof qty>
  >,
).strict();

const TshirtOrderSchema = z.object({
  name: z.string().trim().min(1).max(80),
  items: ItemsSchema,
  memo: z.string().trim().max(2000).optional().default(""),
  submissionId: z.string().uuid().optional(),
});

const limiter = createRateLimiter(5, 5 * 60 * 1000);

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (limiter.isLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = TshirtOrderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const items = normalizeTshirtItems(parsed.data.items as TshirtItems);
  const totals = tshirtTotals(items);
  if (totals.qty === 0) {
    return NextResponse.json({ ok: false, error: "no_items" }, { status: 400 });
  }

  limiter.record(ip);

  try {
    const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/awa_tshirt_orders`, {
      method: "POST",
      headers: awaSupabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        submission_id: parsed.data.submissionId ?? null,
        name: parsed.data.name,
        items,
        total_qty: totals.qty,
        total_price: totals.price,
        memo: parsed.data.memo || "",
        source: "self",
      }),
    });
    // 409 = submission_id の一意制約違反（再送による重複）。二重送信として許容する。
    if (!res.ok && res.status !== 409) {
      console.error("tshirt_order_supabase_error", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
    }
  } catch (e) {
    console.error("tshirt_order_supabase_exception", e);
    return NextResponse.json({ ok: false, error: "save_exception" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ...totals });
}
