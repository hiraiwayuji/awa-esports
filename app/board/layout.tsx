import type { Metadata } from "next";

// メンバー専用のため検索エンジンにインデックスさせない
export const metadata: Metadata = {
  title: "メンバー連絡板 — AWAKEN GLOW",
  robots: { index: false, follow: false, nocache: true },
};

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
