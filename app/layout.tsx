import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import CursorGlow from "@/components/CursorGlow";

export const metadata: Metadata = {
  metadataBase: new URL("https://awa-esports.vercel.app"),
  title: "AWAKEN GLOW — 一人ひとりの輝きが目覚める場所。",
  description:
    "AWAKEN GLOW（A.G.）は徳島を拠点とするeスポーツチーム。経験や年齢に関係なく、挑戦したい人、仲間と成長したい人を歓迎します。",
  keywords: [
    "AWAKEN GLOW",
    "A.G.",
    "eスポーツ",
    "esports",
    "徳島",
    "阿波",
    "Tokushima",
  ],
  openGraph: {
    title: "AWAKEN GLOW — 一人ひとりの輝きが目覚める場所。",
    description:
      "徳島を拠点とするeスポーツチーム。経験や年齢に関係なく、挑戦したい人、仲間と成長したい人を歓迎します。",
    type: "website",
    locale: "ja_JP",
    siteName: "AWAKEN GLOW",
    images: [
      {
        url: "/brand/AG-instagram-1080.png",
        width: 1080,
        height: 1080,
        alt: "AWAKEN GLOW",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AWAKEN GLOW — 一人ひとりの輝きが目覚める場所。",
    description: "徳島発のeスポーツチーム AWAKEN GLOW。",
    site: "@awaken_glow",
    creator: "@awaken_glow",
    images: ["/brand/AG-instagram-1080.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Anton&family=Noto+Sans+JP:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative overflow-x-hidden">
        <ParticleBackground />
        <div className="aurora-layer" aria-hidden>
          <div className="aurora-blob aurora-a" />
          <div className="aurora-blob aurora-b" />
          <div className="aurora-blob aurora-c" />
        </div>
        <CursorGlow />
        <div className="fixed inset-0 -z-10 cyber-grid" />
        <div className="noise-overlay" aria-hidden />
        <div className="scanline-overlay" aria-hidden />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
