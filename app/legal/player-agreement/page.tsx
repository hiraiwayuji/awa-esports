import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

export const metadata = {
  title: "選手登録規約 — AWAKEN GLOW",
  description:
    "AWAKEN GLOW の正式所属選手として登録される方に向けた、活動方針・他チーム所属・コンプライアンス等の取り決め。",
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "第1条（本規約の目的・選手登録の意味）",
    body: (
      <>
        本規約は、徳島県を拠点とするeスポーツチーム「AWAKEN
        GLOW」（以下「当チーム」）の
        <span className="text-white">正式所属選手</span>
        として登録される方の権利・心構え・取り決めを定めるものです。
        <br />
        選手登録は、見学・お試し参加とは別カテゴリで、
        <span className="text-white">
          徳島の地域eスポーツ振興を担う立場
        </span>
        になることを意味します。
        <br />
        当チームは法人ではなく地域の有志による任意団体ですが、所属表明である以上、最低限の約束ごとを共有させていただきます。
      </>
    ),
  },
  {
    title: "第2条（登録資格）",
    body: (
      <>
        選手登録は、以下のすべてに該当する方を対象とします。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>
            当チームの理念「Awaken your Glow. Grow together from
            Tokushima.」に共感する方
          </li>
          <li>徳島を盛り上げるeスポーツ活動への意欲がある方</li>
          <li>
            チーム主催の練習会・大会・地域イベントへの積極的参加の意思がある方
          </li>
          <li>各ゲームタイトルの EULA・利用規約を遵守する方</li>
          <li>
            18歳未満の方は、保護者の同意を得たうえでお申し込みいただきます
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第3条（他チーム所属について）",
    body: (
      <>
        同タイトルで他のeスポーツチーム（プロ・アマ問わず）に所属している場合、または所属しようとする場合は、
        <span className="text-white">事前に運営へお申告ください</span>
        。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>
            大会出場時のチーム名表記・ユニフォーム着用・賞金分配は、申告内容に基づき個別に協議します
          </li>
          <li>
            ジャンル違いタイトルでの他チーム所属（例：SF6 で AWAKEN
            GLOW、ぷよぷよで別チーム所属）は申告不要です
          </li>
          <li>
            未申告のまま他チームの正式選手として活動していたことが判明した場合、第13条に基づき対応します
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第4条（チーム活動への参加）",
    body: (
      <>
        当チームが主催する練習会・大会・配信・地域イベントへの参加は
        <span className="text-white">原則参加</span>
        とします。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>やむを得ず欠席する場合は、事前に運営へご連絡ください</li>
          <li>運営からの連絡（LINE等）には、可能な範囲でご応答ください</li>
          <li>
            参加の継続が困難になった場合は、無理をせずに第12条に基づき脱退・休止のご相談を
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第5条（コンプライアンス）",
    body: (
      <>
        各ゲームタイトル運営の利用規約および EULA
        を遵守してください。以下の行為は禁止します。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>チート、外部ツールによる不正、規約違反プレイ</li>
          <li>不正アカウントの利用（売買・譲渡を含む）</li>
          <li>他人名義または複数アカウントでの大会出場</li>
        </ul>
      </>
    ),
  },
  {
    title: "第6条（禁止行為）",
    body: (
      <>
        当チームの選手として、以下の行為は厳に禁止します。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>
            他選手・他チーム・コミュニティ・関係者への誹謗中傷
          </li>
          <li>SNS等で当チームの評判を著しく損なう発言・行為</li>
          <li>
            ハラスメント（性的・パワー・SNS上での攻撃を含むあらゆる形態）
          </li>
          <li>違法行為および反社会的勢力との関わり</li>
          <li>
            未成年の飲酒・喫煙・賭博等、法令違反となる行為
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第7条（情報発信・ブランド使用）",
    body: (
      <>
        SNS等での活動報告は大歓迎です。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>
            当チームのロゴ・ユニフォーム・「AWAKEN
            GLOW所属」表記の使用は、事前に運営へご相談ください
          </li>
          <li>
            個人配信は自由ですが、当チーム所属を表明している以上、配信内容についてはチーム評判への配慮をお願いします
          </li>
          <li>
            活動の写真・動画素材を当チームのSNS等で使用する場合、事前にご本人の同意を確認します
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第8条（スポンサー・経済活動）",
    body: (
      <>
        <ul className="ml-5 list-disc space-y-1 text-white/60">
          <li>
            個人スポンサーの獲得は自由です（当チームの既存スポンサーと利益相反しない範囲）
          </li>
          <li>
            チーム名義でのスポンサーシップ・取引が発生する場合は、事前に運営へご相談ください
          </li>
          <li>
            大会賞金は、個人エントリーは個人帰属。チーム名義での出場時は事前協議のうえ分配方法を決定します
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第9条（個人情報・連絡先）",
    body: (
      <>
        当チームの
        <Link
          href="/legal/privacy"
          className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
        >
          プライバシーポリシー
        </Link>
        に同意のうえご登録いただきます。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>
            18歳未満の方は、保護者の氏名およびご連絡先のご提供が必須です
          </li>
          <li>
            トラブル発生時のご連絡のため、緊急連絡先のご提供にご協力ください
          </li>
          <li>
            ご提供いただいた情報は、当チームの運営および安全な活動運営の目的のみに使用します
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第10条（健康・安全）",
    body: (
      <>
        <ul className="ml-5 list-disc space-y-1 text-white/60">
          <li>長時間プレイによる健康への配慮をお願いします</li>
          <li>
            18歳未満の方の活動時間については、保護者の判断を優先します
          </li>
          <li>
            当チームのトレーナー（さみ整体）によるコンディションサポートをご利用いただけます
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第11条（参加費・経費）",
    body: (
      <>
        練習会・イベント等に伴う経費が発生する場合があります。
        <ul className="mt-3 ml-5 list-disc space-y-1 text-white/60">
          <li>
            具体的な額・徴収方法は、登録時および各活動の案内時に運営からお伝えします
          </li>
          <li>
            大会エントリー費は原則自己負担とします。チーム派遣・チーム代表としての出場時は別途協議します
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第12条（登録期間・脱退）",
    body: (
      <>
        <ul className="ml-5 list-disc space-y-1 text-white/60">
          <li>
            登録は期間を定めず継続します。年度ごとに運営から意思確認のご連絡をします
          </li>
          <li>
            脱退をご希望の場合は、運営に事前にご連絡ください。書面・LINE等いずれでも構いません
          </li>
          <li>
            脱退後も、関係者として今後の活動にご協力いただける関係を大切にします
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "第13条（違反時の対応）",
    body: (
      <>
        本規約に違反する行為があった場合、当チームは原則として以下の段階で対応します。
        <ol className="mt-3 ml-5 list-decimal space-y-1 text-white/60">
          <li>運営代表との対話・改善のお願い</li>
          <li>
            改善が見られない場合は、登録の一時停止
          </li>
          <li>
            重大な違反・改善不能と判断された場合は、登録抹消
          </li>
        </ol>
        <p className="mt-3 text-xs text-white/50">
          ※ 抹消の判断は運営代表が行います。
          重大な事案（違法行為、悪質な誹謗中傷、重大なハラスメント等）の場合は、上記段階を経ずに即時抹消することがあります。
        </p>
      </>
    ),
  },
  {
    title: "第14条（規約の変更）",
    body: (
      <>
        当チームは必要に応じて本規約を変更することがあります。
        変更時は所属メンバーへ通知し、本ページにも改定日を記載します。
      </>
    ),
  },
  {
    title: "第15条（その他）",
    body: (
      <>
        本規約に定めのない事項は、当チームの
        <Link
          href="/legal/terms"
          className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
        >
          利用規約
        </Link>
        および
        <Link
          href="/legal/privacy"
          className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
        >
          プライバシーポリシー
        </Link>
        に従います。
        運営者情報は
        <Link
          href="/legal/operator"
          className="text-neon-cyan hover:text-awa-glow underline-offset-4 hover:underline transition mx-1"
        >
          こちら
        </Link>
        からご確認いただけます。
        本規約の解釈に疑義がある場合は、運営代表が決定します。
      </>
    ),
  },
];

export default function PlayerAgreementPage() {
  return (
    <PageTransition>
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="LEGAL / 選手登録規約"
            title="PLAYER AGREEMENT"
            subtitle={
              <>
                AWAKEN GLOW の正式所属選手として登録される方に向けた、
                <br />
                活動方針と最低限の約束ごとを定めています。
              </>
            }
          />
        </div>
      </section>

      <section className="relative pb-32">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="rounded-2xl border border-awa-glow/30 bg-awa-indigo-900/40 backdrop-blur-md p-8 md:p-12 space-y-10">
            <div className="rounded-xl border border-awa-glow/30 bg-awa-glow/5 px-5 py-4 text-xs text-awa-glow/90 leading-relaxed">
              本規約は、見学・お試し参加には適用されません。
              <br />
              「正式所属選手として登録する方」のみが対象となります。
            </div>

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

            <div className="pt-6 border-t border-white/10 text-xs text-white/40 text-right space-y-0.5">
              <div>制定日：2026年5月17日</div>
              <div>運営：AWAKEN GLOW（代表：平岩 裕治）</div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
