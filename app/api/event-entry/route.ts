import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { AWA_SUPABASE_URL, awaSupabaseHeaders } from "@/lib/awa-supabase";
import { practiceEventLabel } from "@/lib/practice-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AttendEnum = z.enum(["first", "again", "watch"]);
const TimeSlotEnum = z.enum(["morning", "afternoon", "full"]);

const EventEntrySchema = z
  .object({
    eventDate: z.string().trim().max(20),
    name: z.string().trim().min(1).max(80),
    contact: z.string().trim().min(1).max(200),
    attendType: AttendEnum,
    // 古いページを開いたままの人が送っても弾かれないよう任意にし、
    // 未選択なら通知メールに「未選択」と出して運営が拾えるようにする。
    timeSlot: TimeSlotEnum.optional(),
    titles: z.array(z.string().trim().max(80)).max(20).optional().default([]),
    titlesOther: z.string().trim().max(200).optional().default(""),
    isMinor: z.boolean().optional().default(false),
    guardianConsent: z.boolean().optional().default(false),
    message: z.string().trim().max(2000).optional().default(""),
    photoNg: z.boolean().optional().default(false),
  })
  .refine((v) => (v.isMinor ? v.guardianConsent === true : true), {
    message: "未成年の場合は保護者同意チェックが必須です。",
    path: ["guardianConsent"],
  });

type EventEntryPayload = z.infer<typeof EventEntrySchema>;

const ATTEND_LABEL: Record<EventEntryPayload["attendType"], string> = {
  first: "初めて参加する",
  again: "参加したことがある",
  watch: "観戦・見学だけ",
};

const SLOT_LABEL: Record<z.infer<typeof TimeSlotEnum>, string> = {
  morning: "午前だけ（10:00–14:00）",
  afternoon: "午後だけ（14:00–18:00）",
  full: "一日通し（10:00–18:00）",
};

function slotText(p: EventEntryPayload): string {
  return p.timeSlot ? SLOT_LABEL[p.timeSlot] : "未選択";
}

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

function titlesText(p: EventEntryPayload): string {
  const list = [...p.titles];
  if (p.titlesOther) list.push(`その他：${p.titlesOther}`);
  return list.length ? list.join(" / ") : "—";
}

function buildHtml(p: EventEntryPayload, meta: { agreedAt: string }): string {
  const row = (label: string, value: string) =>
    `<tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:180px;vertical-align:top;">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`;
  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — ${escapeHtml(practiceEventLabel(p.eventDate))} 練習会 参加申込</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#2DFFB7;">ENTRY</div>
    <div style="font-size:18px;font-weight:700;margin-top:4px;">${escapeHtml(p.name)}</div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    ${row("開催日", p.eventDate)}
    ${row("連絡先", p.contact)}
    ${row("参加のかたち", ATTEND_LABEL[p.attendType])}
    ${row("参加する時間帯", slotText(p))}
    ${row("プレイしたいタイトル", titlesText(p))}
    ${row("18歳未満", p.isMinor ? `はい（保護者同意：${p.guardianConsent ? "✅" : "未"}）` : "いいえ")}
    ${row("ひとこと・質問", p.message || "—")}
    ${row("写真の掲載", p.photoNg ? "⚠ 掲載NG（載せないでほしい）" : "OK")}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#666;">申込日時：${escapeHtml(meta.agreedAt)} (JST)</p>
</body></html>
`.trim();
}

function buildText(p: EventEntryPayload, meta: { agreedAt: string }): string {
  return `AWAKEN GLOW — ${practiceEventLabel(p.eventDate)} 練習会 参加申込

お名前: ${p.name}
開催日: ${p.eventDate}
連絡先: ${p.contact}
参加のかたち: ${ATTEND_LABEL[p.attendType]}
参加する時間帯: ${slotText(p)}
プレイしたいタイトル: ${titlesText(p)}
18歳未満: ${p.isMinor ? `はい（保護者同意：${p.guardianConsent ? "✅" : "未"}）` : "いいえ"}
ひとこと・質問:
${p.message || "—"}
写真の掲載: ${p.photoNg ? "掲載NG（載せないでほしい）" : "OK"}

申込日時: ${meta.agreedAt} (JST)
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

  const parsed = EventEntrySchema.safeParse(json);
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
      subject: `[AWAKEN GLOW] ${practiceEventLabel(payload.eventDate)} 練習会 参加申込 — ${payload.name}`,
      html: buildHtml(payload, { agreedAt }),
      text: buildText(payload, { agreedAt }),
    });
    if (error) {
      console.error("event_entry_send_error", error);
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("event_entry_send_exception", e);
    return NextResponse.json(
      { ok: false, error: "send_exception" },
      { status: 502 },
    );
  }

  // Supabase へ保存（管理用）。失敗してもメールは送れているので成功扱いにし、
  // エラーはログのみ残す。
  try {
    const titles = [...payload.titles];
    if (payload.titlesOther) titles.push(`その他：${payload.titlesOther}`);
    const res = await fetch(`${AWA_SUPABASE_URL}/rest/v1/awa_event_entries`, {
      method: "POST",
      headers: awaSupabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        event_date: payload.eventDate,
        name: payload.name,
        contact: payload.contact,
        attend_type: ATTEND_LABEL[payload.attendType],
        time_slot: payload.timeSlot ? SLOT_LABEL[payload.timeSlot] : "",
        titles,
        titles_other: payload.titlesOther || "",
        is_minor: payload.isMinor,
        guardian_consent: payload.guardianConsent,
        message: payload.message || "",
        photo_ng: payload.photoNg,
      }),
    });
    if (!res.ok) {
      console.error("event_entry_supabase_error", res.status, await res.text());
    }
  } catch (e) {
    console.error("event_entry_supabase_exception", e);
  }

  return NextResponse.json({ ok: true });
}
