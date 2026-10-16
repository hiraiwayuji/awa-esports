// 請求書PDFの文字から、帳簿に入れる中身（日付・項目・金額・メモ）を読み取る。
// 主に CyberSheeep（会場）の請求書の書式に合わせているが、
// 「請求日／件名／合計 ○○円」がある請求書なら最低限は読める。

export type InvoiceLine = { qty: number; unitPrice: number; amount: number; label: string };

export type ParsedInvoice = {
  invoiceNo: string;
  issueDate: string; // YYYY-MM-DD（読めなければ ""）
  dueDate: string;
  eventDate: string; // 件名の日付（練習会の日）。読めなければ請求日
  subject: string;
  vendor: string;
  total: number;
  lines: InvoiceLine[];
  item: string;
  memo: string;
};

const num = (s: string) => Number.parseInt(s.replace(/[,，]/g, ""), 10);
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const md = (isoDate: string) => {
  const [, m, d] = isoDate.split("-").map(Number);
  return `${m}/${d}`;
};

// 「2026年10月4日」も「2026 9 14」（年月日の文字が抜けたPDF）も読む
function findDate(text: string, label: string): string {
  const re = new RegExp(`${label}\\s*(\\d{4})\\s*年?\\s*(\\d{1,2})\\s*月?\\s*(\\d{1,2})\\s*日?`);
  const m = re.exec(text);
  return m ? iso(Number(m[1]), Number(m[2]), Number(m[3])) : "";
}

export function parseInvoiceText(raw: string): ParsedInvoice | null {
  const text = raw.replace(/　/g, " ");

  const totalM = /合計\s*([\d,，]+)\s*円/.exec(text) ?? /合計\s*([\d,，]+)/.exec(text);
  if (!totalM) return null;
  const total = num(totalM[1]);
  if (!Number.isFinite(total) || total <= 0) return null;

  const invoiceNo = /No\.?\s*(\d{6,})/.exec(text)?.[1] ?? "";
  const issueDate = findDate(text, "請求日");
  const dueDate = findDate(text, "支払期限");

  // 件名は「件名 10月4日定期練習会 株式会社CyberSheeep」のように会社名が同じ行に続くことがある
  let subject = (/件名\s*([^\n]+)/.exec(text)?.[1] ?? "").trim();
  subject = subject.replace(/\s*(株式会社|有限会社|合同会社)\S*.*$/, "").trim();

  const vendor = /CyberSheeep|サイバーシープ/i.test(text)
    ? "CyberSheeep"
    : (/(?:株式会社|有限会社|合同会社)\s*(\S+)/.exec(text)?.[1] ?? "");

  // 件名の「10月4日」を練習会の日とみなす（年は請求日から。12月の会を1月に請求された場合は前年）
  let eventDate = "";
  const sm = /(\d{1,2})月(\d{1,2})日/.exec(subject);
  if (sm) {
    const issueY = issueDate ? Number(issueDate.slice(0, 4)) : new Date().getFullYear();
    const issueM = issueDate ? Number(issueDate.slice(5, 7)) : 12;
    const m = Number(sm[1]);
    eventDate = iso(m > issueM ? issueY - 1 : issueY, m, Number(sm[2]));
  } else {
    const pm = /利用料（(\d{4})\.(\d{1,2})\.(\d{1,2})）/.exec(text);
    eventDate = pm ? iso(Number(pm[1]), Number(pm[2]), Number(pm[3])) : issueDate;
  }
  const subjectRest = subject.replace(/^\d{1,2}月\d{1,2}日\s*/, "");

  // 明細「4 人 1,400 5,600」と、摘要「施設利用料（2026.10.4）半日」を上から順に対応させる
  const labels = Array.from(text.matchAll(/利用料（[^）]*）\s*(\S+)/g)).map((m) => m[1]);
  const lines: InvoiceLine[] = Array.from(
    text.matchAll(/(\d+)\s*人\s*([\d,，]+)\s+([\d,，]+)/g),
  ).map((m, i) => ({
    qty: Number(m[1]),
    unitPrice: num(m[2]),
    amount: num(m[3]),
    label: labels[i] ?? "",
  }));

  const datePart = eventDate ? md(eventDate) : "";
  const item =
    vendor === "CyberSheeep"
      ? `施設利用料（${datePart}${subjectRest}・CyberSheeep）`
      : `${subject || "請求書"}${vendor ? `（${vendor}）` : ""}`;

  const head = [
    issueDate ? `請求日${md(issueDate)}` : "",
    dueDate ? `支払期限${md(dueDate)}` : "",
  ]
    .filter(Boolean)
    .join("・");
  const breakdown = lines
    .map(
      (l) =>
        `${l.label}${l.unitPrice.toLocaleString("ja-JP")}円×${l.qty}=${l.amount.toLocaleString("ja-JP")}円`,
    )
    .join("、");
  const memo = [
    `${invoiceNo ? `請求書No.${invoiceNo}` : "請求書"}${head ? `（${head}）` : ""}`,
    breakdown ? `内訳:${breakdown}` : "",
  ]
    .filter(Boolean)
    .join("／");

  return { invoiceNo, issueDate, dueDate, eventDate, subject, vendor, total, lines, item, memo };
}
