import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スポンサー・応援パートナー募集 | AWAKEN GLOW",
  description:
    "徳島を拠点に活動するイースポーツチームAWAKEN GLOWでは、ユニフォームスポンサー、応援企業、個人協力者を募集しています。若者の挑戦と地域の新しいスポーツ文化づくりを一緒に応援してください。",
  alternates: {
    canonical: "/sponsor",
  },
  openGraph: {
    title: "スポンサー・応援パートナー募集 | AWAKEN GLOW",
    description:
      "徳島から、全国へ。ゲームを通じて、若者の挑戦と地域の未来を応援する。AWAKEN GLOWのスポンサー・応援パートナーを募集しています。",
    type: "website",
    locale: "ja_JP",
    siteName: "AWAKEN GLOW",
    url: "/sponsor",
    images: [
      {
        url: "/brand/AG-instagram-1080.png",
        width: 1080,
        height: 1080,
        alt: "AWAKEN GLOW スポンサー・応援パートナー募集",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "スポンサー・応援パートナー募集 | AWAKEN GLOW",
    description:
      "徳島から、全国へ。若者の挑戦と地域の未来を一緒に応援してくれる企業・個人を募集中。",
    site: "@awaken_glow",
    creator: "@awaken_glow",
    images: ["/brand/AG-instagram-1080.png"],
  },
};

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
