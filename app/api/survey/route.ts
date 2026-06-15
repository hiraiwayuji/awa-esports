import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PracticeEnum = z.enum(["more", "keep", "less", "either"]);
const GachiEnum = z.enum(["want", "monthly", "enough", "no"]);
const OpsEnum = z.enum(["want", "maybe", "no"]);
const RegistrationEnum = z.enum(["want", "considering", "trial", "no"]);

const SurveySchema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  practiceDays: PracticeEnum,
  practiceWish: z.string().trim().max(1000).optional().default(""),
  gachiDays: GachiEnum,
  ops: OpsEnum,
  opsDetail: z.string().trim().max(1000).optional().default(""),
  registration: RegistrationEnum,
  events: z.array(z.string().trim().max(80)).max(20).optional().default([]),
  eventsOther: z.string().trim().max(500).optional().default(""),
  expectations: z.string().trim().max(4000).optional().default(""),
});

type SurveyPayload = z.infer<typeof SurveySchema>;

const PRACTICE_LABEL: Record<SurveyPayload["practiceDays"], string> = {
  more: "もっと増やしてほしい",
  keep: "今くらいがちょうどいい",
  less: "少し減らしてもいい",
  either: "参加できる範囲で・どちらでもない",
};

const GACHI_LABEL: Record<SurveyPayload["gachiDays"], string> = {
  want: "ぜひ増やしてほしい",
  monthly: "月1〜2回ならほしい",
  enough: "今は普段の練習で十分",
  no: "興味はない",
};

const OPS_LABEL: Record<SurveyPayload["ops"], string> = {
  want: "携わってみたい",
  maybe: "内容によっては手伝いたい",
  no: "今は遠慮しておきたい",
};

const REGISTRATION_LABEL: Record<SurveyPayload["registration"], string> = {
  want: "希望する",
  considering: "検討中・くわしく話を聞きたい",
  trial: "今は見学・お試しで続けたい",
  no: "希望しない",
};

const rateBucket = new Map<string, number[]>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (rateBucket.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    rateBucket.set(ip, arr);
    return false;
  }
  arr.push(now);
  rateBucket.set(ip, arr);
  return true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function eventsText(p: SurveyPayload): string {
  const list = [...p.events];
  if (p.eventsOther) list.push(`その他：${p.eventsOther}`);
  return list.length ? list.join(" / ") : "—";
}

function buildHtml(p: SurveyPayload, agreedAt: string): string {
  const row = (label: string, value: string) =>
    `<tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:200px;vertical-align:top;">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`;
  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — 選手アンケート 回答</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#00F0FF;">RESPONDENT</div>
    <div style="font-size:18px;font-weight:700;margin-top:4px;">${escapeHtml(p.name || "（無記名）")}</div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    ${row("① 練習日を増やしたいか", PRACTICE_LABEL[p.practiceDays])}
    ${row("　└ 希望の曜日・時間帯・頻度", p.practiceWish || "—")}
    ${row("② ガチ練習日を増やしたいか", GACHI_LABEL[p.gachiDays])}
    ${row("③ 運営に携わりたいか", OPS_LABEL[p.ops])}
    ${row("　└ やってみたい役割", p.opsDetail || "—")}
    ${row("④ 選手登録を希望するか", REGISTRATION_LABEL[p.registration])}
    ${row("⑤ 期待するイベント", eventsText(p))}
    ${row("⑥ 今後の期待・要望", p.expectations || "—")}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#666;">回答日時：${escapeHtml(agreedAt)} (JST)</p>
</body></html>
`.trim();
}

function buildText(p: SurveyPayload, agreedAt: string): string {
  return `AWAKEN GLOW — 選手アンケート 回答

回答者: ${p.name || "（無記名）"}

① 練習日を増やしたいか: ${PRACTICE_LABEL[p.practiceDays]}
　└ 希望の曜日・時間帯・頻度: ${p.practiceWish || "—"}
② ガチ練習日を増やしたいか: ${GACHI_LABEL[p.gachiDays]}
③ 運営に携わりたいか: ${OPS_LABEL[p.ops]}
　└ やってみたい役割: ${p.opsDetail || "—"}
④ 選手登録を希望するか: ${REGISTRATION_LABEL[p.registration]}
⑤ 期待するイベント: ${eventsText(p)}
⑥ 今後の期待・要望:
${p.expectations || "—"}

回答日時: ${agreedAt} (JST)
`;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = SurveySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.JOIN_NOTIFY_TO;
  const from = process.env.JOIN_NOTIFY_FROM ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const payload = parsed.data;
  const agreedAt = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `[AWAKEN GLOW] 選手アンケート回答 — ${payload.name || "無記名"}`,
      html: buildHtml(payload, agreedAt),
      text: buildText(payload, agreedAt),
    });
    if (error) {
      console.error("survey_send_error", error);
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("survey_send_exception", e);
    return NextResponse.json(
      { ok: false, error: "send_exception" },
      { status: 502 },
    );
  }

  // Supabase へ保存（HPの回答一覧ページ用）。失敗してもメールは送れているので
  // 送信自体は成功扱いにし、エラーはログのみ残す。
  try {
    const events = [...payload.events];
    if (payload.eventsOther) events.push(`その他：${payload.eventsOther}`);
    const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/awa_survey_responses`, {
      method: "POST",
      headers: awaSupabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        name: payload.name || "",
        practice_days: PRACTICE_LABEL[payload.practiceDays],
        practice_wish: payload.practiceWish || "",
        gachi_days: GACHI_LABEL[payload.gachiDays],
        ops: OPS_LABEL[payload.ops],
        ops_detail: payload.opsDetail || "",
        registration: REGISTRATION_LABEL[payload.registration],
        events,
        events_other: payload.eventsOther || "",
        expectations: payload.expectations || "",
      }),
    });
    if (!res.ok) {
      console.error("survey_supabase_error", res.status, await res.text());
    }
  } catch (e) {
    console.error("survey_supabase_exception", e);
  }

  return NextResponse.json({ ok: true });
}
