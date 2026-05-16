import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactMethodEnum = z.enum(["email", "line", "phone"]);
const residencyEnum = z.enum(["current", "former", "neighbor", "other"]);
const divisionEnum = z.enum(["SF6", "PUYO", "UNDECIDED"]);

const JoinSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    nameKana: z.string().trim().min(1).max(80),
    age: z.coerce.number().int().min(1).max(120),
    residency: residencyEnum,
    contactMethod: contactMethodEnum,
    contactValue: z.string().trim().min(1).max(200),
    divisions: z.array(divisionEnum).min(1).max(3),
    favoriteGame: z.string().trim().max(120).optional().default(""),
    guardianName: z.string().trim().max(80).optional().default(""),
    guardianContact: z.string().trim().max(200).optional().default(""),
    consent: z.literal(true),
  })
  .refine(
    (v) => {
      if (v.age < 18) {
        return v.guardianName.length > 0 && v.guardianContact.length > 0;
      }
      return true;
    },
    { message: "未成年の場合は保護者情報が必須です。", path: ["guardianName"] },
  );

type JoinPayload = z.infer<typeof JoinSchema>;

const RESIDENCY_LABEL: Record<JoinPayload["residency"], string> = {
  current: "現在 徳島県在住",
  former: "元 徳島県民",
  neighbor: "隣県在住で興味あり",
  other: "それ以外で興味あり",
};

const METHOD_LABEL: Record<JoinPayload["contactMethod"], string> = {
  email: "メール",
  line: "LINE ID",
  phone: "電話番号",
};

const DIVISION_LABEL: Record<JoinPayload["divisions"][number], string> = {
  SF6: "STREET FIGHTER 6 部門",
  PUYO: "ぷよぷよeスポーツ 部門",
  UNDECIDED: "未定 / 相談したい",
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

function buildHtml(p: JoinPayload): string {
  const divisions = p.divisions.map((d) => DIVISION_LABEL[d]).join(" / ");
  const guardianBlock = p.age < 18
    ? `<tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">保護者氏名</th><td style="padding:8px;">${escapeHtml(p.guardianName)}</td></tr>
       <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">保護者連絡先</th><td style="padding:8px;">${escapeHtml(p.guardianContact)}</td></tr>`
    : "";
  return `
<!doctype html><html lang="ja"><body style="font-family:system-ui,'Hiragino Sans','Yu Gothic UI',sans-serif;color:#0a0e22;">
  <h2 style="margin:0 0 12px;">AWAKEN GLOW — 入会申込</h2>
  <div style="background:#0a0e22;color:#fff;padding:14px 16px;border-radius:10px;margin:12px 0;">
    <div style="font-size:12px;letter-spacing:0.2em;color:#00F0FF;">CONTACT</div>
    <div style="font-size:18px;font-weight:700;margin-top:4px;">${escapeHtml(METHOD_LABEL[p.contactMethod])}：${escapeHtml(p.contactValue)}</div>
  </div>
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;width:160px;">お名前</th><td style="padding:8px;">${escapeHtml(p.name)}（${escapeHtml(p.nameKana)}）</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">年齢</th><td style="padding:8px;">${p.age}歳${p.age < 18 ? "（未成年）" : ""}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">徳島との関係</th><td style="padding:8px;">${escapeHtml(RESIDENCY_LABEL[p.residency])}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">興味のある部門</th><td style="padding:8px;">${escapeHtml(divisions)}</td></tr>
    <tr><th style="text-align:left;padding:8px;background:#f6f8fb;">好きなゲーム</th><td style="padding:8px;">${escapeHtml(p.favoriteGame || "—")}</td></tr>
    ${guardianBlock}
  </table>
  <p style="margin-top:16px;font-size:12px;color:#666;">プライバシーポリシー同意：✅<br/>送信日時：${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} (JST)</p>
</body></html>
`.trim();
}

function buildText(p: JoinPayload): string {
  const divisions = p.divisions.map((d) => DIVISION_LABEL[d]).join(" / ");
  const guardianBlock = p.age < 18
    ? `保護者氏名: ${p.guardianName}\n保護者連絡先: ${p.guardianContact}\n`
    : "";
  return `AWAKEN GLOW — 入会申込

【連絡先】 ${METHOD_LABEL[p.contactMethod]}: ${p.contactValue}

お名前: ${p.name}（${p.nameKana}）
年齢: ${p.age}歳${p.age < 18 ? "（未成年）" : ""}
徳島との関係: ${RESIDENCY_LABEL[p.residency]}
興味のある部門: ${divisions}
好きなゲーム: ${p.favoriteGame || "—"}
${guardianBlock}プライバシーポリシー同意: ✅
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
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = JoinSchema.safeParse(json);
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

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo:
        payload.contactMethod === "email" ? payload.contactValue : undefined,
      subject: `[AWAKEN GLOW] 入会申込 — ${payload.name}（${payload.age}歳・${RESIDENCY_LABEL[payload.residency]}）`,
      html: buildHtml(payload),
      text: buildText(payload),
    });
    if (error) {
      console.error("resend_send_error", error);
      return NextResponse.json(
        { ok: false, error: "send_failed" },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("resend_exception", e);
    return NextResponse.json(
      { ok: false, error: "send_exception" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
