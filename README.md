# AWAKEN GLOW

徳島から世界を目指す e-sports チーム公式サイト。

**コンセプト**：*Awa-Neon & Digital Passion*
徳島の伝統（阿波踊りの躍動感、藍色の深み）と、e-sports の近未来感を融合した「世界基準のローカルチーム」サイト。

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
| `/partners` | Partners — 眉山SVG + 提灯背景、3プラン、Contact Form |

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

- [`LAUNCH_PLAYBOOK.md`](./LAUNCH_PLAYBOOK.md) — 世界基準のe-sportsチーム立ち上げ実践ハンドブック（ぼーるくん専用 / 公開しない）

---

## About カード背景の素材追加手順

About ページの3つの文化カード（阿波踊り / ufotable / マチ★アソビ）には、ホバー時に背景でクロスフェードする画像/動画スライドショーが組み込まれています。素材を後から入れるだけで自動で動きます。

### 1. 素材を配置
```
public/about/awa-odori/1.jpg
public/about/awa-odori/2.jpg
public/about/ufotable/1.jpg
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
