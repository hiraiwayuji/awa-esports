import type { Metadata } from "next";

// メンバー専用のため検索エンジンにインデックスさせない
export const metadata: Metadata = {
  title: "メンバー資料・議事録 — AWAKEN GLOW",
  robots: { index: false, follow: false, nocache: true },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
