# AWAKEN GLOW

徳島から新しいeスポーツ文化をつくるチームの公式サイト。

**コンセプト**：*Awa-Neon & Digital Passion*
徳島の伝統（阿波踊りの躍動感、藍色の深み）と、eスポーツの近未来感を融合したサイト。

---

## Tech Stack

- Next.js 14 (App Router)
- React 18 / TypeScript (strict)
- Tailwind CSS 3
- Framer Motion 11
- Lucide React

---

## Quick Start

```bash
cd C:\dev\awa-esports
npm install
npm run dev
# → http://localhost:3000
```

ビルド確認：
```bash
npm run build
npm run start
```

---

## Pages

| Path | 内容 |
| --- | --- |
| `/` | Home / Landing — Parallax hero、SYSTEM STATUS、3 PILLARS、CTA |
| `/about` | About — 徳島の文化3カード、Manifesto、ランクS/A/B/C |
| `/members` | Members — Staff 7名 ID Card、Roster 8名 |
| `/news` | News & Events — カテゴリフィルタ + ダミー4件 |
| `/join` | Join Us — Cockpit UI form、ダミー送信 |
| `/sponsor` | スポンサー・応援パートナー募集 — 眉山SVG + 提灯背景、6つの応援メニュー（年額・口数）、支援金の使い道、企業メリット、CTA |
| `/partners` | （旧URL）`/sponsor` へリダイレクト |
| `/partners-policy` | **スポンサー企業・応援企業に関する規約**（公開）— 審査理由・提携条件・禁止/慎重業種・競合/独占方針・大会規定優先・広告表示・流れ・解除・最終決定 + 問い合わせフォーム |
| `/admin` | 管理ダッシュボード（Basic認証）— 練習生・正式選手 |
| `/admin/sponsor-check` | **営業前スポンサー確認**（Basic認証）— 適合チェック / 企業一覧 / カテゴリー / 大会規定 / 問い合わせ / 審査履歴 |

---

## Design System

### Colors
- `awa-indigo-{500..950}` — 徳島藍ベース（深い夜空）
- `neon-cyan` `#00F0FF` — メインアクセント
- `awa-glow` `#2DFFB7` — 熱量の差し色
- `awa-glow` `#2DFFB7` — グラデ中継色
- `awa-glow-deep` `#2DFFB7` — Partners 用の提灯色

### Fonts
- **Display**: Orbitron（タイトル / バッジ）
- **Accent**: Anton
- **Body**: Noto Sans JP

### Components
- `Navbar` — スクロール反応 / layoutId active indicator / モバイル drawer
- `Footer` — SNS / sitemap / contact
- `ParticleBackground` — Canvas particles + マウス反発 + 接続線
- `NeonButton` — グラデ枠 + ホバー sweep（variant: primary / ghost / warm）
- `MemberCard` — コーナーブラケット + scan-line + glow
- `SectionTitle` — eyebrow + h2 + subtitle（neon / warm tone）
- `PageTransition` — フェード + スライドイン
- `AwaBackdrop` — 眉山シルエット + 提灯ドット + 法被ライン（Partners専用）

---

## Internal Docs

- [`LAUNCH_PLAYBOOK.md`](./LAUNCH_PLAYBOOK.md) — 世界基準のeスポーツチーム立ち上げ実践ハンドブック（ぼーるくん専用 / 公開しない）

---

## About カード背景の素材追加手順

About ページの4つの文化カード（阿波踊り / 祖谷のかずら橋 / 鳴門の渦潮 / マチ★アソビ）には、ホバー時に背景でクロスフェードする画像/動画スライドショーが組み込まれています。素材を後から入れるだけで自動で動きます。

### 1. 素材を配置
```
public/about/awa-odori/1.jpg
public/about/awa-odori/2.jpg
public/about/iya-kazurabashi/1.jpg
public/about/naruto-uzushio/1.jpg
public/about/machi-asobi/loop.mp4   ← 動画もOK
```

ファイル名は自由。フォルダ名（`<slug>`）が `app/about/page.tsx` の `cultureCards[].slug` と対応します。

### 2. `app/about/page.tsx` の `cultureCards` の `media` 配列に追記

```ts
{
  slug: "awa-odori",
  media: [
    { type: "image", src: "/about/awa-odori/1.jpg", alt: "阿波踊り 夜の演舞" },
    { type: "image", src: "/about/awa-odori/2.jpg", alt: "踊り子たちの躍動" },
    { type: "video", src: "/about/awa-odori/loop.mp4" },
  ],
},
```

### 3. 仕様
- `interval`（カード切替間隔）デフォルト 3500ms
- `maxOpacity`（ホバー時の最大不透明度）デフォルト 0.4
- 動画は自動 `muted` `loop` `playsInline` で再生（モバイル対応）
- 配列が空のままでも、フォールバックパターン（カードごとの色のグラデ + 斜線）で動作

### 推奨素材スペック
- 画像：1600×900px 程度のJPEG（圧縮品質80）、各カード3〜5枚
- 動画：MP4（H.264）、5〜15秒ループ、1〜3MB以内、ミュート前提

### フリー素材の入手先（権利クリアなもの）
- [Pexels Videos](https://www.pexels.com/videos/)（商用利用OK、クレジット不要）
- [Coverr](https://coverr.co/)（CC0）
- [Mixkit](https://mixkit.co/free-stock-video/)（無料ライセンス）
- 阿波踊り公式素材は[徳島市公式](https://www.city.tokushima.tokushima.jp/)から問い合わせ

---

## スポンサー管理機能（/partners-policy ＋ /admin/sponsor-check）

スポンサー・応援企業の**公開規約ページ**と、運営専用の**営業前スポンサー確認機能**（ルールベースの適合チェック・競合/独占管理・大会規定・審査履歴・A4印刷シート）。

### アーキテクチャ

- **公開ページ** `/partners-policy`：規約12セクション + 問い合わせフォーム（`/api/partners-inquiry`）。zod検証 + IP単位レートリミット + XSSエスケープ。問い合わせは非公開テーブルへ保存し、Resendで運営へ通知。
- **管理画面** `/admin/sponsor-check`：`middleware.ts` の Basic 認証（`/admin/*`・`/api/admin/*`）で保護。各 API 側でも `canRead` / `requireAdmin` で再確認（多層防御）。
- **判定エンジン** `lib/sponsor/screening.ts`：純粋関数。禁止(A)/慎重(B)/競合(C)/独占(D)/関連(E)/期間(F)/地域(G)/イベント(H)/ゲーム(I)/大会規定(J)/法人情報(K)/不足(L)/広告表示(M)/肖像・ロゴ(N) を確認し、緑/黄/橙/赤/灰の5段階で判定＋日本語理由を生成。**最終承認は必ず人間**（履歴タブで記録）。

### データベース（Supabase）

このプロジェクトの Supabase（`uatmzcnoumafeuzprkdo`）は他アプリと同居する共有DBのため、スポンサー系テーブルはすべて **`awa_sponsor_` プレフィックス**で追加（既存テーブルには一切触れない）。

- `awa_sponsor_categories` / `awa_sponsor_companies` / `awa_sponsor_rights` / `awa_tournament_sponsor_rules` / `awa_sponsor_screenings` / `awa_sponsor_inquiries` / `awa_sponsor_audit_logs`
- マイグレーション：[`supabase/migrations/20260725_awa_sponsor.sql`](./supabase/migrations/20260725_awa_sponsor.sql)、初期カテゴリー：[`supabase/seed/awa_sponsor_categories.sql`](./supabase/seed/awa_sponsor_categories.sql)（**適用済み**）。
- **RLS**：全テーブルで有効化＋anon/authenticated 用ポリシーなし＝publishable(anon)キーからは読み書き不可（完全遮断）。アクセスは**サーバーの service_role キーのみ**（RLSバイパス、フロントに出さない）。

### 必要な環境変数（Vercel Production）

| 変数 | 用途 | 未設定時の挙動 |
| --- | --- | --- |
| `ADMIN_USER` / `ADMIN_PASSWORD` | 管理者（作成・更新・承認・削除まで可）Basic認証 | 管理画面全体が 503 |
| `ADMIN_VIEWER_USER` / `ADMIN_VIEWER_PASSWORD` | （任意）閲覧者（閲覧のみ・編集不可） | 閲覧者ログインが無効になるだけ |
| `SUPABASE_SERVICE_ROLE_KEY` | スポンサーDBへのサーバー専用アクセス（`sb_secret_...`） | 適合チェック・企業管理・履歴保存が 503（画面に警告表示）。公開問い合わせはメール通知のみで継続 |
| `HOUJIN_BANGOU_APP_ID` | 国税庁 法人番号 Web-API アプリケーションID | 「法人番号API未設定」表示＋公表サイトへの手動確認導線 |
| `RESEND_API_KEY` / `SPONSOR_NOTIFY_TO`（無ければ `JOIN_NOTIFY_TO`） | 問い合わせ通知メール（既存と共用） | 通知メールなし（DB保存があれば記録は残る） |

Vercel CLI 例：
```bash
printf 'sb_secret_xxxxx' | vercel env add SUPABASE_SERVICE_ROLE_KEY production
printf 'あなたのアプリID' | vercel env add HOUJIN_BANGOU_APP_ID production
printf 'viewer' | vercel env add ADMIN_VIEWER_USER production
printf '閲覧用パスワード' | vercel env add ADMIN_VIEWER_PASSWORD production
```

> `SUPABASE_SERVICE_ROLE_KEY` は Supabase ダッシュボード → Project Settings → API Keys の **secret key** を使用。**絶対にフロントエンド／公開リポジトリに置かない**こと。

### 国税庁 法人番号 API の設定

1. [法人番号システム Web-API](https://www.houjin-bangou.nta.go.jp/webapi/) でアプリケーションID（無料）を申請・取得。
2. `HOUJIN_BANGOU_APP_ID` に設定（サーバー専用。クライアントには一切出ない）。
3. 管理画面「適合チェック」の法人番号欄で「番号で確認 / 名称で検索」→ 候補を「反映」で入力欄へ。
4. 未設定でもエラーにはならず、公表サイトでの手動確認導線を表示。**法人実在の確認はスポンサー適格性を保証しない**旨を明記。

### 権限（ロール）

- `admin`：全操作（作成・更新・承認・論理削除・CSV）
- `viewer`：閲覧のみ（書き込み系 API は 401、UIも編集ボタン非表示）
- 削除は原則**論理削除**（`is_deleted`）。全変更は `awa_sponsor_audit_logs` に記録。

---

## TODO（次のフェーズ）

- [ ] フォーム送信先のバックエンド統合（Resend / Formspree）
- [ ] OG画像生成
- [ ] sitemap.xml / robots.txt
- [ ] News のCMS化（micro-CMS / Contentlayer）
- [ ] ロゴ正式版（ゼノブランディング岩佐氏）への差し替え
- [ ] アンセム楽曲（YouTube Intro）統合
- [ ] Members 写真の追加（撮影タイミングで）
- [ ] Discord 招待リンクの設置
- [ ] アクセシビリティ監査（contrast / keyboard nav）
