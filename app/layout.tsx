import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "AWA ESPORTS — 徳島から世界へ",
  description:
    "eスポーツを通じて徳島を盛り上げる。阿波の伝統と未来の競技をつなぐe-sportsチーム公式サイト。",
  keywords: [
    "eスポーツ",
    "徳島",
    "AWA ESPORTS",
    "ゲーミング",
    "e-sports",
    "Tokushima",
  ],
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
        <div className="fixed inset-0 -z-10 cyber-grid" />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
