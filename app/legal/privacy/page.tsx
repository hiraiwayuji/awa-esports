import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー — AWAKEN GLOW",
  description: "AWAKEN GLOW における個人情報の取扱いについて。",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 取得する情報",
    body: (
      <>
        当チームは、参加申込フォーム・お問い合わせフォーム等を通じて、
        以下の情報を取得することがあります。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>お名前</li>
          <li>年齢</li>
          <li>徳島県との関係（在住・出身・興味の有無等）</li>
          <li>好きなゲームタイトル</li>
          <li>その他、お問い合わせの過程でご提供いただく情報</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. 利用目的",
    body: (
      <>
        取得した情報は、以下の目的のためにのみ利用します。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>参加申込・お問い合わせへの対応</li>
          <li>活動・イベントのご案内</li>
          <li>本人確認、参加者名簿の管理</li>
          <li>当チームの運営改善・統計分析（個人を特定しない形）</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. 第三者提供",
    body: (
      <>
        当チームは、ご本人の同意なく取得した個人情報を第三者へ提供しません。
        ただし、法令に基づく場合、人の生命・身体・財産の保護のために
        必要がある場合はこの限りではありません。
      </>
    ),
  },
  {
    title: "4. 保管期間",
    body: (
      <>
        取得した情報は、利用目的を達成するために必要な期間、適切な方法で保管します。
        退会・利用目的の終了等により不要となった情報は、速やかに削除または匿名化します。
      </>
    ),
  },
  {
    title: "5. 安全管理",
    body: (
      <>
        個人情報の漏洩・紛失・改ざん等を防ぐため、合理的かつ適切な
        安全管理措置を講じます。アクセス権限を必要最小限の範囲に制限し、
        記録を保持します。
      </>
    ),
  },
  {
    title: "6. ご本人の権利",
    body: (
      <>
        ご本人は、当チームが保有する個人情報の開示・訂正・削除・利用停止を
        求めることができます。お問い合わせ先までご連絡ください。
      </>
    ),
  },
  {
    title: "7. Cookie 等の利用",
    body: (
      <>
        当ウェブサイトでは、利用状況の把握・改善のため、Cookie やアクセスログを
        利用することがあります。これらは個人を特定する情報を含みません。
      </>
    ),
  },
  {
    title: "8. 改定",
    body: (
      <>
        当チームは、必要に応じて本ポリシーを改定することがあります。
        改定後のポリシーは、本ページに掲載した時点で効力を生じるものとします。
      </>
    ),
  },
  {
    title: "9. お問い合わせ",
    body: (
      <>
        個人情報の取扱いに関するお問い合わせは、
        <a
          href="mailto:contact@awakenglow.jp"
          className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
        >
          contact@awakenglow.jp
        </a>
        までご連絡ください。
        利用規約は
        <Link
          href="/legal/terms"
          className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
        >
          こちら
        </Link>
        からご確認いただけます。
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PageTransition>
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="LEGAL / プライバシーポリシー"
            title="PRIVACY POLICY"
            subtitle={
              <>
                AWAKEN GLOW における個人情報の取扱いについて定めています。
                <br />
                安心してご参加いただくための方針です。
              </>
            }
          />
        </div>
      </section>

      <section className="relative pb-32">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="rounded-2xl border border-white/10 bg-awa-indigo-900/40 backdrop-blur-md p-8 md:p-12 space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-display tracking-[0.15em] text-neon-cyan text-sm md:text-base mb-3">
                  {s.title}
                </h2>
                <div className="text-sm text-white/75 leading-relaxed">
                  {s.body}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-white/10 text-xs text-white/40 text-right">
              制定日：2026年5月4日
              <br />
              運営：AWAKEN GLOW（代表：平岩裕治）
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
