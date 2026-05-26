import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import {
  TRAINEE_AGREEMENT_VERSION,
  TRAINEE_AGREEMENT_TEXT,
} from "@/lib/legal-text";
import { appendToSheet } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TraineeSchema = z
  .object({
    playerName: z.string().trim().min(1).max(60),
    realName: z.string().trim().min(1).max(60),
    email: z.string().trim().email().max(200),
    discordId: z.string().trim().max(80).optional().default(""),
    birthdate: z.string().trim().max(20),
    age: z.coerce.number().int().min(1).max(120),
    phone: z.string().trim().min(1).max(40),
    address: z.string().trim().min(1).max(200),
    guardianName: z.string().trim().max(80).optional().default(""),
    guardianContact: z.string().trim().max(200).optional().default(""),
    mainGame: z.string().trim().min(1).max(120),
    joinReason: z.string().trim().min(1).max(2000),
    agreementCheck: z.literal(true),
    privacyCheck: z.literal(true),
    guardianCheck: z.boolean().optional().default(false),
  })
  .refine(
    (v) => {
      if (v.age < 18) {
        return (
          v.guardianName.length > 0 &&
          v.guardianContact.length > 0 &&
          v.guardianCheck === true
        );
      }
      return true;
    },
    {
      message: "未成年の場合は保護者氏名・連絡先・同意チェックが必須です。",
      path: ["guardianName"],
    },
  );

type TraineePayload = z.infer<typeof TraineeSchema>;

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

function buildHtml(
  p: TraineePayload,
  meta: { ip: string; userAgent: string; agreedAt: string },
): string {
  const minor = p.age < 18;
  const guardian = minor
    ? `<tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">保護者氏名</th><td style="padding:8px;">${escapeHtml(p.guardianName)}</td></tr>
       <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">保護者連絡先</th><td style="padding:8px;">${escapeHtml(p.guardianContact)}</td></tr>`
    : "";

  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — 練習生登録・規約同意</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#00F0FF;">PLAYER</div>
    <div style="font-size:18px;font-weight:700;margin-top:4px;">${escapeHtml(p.playerName)} <span style="font-weight:400;color:#9aa;font-size:14px;">（${escapeHtml(p.realName)}）</span></div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">年齢 / 生年月日</th><td style="padding:8px;">${p.age}歳${minor ? "（未成年）" : ""} / ${escapeHtml(p.birthdate)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">メール</th><td style="padding:8px;">${escapeHtml(p.email)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">電話番号</th><td style="padding:8px;">${escapeHtml(p.phone)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">Discord ID</th><td style="padding:8px;">${escapeHtml(p.discordId || "—")}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">住所</th><td style="padding:8px;">${escapeHtml(p.address)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">主なプレイタイトル</th><td style="padding:8px;">${escapeHtml(p.mainGame)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;vertical-align:top;">参加希望理由</th><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(p.joinReason)}</td></tr>
    ${guardian}
  </table>
  <div style="margin-top:16px;padding:12px 14px;background:#f6f8fb;border-left:4px solid #00F0FF;font-size:13px;color:#0a0e22;">
    <div style="font-weight:700;margin-bottom:6px;">同意内容（v${TRAINEE_AGREEMENT_VERSION}）</div>
    ${escapeHtml(TRAINEE_AGREEMENT_TEXT)}
  </div>
  <p style="margin-top:16px;font-size:12px;color:#666;">
    規約同意：✅<br/>
    プライバシーポリシー同意：✅<br/>
    ${minor ? "保護者同意：✅<br/>" : ""}
    同意日時：${meta.agreedAt}<br/>
    IP：${escapeHtml(meta.ip)}<br/>
    User-Agent：${escapeHtml(meta.userAgent)}
  </p>
</body></html>
`.trim();
}

function buildText(
  p: TraineePayload,
  meta: { ip: string; userAgent: string; agreedAt: string },
): string {
  const minor = p.age < 18;
  return `AWAKEN GLOW — 練習生登録・規約同意

プレイヤー名: ${p.playerName}
本名: ${p.realName}
生年月日: ${p.birthdate} (${p.age}歳${minor ? " 未成年" : ""})
メール: ${p.email}
電話番号: ${p.phone}
Discord ID: ${p.discordId || "—"}
住所: ${p.address}
主なプレイタイトル: ${p.mainGame}

参加希望理由:
${p.joinReason}
${
  minor
    ? `\n保護者氏名: ${p.guardianName}\n保護者連絡先: ${p.guardianContact}\n`
    : ""
}
--- 同意内容 (v${TRAINEE_AGREEMENT_VERSION}) ---
${TRAINEE_AGREEMENT_TEXT}

規約同意: ✅
プライバシーポリシー同意: ✅
${minor ? "保護者同意: ✅\n" : ""}同意日時: ${meta.agreedAt}
IP: ${meta.ip}
User-Agent: ${meta.userAgent}
`;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

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

  const parsed = TraineeSchema.safeParse(json);
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
      replyTo: payload.email,
      subject: `[AWAKEN GLOW] 練習生登録 — ${payload.playerName}（${payload.age}歳）`,
      html: buildHtml(payload, { ip, userAgent, agreedAt }),
      text: buildText(payload, { ip, userAgent, agreedAt }),
    });
    if (error) {
      console.error("trainee_send_error", error);
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("trainee_send_exception", e);
    return NextResponse.json(
      { ok: false, error: "send_exception" },
      { status: 502 },
    );
  }

  // Sheets書き込みはベストエフォート（失敗してもメールは飛んでいるので成功扱い）
  try {
    await appendToSheet("trainee", {
      申請日時: agreedAt,
      プレイヤー名: payload.playerName,
      本名: payload.realName,
      メール: payload.email,
      "Discord ID": payload.discordId || "",
      生年月日: payload.birthdate,
      年齢: String(payload.age),
      電話番号: payload.phone,
      住所: payload.address,
      主なプレイタイトル: payload.mainGame,
      参加希望理由: payload.joinReason,
      保護者氏名: payload.guardianName || "",
      保護者連絡先: payload.guardianContact || "",
      規約同意: "✅",
      プライバシー同意: "✅",
      保護者同意: payload.age < 18 ? (payload.guardianCheck ? "✅" : "") : "—",
      規約バージョン: TRAINEE_AGREEMENT_VERSION,
      IP: ip,
      "User-Agent": userAgent,
      ステータス: "申請中",
      管理者メモ: "",
      "誓約書/契約書URL": "",
      "Discord メッセージURL": "",
    });
  } catch (e) {
    console.error("trainee_sheets_error", e);
    // メールは飛んでいるので成功は返す
  }

  return NextResponse.json({ ok: true });
}
