import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "経理（会計）— AWAKEN GLOW",
  robots: { index: false, follow: false, nocache: true },
};

export default function LedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
