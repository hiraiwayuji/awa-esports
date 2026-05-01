# AWA ESPORTS

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
- `awa-magenta` `#FF2D95` — 熱量の差し色
- `awa-violet` `#9B5CFF` — グラデ中継色
- `awa-warmth` `#F0B95C` — Partners 用の提灯色

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
