import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import {
  PLAYER_CONTRACT_VERSION,
  PLAYER_CONTRACT_TERMS,
} from "@/lib/legal-text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RoleEnum = z.enum(["player", "streamer", "support", "other"]);

const PlayerContractSchema = z
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
    guardianEmail: z.string().trim().max(200).optional().default(""),
    guardianPhone: z.string().trim().max(40).optional().default(""),
    mainGame: z.string().trim().min(1).max(120),
    roleType: RoleEnum,
    contractStart: z.string().trim().min(1).max(20),
    contractDuration: z.string().trim().min(1).max(120),
    emergencyContact: z.string().trim().min(1).max(200),
    snsLinks: z.string().trim().max(2000).optional().default(""),
    achievements: z.string().trim().max(4000).optional().default(""),
    signature: z.string().trim().min(1).max(80),

    contractCheck: z.literal(true),
    unpaidCheck: z.literal(true),
    portraitCheck: z.literal(true),
    snsCheck: z.literal(true),
    ndaCheck: z.literal(true),
    cheatCheck: z.literal(true),
    antiSocialCheck: z.literal(true),
    privacyCheck: z.literal(true),
    guardianCheck: z.boolean().optional().default(false),
  })
  .refine(
    (v) => {
      if (v.age < 18) {
        return (
          v.guardianName.length > 0 &&
          v.guardianEmail.length > 0 &&
          v.guardianPhone.length > 0 &&
          v.guardianCheck === true
        );
      }
      return true;
    },
    {
      message:
        "未成年の場合は保護者氏名・メール・電話・同意チェックが必須です。",
      path: ["guardianName"],
    },
  )
  .refine(
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email),
    { message: "メールアドレスの形式が不正です。", path: ["email"] },
  );

type PlayerContractPayload = z.infer<typeof PlayerContractSchema>;

const ROLE_LABEL: Record<PlayerContractPayload["roleType"], string> = {
  player: "選手",
  streamer: "ストリーマー",
  support: "サポートメンバー",
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

function buildHtml(
  p: PlayerContractPayload,
  meta: { ip: string; userAgent: string; agreedAt: string },
): string {
  const minor = p.age < 18;
  const guardian = minor
    ? `<tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">保護者氏名</th><td style="padding:8px;">${escapeHtml(p.guardianName)}</td></tr>
       <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">保護者メール</th><td style="padding:8px;">${escapeHtml(p.guardianEmail)}</td></tr>
       <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">保護者電話</th><td style="padding:8px;">${escapeHtml(p.guardianPhone)}</td></tr>`
    : "";

  const termsHtml = PLAYER_CONTRACT_TERMS.map(
    (t, i) =>
      `<li style="margin-bottom:6px;">${i + 1}. ${escapeHtml(t)}</li>`,
  ).join("");

  const checkRow = (label: string, val: boolean) =>
    `<div style="margin-top:3px;">${val ? "✅" : "❌"} ${escapeHtml(label)}</div>`;

  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — 正式選手登録・電子契約</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#00F0FF;">PLAYER</div>
    <div style="font-size:18px;font-weight:700;margin-top:4px;">${escapeHtml(p.playerName)} <span style="font-weight:400;color:#9aa;font-size:14px;">（${escapeHtml(p.realName)}）</span></div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">生年月日 / 年齢</th><td style="padding:8px;">${escapeHtml(p.birthdate)} / ${p.age}歳${minor ? "（未成年）" : ""}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">メール</th><td style="padding:8px;">${escapeHtml(p.email)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">電話番号</th><td style="padding:8px;">${escapeHtml(p.phone)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">住所</th><td style="padding:8px;">${escapeHtml(p.address)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">Discord ID</th><td style="padding:8px;">${escapeHtml(p.discordId || "—")}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">所属部門 / タイトル</th><td style="padding:8px;">${escapeHtml(p.mainGame)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">活動区分</th><td style="padding:8px;">${escapeHtml(ROLE_LABEL[p.roleType])}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">契約開始日</th><td style="padding:8px;">${escapeHtml(p.contractStart)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">契約期間</th><td style="padding:8px;">${escapeHtml(p.contractDuration)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">緊急連絡先</th><td style="padding:8px;">${escapeHtml(p.emergencyContact)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;vertical-align:top;">SNSアカウント</th><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(p.snsLinks || "—")}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;vertical-align:top;">大会実績</th><td style="padding:8px;white-space:pre-wrap;">${escapeHtml(p.achievements || "—")}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">署名</th><td style="padding:8px;font-weight:700;">${escapeHtml(p.signature)}</td></tr>
    ${guardian}
  </table>

  <div style="margin-top:18px;padding:14px;background:#f6f8fb;border-left:4px solid #00F0FF;font-size:13px;color:#0a0e22;">
    <div style="font-weight:700;margin-bottom:8px;">契約条文（v${PLAYER_CONTRACT_VERSION}）</div>
    <ol style="margin:0;padding:0 0 0 18px;">${termsHtml}</ol>
  </div>

  <div style="margin-top:14px;padding:12px 14px;background:#fff;border:1px solid #d8dde8;border-radius:8px;font-size:13px;">
    <div style="font-weight:700;margin-bottom:4px;">同意チェック</div>
    ${checkRow("契約内容確認", p.contractCheck)}
    ${checkRow("無報酬であることへの同意", p.unpaidCheck)}
    ${checkRow("肖像権・写真・動画利用への同意", p.portraitCheck)}
    ${checkRow("SNS・配信利用への同意", p.snsCheck)}
    ${checkRow("NDA / 機密保持への同意", p.ndaCheck)}
    ${checkRow("チート・不正行為禁止への同意", p.cheatCheck)}
    ${checkRow("反社会的勢力ではないことの誓約", p.antiSocialCheck)}
    ${checkRow("個人情報取扱いへの同意", p.privacyCheck)}
    ${minor ? checkRow("保護者同意", p.guardianCheck === true) : ""}
  </div>

  <p style="margin-top:16px;font-size:12px;color:#666;">
    同意日時：${meta.agreedAt}<br/>
    IP：${escapeHtml(meta.ip)}<br/>
    User-Agent：${escapeHtml(meta.userAgent)}
  </p>
</body></html>
`.trim();
}

function buildText(
  p: PlayerContractPayload,
  meta: { ip: string; userAgent: string; agreedAt: string },
): string {
  const minor = p.age < 18;
  const checks = [
    `契約内容確認: ${p.contractCheck ? "✅" : "❌"}`,
    `無報酬であることへの同意: ${p.unpaidCheck ? "✅" : "❌"}`,
    `肖像権・写真・動画利用への同意: ${p.portraitCheck ? "✅" : "❌"}`,
    `SNS・配信利用への同意: ${p.snsCheck ? "✅" : "❌"}`,
    `NDA / 機密保持への同意: ${p.ndaCheck ? "✅" : "❌"}`,
    `チート・不正行為禁止への同意: ${p.cheatCheck ? "✅" : "❌"}`,
    `反社会的勢力ではないことの誓約: ${p.antiSocialCheck ? "✅" : "❌"}`,
    `個人情報取扱いへの同意: ${p.privacyCheck ? "✅" : "❌"}`,
  ];
  if (minor) checks.push(`保護者同意: ${p.guardianCheck ? "✅" : "❌"}`);

  return `AWAKEN GLOW — 正式選手登録・電子契約

プレイヤー名: ${p.playerName}
本名: ${p.realName}
生年月日: ${p.birthdate} (${p.age}歳${minor ? " 未成年" : ""})
メール: ${p.email}
電話: ${p.phone}
住所: ${p.address}
Discord ID: ${p.discordId || "—"}
所属部門 / タイトル: ${p.mainGame}
活動区分: ${ROLE_LABEL[p.roleType]}
契約開始日: ${p.contractStart}
契約期間: ${p.contractDuration}
緊急連絡先: ${p.emergencyContact}

SNSアカウント:
${p.snsLinks || "—"}

大会実績:
${p.achievements || "—"}

署名: ${p.signature}
${
  minor
    ? `\n保護者氏名: ${p.guardianName}\n保護者メール: ${p.guardianEmail}\n保護者電話: ${p.guardianPhone}\n`
    : ""
}
--- 契約条文 (v${PLAYER_CONTRACT_VERSION}) ---
${PLAYER_CONTRACT_TERMS.map((t, i) => `${i + 1}. ${t}`).join("\n")}

--- 同意チェック ---
${checks.join("\n")}

同意日時: ${meta.agreedAt}
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

  const parsed = PlayerContractSchema.safeParse(json);
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
      subject: `[AWAKEN GLOW] 正式選手契約 — ${payload.playerName}（${payload.age}歳・${ROLE_LABEL[payload.roleType]}）`,
      html: buildHtml(payload, { ip, userAgent, agreedAt }),
      text: buildText(payload, { ip, userAgent, agreedAt }),
    });
    if (error) {
      console.error("contract_send_error", error);
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("contract_send_exception", e);
    return NextResponse.json(
      { ok: false, error: "send_exception" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
