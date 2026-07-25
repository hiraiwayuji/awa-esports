import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スポンサー企業・応援企業に関する規約 | AWAKEN GLOW",
  description:
    "AWAKEN GLOW（A.G.）がスポンサー企業・応援企業を選定するための基本方針。審査を行う理由、提携の基本条件、お受けできない業種、競合・独占の方針、審査と契約の流れをまとめています。青少年育成と地域貢献、企業の信頼性を大切にしています。",
  openGraph: {
    title: "スポンサー企業・応援企業に関する規約 | AWAKEN GLOW",
    description:
      "AWAKEN GLOW がスポンサー・応援企業を選定するための基本方針。安全性・信頼性・地域貢献を大切にした提携の考え方。",
    type: "article",
    locale: "ja_JP",
    siteName: "AWAKEN GLOW",
  },
  alternates: { canonical: "/partners-policy" },
};

export default function PartnersPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
