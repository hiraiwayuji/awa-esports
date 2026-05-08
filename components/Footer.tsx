import Link from "next/link";
import { Twitter, Instagram, Youtube, Twitch } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-neon-cyan/20 bg-awa-indigo-950/80 backdrop-blur-md">
      <div className="divider-neon" />
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display font-black tracking-[0.2em] text-lg text-white">
            AWAKEN GLOW
          </div>
          <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-md">
            徳島から新しいeスポーツ文化をつくるチーム。
            <br />
            経験や年齢に関係なく、挑戦する人が集まり、
            <br />
            仲間とともに成長できる場所を目指します。
          </p>
          <div className="mt-6 flex gap-3">
            {[Twitter, Instagram, Youtube, Twitch].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 grid place-items-center rounded-full border border-white/15 hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-display tracking-[0.25em] text-neon-cyan mb-4">
            EXPLORE
          </div>
          <ul className="space-y-2 text-sm">
            {[
              ["/about", "About"],
              ["/members", "Members"],
              ["/news", "News"],
              ["/partners", "Partners"],
              ["/join", "Join Us"],
              ["/legal/terms", "利用規約"],
              ["/legal/privacy", "プライバシーポリシー"],
            ].map(([h, l]) => (
              <li key={h}>
                <Link
                  href={h}
                  className="text-white/70 hover:text-neon-cyan transition"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-display tracking-[0.25em] text-neon-cyan mb-4">
            CONTACT
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            <li>📍 徳島県 徳島市</li>
            <li>✉️ contact@awakenglow.jp</li>
            <li>
              <Link
                href="/partners"
                className="text-awa-glow-deep hover:text-awa-glow transition"
              >
                スポンサー募集中 →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} AWAKEN GLOW. All Rights Reserved.
            </p>
            <p className="text-xs text-white/40">
              運営：AWAKEN GLOW（代表：平岩裕治）
            </p>
          </div>
          <p className="text-[10px] tracking-[0.3em] text-white/30 font-display">
            POWERED BY 阿波 / TOKUSHIMA
          </p>
        </div>
      </div>
    </footer>
  );
}
