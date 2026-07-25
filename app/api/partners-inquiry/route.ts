import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { type SaveResult, subjectPrefix, htmlWarning, textWarning } from "@/lib/notify";
import { isSponsorDbConfigured, sbInsert } from "@/lib/sponsor/supabase-admin";
import { SUPPORT_KINDS } from "@/lib/sponsor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DesiredEnum = z.enum(["sponsor", "supporter", "consult"]);

const InquirySchema = z
  .object({
    companyName: z.string().trim().min(1).max(120),
    contactName: z.string().trim().min(1).max(80),
    email: z.string().trim().min(1).max(200),
    phone: z.string().trim().max(40).optional().default(""),
    address: z.string().trim().max(200).optional().default(""),
    websiteUrl: z.string().trim().max(500).optional().default(""),
    snsUrl: z.string().trim().max(500).optional().default(""),
    businessDescription: z.string().trim().max(2000).optional().default(""),
    desiredType: DesiredEnum,
    supportKinds: z.array(z.string().trim().max(40)).max(10).optional().default([]),
    placementWish: z.string().trim().max(2000).optional().default(""),
    targetEvents: z.string().trim().max(500).optional().default(""),
    freeText: z.string().trim().max(4000).optional().default(""),
    agreed: z.literal(true),
    submissionId: z.string().uuid().optional(),
  })
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email), {
    message: "メールアドレスの形式が不正です。",
    path: ["email"],
  });

type Payload = z.infer<typeof InquirySchema>;

const DESIRED_LABEL: Record<Payload["desiredType"], string> = {
  sponsor: "スポンサー企業",
  supporter: "応援企業",
  consult: "相談したい",
};

const limiter = createRateLimiter(3, 5 * 60 * 1000);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(p: Payload, at: string): string {
  const row = (label: string, value: string) =>
    `<tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:180px;vertical-align:top;">${escapeHtml(label)}</th><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(value || "—")}</td></tr>`;
  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — スポンサー・応援企業 お問い合わせ</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#2DFFB7;">希望区分</div>
    <div style="font-size:18px;font-weight:700;margin-top:6px;">${escapeHtml(DESIRED_LABEL[p.desiredType])}</div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    ${row("企業名・屋号", p.companyName)}
    ${row("担当者名", p.contactName)}
    ${row("メールアドレス", p.email)}
    ${row("電話番号", p.phone)}
    ${row("所在地", p.address)}
    ${row("公式サイトURL", p.websiteUrl)}
    ${row("SNS URL", p.snsUrl)}
    ${row("主な事業内容", p.businessDescription)}
    ${row("希望する支援内容", p.supportKinds.join(" / "))}
    ${row("希望する掲載内容", p.placementWish)}
    ${row("対象イベント/ゲーム", p.targetEvents)}
    ${row("自由記入", p.freeText)}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#666;">送信日時：${escapeHtml(at)} (JST)<br/>※ そのまま返信すると、お問い合わせ者へ直接届きます。</p>
</body></html>`.trim();
}

function buildText(p: Payload, at: string): string {
  return `AWAKEN GLOW — スポンサー・応援企業 お問い合わせ

【希望区分】${DESIRED_LABEL[p.desiredType]}

企業名・屋号: ${p.companyName}
担当者名: ${p.contactName}
メール: ${p.email}
電話番号: ${p.phone || "—"}
所在地: ${p.address || "—"}
公式サイト: ${p.websiteUrl || "—"}
SNS: ${p.snsUrl || "—"}
事業内容: ${p.businessDescription || "—"}
希望する支援内容: ${p.supportKinds.join(" / ") || "—"}
希望する掲載内容: ${p.placementWish || "—"}
対象イベント/ゲーム: ${p.targetEvents || "—"}
自由記入:
${p.freeText || "—"}

送信日時: ${at} (JST)
`;
}

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

  const parsed = InquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  limiter.record(ip);
  const p = parsed.data;

  // サポート種別を既定のリストに正規化（未知値は除外）。
  const kinds = p.supportKinds.filter((k) => (SUPPORT_KINDS as readonly string[]).includes(k));
  const at = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  // まず保存（service_role キーがある時のみ）。問い合わせ情報は非公開テーブルへ。
  let save: SaveResult = "skipped";
  if (isSponsorDbConfigured()) {
    save = "failed";
    try {
      await sbInsert("awa_sponsor_inquiries", {
        submission_id: p.submissionId ?? null,
        company_name: p.companyName,
        contact_name: p.contactName,
        email: p.email,
        phone: p.phone,
        address: p.address,
        website_url: p.websiteUrl,
        sns_url: p.snsUrl,
        business_description: p.businessDescription,
        desired_type: p.desiredType,
        support_kinds: kinds,
        placement_wish: p.placementWish,
        target_events: p.targetEvents,
        free_text: p.freeText,
        agreed: true,
        status: "new",
      });
      save = "ok";
    } catch (e) {
      console.error("inquiry_save_error", e);
    }
  }

  // 通知メール（保存の成否を反映）。設定が無ければ保存だけで成功扱い。
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SPONSOR_NOTIFY_TO || process.env.JOIN_NOTIFY_TO;
  const from =
    process.env.SPONSOR_NOTIFY_FROM ||
    process.env.JOIN_NOTIFY_FROM ||
    "AWAKEN GLOW <onboarding@resend.dev>";

  if (apiKey && to) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: p.email,
        subject: `${subjectPrefix(save)}[AWAKEN GLOW] スポンサー問い合わせ — ${DESIRED_LABEL[p.desiredType]}（${p.companyName}）`,
        html: htmlWarning(save) + buildHtml(p, at),
        text: textWarning(save) + buildText(p, at),
      });
      if (error) {
        console.error("inquiry_send_error", error);
        // 保存に成功していれば記録は残るので ok を返す。
        if (save !== "ok") {
          return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
        }
      }
    } catch (e) {
      console.error("inquiry_send_exception", e);
      if (save !== "ok") {
        return NextResponse.json({ ok: false, error: "send_exception" }, { status: 502 });
      }
    }
  } else if (save !== "ok") {
    // 保存もメールもできない = 記録が残らない
    return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
