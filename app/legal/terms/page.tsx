import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

export const metadata = {
  title: "利用規約 — AWA ESPORTS",
  description: "AWA ESPORTS の参加・施設利用に関する規約。",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "第1条（目的）",
    body: (
      <>
        本規約は、徳島県を拠点とするe-sportsチーム「AWA ESPORTS」（以下「当チーム」）が
        運営する活動・施設利用・各種イベントへの参加に関する条件を定めるものです。
        当チームは、参加者が会費を出し合って集まる
        「草野球感覚」の地域e-sportsコミュニティです。
      </>
    ),
  },
  {
    title: "第2条（参加資格）",
    body: (
      <>
        当チームの参加は、以下の方を中心に受け付けます。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>現在、徳島県内に在住の方</li>
          <li>過去に徳島県に在住していた方</li>
          <li>隣県在住で当チームの活動に興味のある方</li>
          <li>その他、徳島・当チームに縁を持ち、活動に共感いただける方</li>
        </ul>
        <span className="block mt-3">
          活動拠点は徳島・藍住エリアです。県外の方は、まず見学・お試し参加から
          ご案内します。年齢・性別・経験は問いません。
        </span>
      </>
    ),
  },
  {
    title: "第3条（参加費）",
    body: (
      <>
        通常活動への参加には、会場利用料を参加メンバーで分担する形での
        参加費が発生します。具体的な金額・支払い方法は、入会時に
        別途ご案内します。
      </>
    ),
  },
  {
    title: "第4条（禁止事項）",
    body: (
      <>
        当チームの活動・施設利用にあたり、以下の行為を禁止します。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>法令または公序良俗に反する行為</li>
          <li>他のメンバー、運営、第三者への誹謗中傷・差別・ハラスメント</li>
          <li>活動・施設・備品を著しく損傷する行為</li>
          <li>無断での営業活動・勧誘・宗教活動・政治活動</li>
          <li>運営の許可なく、活動内容を商用目的で利用すること</li>
          <li>その他、運営が不適切と判断する行為</li>
        </ul>
      </>
    ),
  },
  {
    title: "第5条（ゲーム・ライセンスの取り扱い）",
    body: (
      <>
        参加者は、各ゲームソフトウェア・プラットフォームの利用規約（EULA）を
        遵守するものとし、原則として参加者ご自身のアカウントを使用するものとします。
        当チームの施設・備品利用に関する詳細は、入会時および活動時にご案内します。
      </>
    ),
  },
  {
    title: "第6条（個人情報の取り扱い）",
    body: (
      <>
        参加申込時にお預かりする個人情報の取り扱いについては、
        別途
        <Link
          href="/legal/privacy"
          className="text-neon-cyan hover:text-awa-magenta underline-offset-4 hover:underline transition mx-1"
        >
          プライバシーポリシー
        </Link>
        をご確認ください。
      </>
    ),
  },
  {
    title: "第7条（退会・参加停止）",
    body: (
      <>
        参加者はいつでも退会できます。退会希望の場合は運営までご連絡ください。
        運営は、第4条の禁止事項に該当する場合、その他活動の継続が困難と判断した場合、
        参加者に対し参加停止または除名の措置を取ることができます。
      </>
    ),
  },
  {
    title: "第8条（免責事項）",
    body: (
      <>
        活動中に発生した参加者間のトラブル、健康被害、所持品の紛失・破損等について、
        当チームは故意または重大な過失のある場合を除き、一切の責任を負いません。
        参加者は、自身の体調・体力に応じて参加するものとします。
      </>
    ),
  },
  {
    title: "第9条（規約の改定）",
    body: (
      <>
        当チームは、必要に応じて本規約を改定することがあります。
        改定後の規約は、本ページに掲載した時点で効力を生じるものとします。
      </>
    ),
  },
  {
    title: "第10条（お問い合わせ）",
    body: (
      <>
        本規約に関するお問い合わせは、
        <a
          href="mailto:contact@awa-esports.jp"
          className="text-neon-cyan hover:text-awa-magenta underline-offset-4 hover:underline transition mx-1"
        >
          contact@awa-esports.jp
        </a>
        までご連絡ください。
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <PageTransition>
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="LEGAL / 利用規約"
            title="TERMS OF SERVICE"
            subtitle={
              <>
                AWA ESPORTS の活動・施設利用にあたっての規約です。
                <br />
                参加前にご確認ください。
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
              運営：AWA ESPORTS（代表：平岩裕治）
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
