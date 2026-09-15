import { NextResponse } from "next/server";
import { z } from "zod";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AttendanceEnum = z.enum(["lodging", "bbq_only", "absent"]);
const GamecenterEnum = z.enum(["go", "maybe", "no", ""]);

const BbqSurveySchema = z.object({
  name: z.string().trim().min(1).max(80),
  attendance: AttendanceEnum,
  gamecenter: GamecenterEnum.optional().default(""),
  dogAllergy: z.boolean().optional().default(false),
  memo: z.string().trim().max(2000).optional().default(""),
  submissionId: z.string().uuid().optional(),
});

const ATTENDANCE_LABEL: Record<z.infer<typeof AttendanceEnum>, string> = {
  lodging: "宿泊＋BBQ参加（1人7,600円）",
  bbq_only: "BBQのみ参加（日帰り・1人4,000円）",
  absent: "参加できない",
};

const GAMECENTER_LABEL: Record<string, string> = {
  go: "行く",
  maybe: "未定",
  no: "行かない",
  "": "",
};

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

  const parsed = BbqSurveySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  limiter.record(ip);

  const payload = parsed.data;

  try {
    const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/awa_bbq_camp_rsvp`, {
      method: "POST",
      headers: awaSupabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        submission_id: payload.submissionId ?? null,
        name: payload.name,
        attendance: ATTENDANCE_LABEL[payload.attendance],
        gamecenter: GAMECENTER_LABEL[payload.gamecenter ?? ""],
        dog_allergy: payload.dogAllergy,
        memo: payload.memo || "",
        source: "self",
      }),
    });
    // 409 = submission_id の一意制約違反（再送による重複）。二重送信として許容する。
    if (!res.ok && res.status !== 409) {
      console.error("bbq_survey_supabase_error", res.status, await res.text());
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 502 });
    }
  } catch (e) {
    console.error("bbq_survey_supabase_exception", e);
    return NextResponse.json({ ok: false, error: "save_exception" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
