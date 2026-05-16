import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

export const metadata = {
  title: "運営者情報 — AWAKEN GLOW",
  description:
    "AWAKEN GLOW の運営団体・代表者・所在地・連絡先など、責任の所在を明示します。",
};

type Row = { label: string; value: React.ReactNode };

const rows: Row[] = [
  { label: "団体名", value: "AWAKEN GLOW（旧 AWA ESPORTS）" },
  { label: "団体形態", value: "任意団体（地域eスポーツコミュニティ）" },
  { label: "代表者", value: "平岩 裕治（はんどる：ぼーるくん）" },
  { label: "設立", value: "2026年" },
  {
    label: "活動拠点",
    value: "徳島県板野郡藍住町（活動会場は徳島市内ほか県内各所）",
  },
  {
    label: "連絡先",
    value: (
      <a
        href="mailto:contact@awakenglow.jp"
        className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition"
      >
        contact@awakenglow.jp
      </a>
    ),
  },
  {
    label: "活動内容",
    value: (
      <>
        徳島県におけるeスポーツの普及・人材育成・地域連携活動。
        <br />
        合同練習会・大会運営・配信・地域連携イベントなど。
      </>
    ),
  },
  {
    label: "部門",
    value: (
      <>
        STREET FIGHTER 6 部門 / ぷよぷよeスポーツ 部門
        <br />
        ※ そのほかのタイトルも、参加者の希望に応じて随時拡張します。
      </>
    ),
  },
  {
    label: "個人情報保護管理責任者",
    value: "代表（平岩 裕治）",
  },
];

export default function OperatorPage() {
  return (
    <PageTransition>
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="LEGAL / 運営者情報"
            title="OPERATOR INFORMATION"
            subtitle={
              <>
                AWAKEN GLOW の運営団体および責任の所在を明示します。
                <br />
                被害・加害いずれの事案でも、運営は実名で対応にあたります。
              </>
            }
          />
        </div>
      </section>

      <section className="relative pb-32">
        <div className="mx-auto max-w-3xl px-5 md:px-8 space-y-8">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-8 md:p-12">
            <dl className="divide-y divide-white/10">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 py-4"
                >
                  <dt className="font-display tracking-[0.15em] text-neon-cyan text-xs">
                    {r.label}
                  </dt>
                  <dd className="text-sm text-white/80 leading-relaxed">
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/30 backdrop-blur-md p-6 md:p-8 text-sm text-white/70 leading-relaxed space-y-3">
            <h2 className="font-display tracking-[0.15em] text-neon-cyan text-sm">
              運営の姿勢について
            </h2>
            <p>
              AWAKEN GLOW
              は法人ではなく、地域の有志による任意団体ですが、運営の代表は
              <span className="text-white">実名</span>
              で責任を負います。万一、参加者間や活動の場でトラブル（被害・加害いずれも）が発生した場合、運営の代表が窓口として対応にあたります。
            </p>
            <p>
              ご参加・お問い合わせの際は、
              <Link
                href="/legal/privacy"
                className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
              >
                プライバシーポリシー
              </Link>
              ／
              <Link
                href="/legal/terms"
                className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
              >
                利用規約
              </Link>
              もあわせてご確認ください。
            </p>
          </div>

          <div className="text-xs text-white/40 text-right space-y-0.5">
            <div>制定日：2026年5月16日</div>
            <div>運営：AWAKEN GLOW（代表：平岩 裕治）</div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
