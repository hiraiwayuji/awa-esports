// ブラウザで請求書PDFの文字を取り出して読む（帳簿ページ用）。
// pdf.js は使うときだけ cdnjs から読み込む。
import { parseInvoiceText, type ParsedInvoice } from "@/lib/invoice-parse";

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{ items: { str?: string; hasEOL?: boolean }[] }>;
      }>;
    }>;
  };
};

async function loadPdfJs(): Promise<PdfJs> {
  const w = window as unknown as { pdfjsLib?: PdfJs };
  if (!w.pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `${PDFJS}/pdf.min.js`;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("pdfjs"));
      document.head.appendChild(s);
    });
  }
  const lib = w.pdfjsLib as PdfJs;
  lib.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.js`;
  return lib;
}

export async function pdfText(data: ArrayBuffer): Promise<string> {
  const lib = await loadPdfJs();
  const doc = await lib.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    for (const it of content.items) text += (it.str ?? "") + (it.hasEOL ? "\n" : " ");
    text += "\n";
  }
  return text;
}

/** PDFを請求書として読む。PDFでない・読めないときは null */
export async function readInvoicePdf(file: File): Promise<ParsedInvoice | null> {
  if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") return null;
  return parseInvoiceText(await pdfText(await file.arrayBuffer()));
}
