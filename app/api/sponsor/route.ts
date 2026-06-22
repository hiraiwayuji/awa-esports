import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inquiryEnum = z.enum([
  "sponsor",
  "supporter",
  "goods",
  "event",
  "other",
]);

const SponsorSchema = z.object({
  inquiryType: inquiryEnum,
  name: z.string().trim().min(1).max(80),
  company: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().min(1).max(200),
  menu: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1).max(4000),
}).refine(
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email),
  { message: "メールアドレスの形式が不正です。", path: ["email"] },
);

type SponsorPayload = z.infer<typeof SponsorSchema>;

const INQUIRY_LABEL: Record<SponsorPayload["inquiryType"], string> = {
  sponsor: "スポンサーについて",
  supporter: "応援企業として相談",
  goods: "物品協賛",
  event: "イベント協賛",
  other: "その他",
};

const rateBucket = new Map<string, number[]>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 3;

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

function buildHtml(p: SponsorPayload): string {
  const company = p.company || "—";
  const menu = p.menu || "—";
  const messageHtml = escapeHtml(p.message).replace(/\n/g, "<br/>");
  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — スポンサー・応援パートナーお問い合わせ</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#2DFFB7;">INQUIRY</div>
    <div style="font-size:18px;font-weight:700;margin-top:6px;">${escapeHtml(INQUIRY_LABEL[p.inquiryType])}</div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">お名前</th><td style="padding:8px;">${escapeHtml(p.name)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">企業名・店名</th><td style="padding:8px;">${escapeHtml(company)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">返信先メール</th><td style="padding:8px;"><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">気になるメニュー</th><td style="padding:8px;">${escapeHtml(menu)}</td></tr>
  </table>
  <div style="margin-top:14px;padding:12px 14px;border:1px solid #e3e8f0;border-radius:8px;font-size:14px;line-height:1.7;">
    ${messageHtml}
  </div>
  <p style="margin-top:16px;font-size:12px;color:#666;">送信日時：${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} (JST)<br/>※ そのまま返信すると、お問い合わせ者へ直接届きます。</p>
</body></html>
`.trim();
}

function buildText(p: SponsorPayload): string {
  return `AWAKEN GLOW — スポンサー・応援パートナーお問い合わせ

【種別】${INQUIRY_LABEL[p.inquiryType]}

お名前: ${p.name}
企業名・店名: ${p.company || "—"}
返信先メール: ${p.email}
気になるメニュー: ${p.menu || "—"}

【お問い合わせ内容】
${p.message}

送信日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} (JST)
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
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = SponsorSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  // 配信先はサーバーEnvにのみ保持（ページには一切出さない）。
  // スポンサー専用 SPONSOR_NOTIFY_TO を優先し、無ければ共通の JOIN_NOTIFY_TO を使用。
  const to = process.env.SPONSOR_NOTIFY_TO || process.env.JOIN_NOTIFY_TO;
  // 空文字Envでも安全に既定値へフォールバックするよう `||` を使用。
  const from =
    process.env.SPONSOR_NOTIFY_FROM ||
    process.env.JOIN_NOTIFY_FROM ||
    "AWAKEN GLOW <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  const payload = parsed.data;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: `[AWAKEN GLOW] スポンサーお問い合わせ — ${INQUIRY_LABEL[payload.inquiryType]}（${payload.company || payload.name}）`,
      html: buildHtml(payload),
      text: buildText(payload),
    });
    if (error) {
      console.error("resend_send_error", error);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch (e) {
    console.error("resend_exception", e);
    return NextResponse.json({ ok: false, error: "send_exception" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
