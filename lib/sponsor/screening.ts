// AWAKEN GLOW スポンサー適合チェック — ルールベース判定エンジン（純粋関数）。
//
// 重要：ここは「機械的な下準備」であって最終判定ではない。
// 最終承認は必ず人間（運営）が行う。AI/ルールの結果だけで契約可否を確定しない。
//
// サーバー/クライアントどちらからも呼べるよう、外部I/Oや環境変数に依存しない。

import type {
  ScreeningCandidate,
  SponsorCategory,
  SponsorCompany,
  TournamentRule,
  ScreeningResult,
  CheckItem,
  CompetitorMatch,
  Verdict,
} from "./types";

export type ScreeningContext = {
  categories: SponsorCategory[];
  companies: SponsorCompany[];
  rules: TournamentRule[];
};

// ---------------------------------------------------------------------------
// テキストユーティリティ
// ---------------------------------------------------------------------------

function norm(s: string): string {
  return (s || "").toLowerCase().replace(/\s+/g, "").trim();
}

/** text の中に keyword いずれかが含まれるか */
function hasAnyKeyword(text: string, keywords: string[]): string | null {
  const t = norm(text);
  if (!t) return null;
  for (const kw of keywords) {
    const k = norm(kw);
    if (k && t.includes(k)) return kw;
  }
  return null;
}

/** 候補の全テキストを 1 本にまとめる（キーワード突合用） */
function candidateHaystack(c: ScreeningCandidate): string {
  return [
    c.categoryName,
    c.productCategory,
    c.businessDescription,
    c.companyName,
    c.brandName,
    c.desiredRights,
  ].join(" / ");
}

/** カテゴリー名 or キーワードから一致するマスタ行を推定 */
function resolveCategories(
  c: ScreeningCandidate,
  categories: SponsorCategory[],
): { matched: SponsorCategory[]; byName: SponsorCategory | null } {
  const active = categories.filter((x) => !x.is_deleted);
  const byName =
    active.find((x) => norm(x.category_name) === norm(c.categoryName)) ?? null;
  const hay = candidateHaystack(c);
  const matched = new Set<SponsorCategory>();
  if (byName) matched.add(byName);
  for (const cat of active) {
    if (cat.category_name && norm(hay).includes(norm(cat.category_name))) {
      matched.add(cat);
      continue;
    }
    if (hasAnyKeyword(hay, cat.keywords)) matched.add(cat);
  }
  return { matched: [...matched], byName };
}

// ---------------------------------------------------------------------------
// 日付・重複ユーティリティ
// ---------------------------------------------------------------------------

function parseDate(s: string | null | undefined): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

/** 期間 [a1,a2] と [b1,b2] が重なるか（未指定は「開いた区間」として広く扱う） */
function periodsOverlap(
  a1: string | null | undefined,
  a2: string | null | undefined,
  b1: string | null | undefined,
  b2: string | null | undefined,
): boolean {
  const as = parseDate(a1) ?? -Infinity;
  const ae = parseDate(a2) ?? Infinity;
  const bs = parseDate(b1) ?? -Infinity;
  const be = parseDate(b2) ?? Infinity;
  return as <= be && bs <= ae;
}

/** カンマ/読点/スラッシュ区切りの自由入力を配列へ */
export function splitList(s: string): string[] {
  return (s || "")
    .split(/[,、\/／\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** 2 つの語リストの重なり（正規化・部分一致） */
function listOverlap(a: string[], b: string[]): string[] {
  const out: string[] = [];
  for (const x of a) {
    for (const y of b) {
      const nx = norm(x);
      const ny = norm(y);
      if (nx && ny && (nx === ny || nx.includes(ny) || ny.includes(nx))) {
        out.push(x);
        break;
      }
    }
  }
  return [...new Set(out)];
}

// ---------------------------------------------------------------------------
// 競合チェック（企業名の完全一致に依存しない）
// ---------------------------------------------------------------------------

function detectCompetitors(
  c: ScreeningCandidate,
  ctx: ScreeningContext,
): CompetitorMatch[] {
  const { matched, byName } = resolveCategories(c, ctx.categories);
  const candGroups = new Set(
    matched.map((m) => m.competitor_group).filter(Boolean),
  );
  const candCatNames = new Set(matched.map((m) => norm(m.category_name)));
  if (byName) candCatNames.add(norm(byName.category_name));

  const candRegion = splitList(c.regionScope);
  const candEvent = splitList(c.eventScope);
  const candGame = splitList(c.gameScope);
  const candProduct = norm(c.productCategory);

  const results: CompetitorMatch[] = [];

  // 「関連会社」比較用の候補側の名寄せ材料
  const candNames = [c.companyName, c.brandName].map(norm).filter(Boolean);

  for (const co of ctx.companies) {
    if (co.is_deleted) continue;
    if (co.status === "rejected") continue; // 契約不可となった過去候補は競合対象外

    let matchType: CompetitorMatch["matchType"] | null = null;
    const reasons: string[] = [];

    // 1) 中分類（カテゴリー）一致
    if (co.category_name && candCatNames.has(norm(co.category_name))) {
      matchType = "category";
      reasons.push(`同一カテゴリー「${co.category_name}」`);
    }

    // 2) 競合グループ（大分類/実質市場）一致（カテゴリー違いでも市場が重なる）
    if (!matchType) {
      const coCat = ctx.categories.find(
        (x) => norm(x.category_name) === norm(co.category_name),
      );
      if (coCat && coCat.competitor_group && candGroups.has(coCat.competitor_group)) {
        matchType = "group";
        reasons.push(
          `実質的に市場が重なる（競合グループ「${coCat.competitor_group}」）`,
        );
      }
    }

    // 3) 商品カテゴリーの部分一致
    if (!matchType && candProduct && norm(co.business_description).includes(candProduct)) {
      matchType = "product";
      reasons.push(`商品/事業内容が重なる可能性`);
    }

    // 4) ブランド・親会社・子会社・関連会社の名寄せ
    if (!matchType) {
      const coNames = [co.legal_name, co.brand_name, co.company_group]
        .map(norm)
        .filter(Boolean);
      const nameHit = candNames.some((cn) =>
        coNames.some((xn) => xn && (xn.includes(cn) || cn.includes(xn))),
      );
      const groupHit =
        norm(c.brandName) &&
        norm(co.company_group).includes(norm(c.brandName));
      if (nameHit || groupHit) {
        matchType = "brand_group";
        reasons.push("ブランド／親会社／関連会社の可能性");
      }
    }

    if (!matchType) continue;

    // 重複ディメンションの算出
    const overlap: string[] = [];
    if (periodsOverlap(c.contractStart, c.contractEnd, co.contract_start, co.contract_end)) {
      overlap.push("契約期間が重複");
    }
    const rOv = listOverlap(candRegion, co.region_scope);
    if (rOv.length) overlap.push(`対象地域が重複（${rOv.join("・")}）`);
    const eOv = listOverlap(candEvent, co.event_scope);
    if (eOv.length) overlap.push(`対象イベントが重複（${eOv.join("・")}）`);
    const gOv = listOverlap(candGame, co.game_scope);
    if (gOv.length) overlap.push(`対象ゲームが重複（${gOv.join("・")}）`);

    // severity：独占ありで期間重複＝conflict、同一カテゴリー＝likely、グループ＝possible
    let severity: CompetitorMatch["severity"] = "possible";
    if (matchType === "category") severity = "likely";
    const periodHit = overlap.some((o) => o.includes("契約期間"));
    if (co.exclusivity && periodHit && (matchType === "category" || matchType === "group")) {
      severity = "conflict";
      reasons.push("既存社が独占権を保有し期間が重複");
    } else if (c.exclusivity && (matchType === "category" || matchType === "group")) {
      severity = severity === "likely" ? "conflict" : "likely";
      reasons.push("候補が独占権を希望");
    }

    results.push({
      companyId: co.id,
      companyName: co.brand_name || co.legal_name,
      categoryName: co.category_name,
      matchType,
      reason: reasons.join(" / "),
      overlap,
      exclusivity: co.exclusivity,
      severity,
    });
  }

  // severity 降順で並べる
  const rank = { conflict: 0, likely: 1, possible: 2 } as const;
  results.sort((a, b) => rank[a.severity] - rank[b.severity]);
  return results;
}

// ---------------------------------------------------------------------------
// メイン：審査を実行
// ---------------------------------------------------------------------------

export function runScreening(
  c: ScreeningCandidate,
  ctx: ScreeningContext,
): ScreeningResult {
  const checks: CheckItem[] = [];
  const missingDocs: string[] = [];
  const preContractChecks: string[] = [];
  const recommendedActions: string[] = [];
  const tournamentNotes: string[] = [];

  const { matched } = resolveCategories(c, ctx.categories);
  const hay = candidateHaystack(c);

  // ---- L. 必要情報の不足チェック（先に算出：情報不足なら灰） ----
  const requiredMissing: string[] = [];
  if (!c.companyName.trim()) requiredMissing.push("企業名");
  if (!c.categoryName.trim() && !c.businessDescription.trim())
    requiredMissing.push("業種カテゴリーまたは事業内容");
  if (!c.businessDescription.trim()) requiredMissing.push("事業内容");
  if (!c.partnerType) requiredMissing.push("スポンサー/応援企業の区分");

  const canJudge = !!c.companyName.trim() && (!!c.categoryName.trim() || !!c.businessDescription.trim());

  // ---- A. 禁止業種チェック ----
  const prohibitedCats = ctx.categories.filter((x) => !x.is_deleted && x.is_prohibited);
  const prohibitedHits = prohibitedCats.filter(
    (cat) =>
      norm(c.categoryName) === norm(cat.category_name) ||
      norm(hay).includes(norm(cat.category_name)) ||
      hasAnyKeyword(hay, cat.keywords),
  );
  if (prohibitedHits.length) {
    checks.push({
      code: "A",
      label: "禁止業種チェック",
      status: "block",
      message: `お受けできない業種に該当する可能性があります：${prohibitedHits
        .map((x) => x.category_name)
        .join("・")}。契約はお受けできません。`,
    });
    preContractChecks.push("禁止業種に該当しないか、事業実態を必ず確認する");
  } else {
    checks.push({
      code: "A",
      label: "禁止業種チェック",
      status: "ok",
      message: "禁止業種への該当は検出されませんでした。",
    });
  }

  // ---- B. 慎重審査業種チェック ----
  const reviewCats = ctx.categories.filter(
    (x) => !x.is_deleted && x.requires_review && !x.is_prohibited,
  );
  const reviewHits = reviewCats.filter(
    (cat) =>
      norm(c.categoryName) === norm(cat.category_name) ||
      norm(hay).includes(norm(cat.category_name)) ||
      hasAnyKeyword(hay, cat.keywords),
  );
  if (reviewHits.length) {
    checks.push({
      code: "B",
      label: "慎重審査業種チェック",
      status: "warn",
      message: `個別に慎重な審査が必要な業種に該当します：${reviewHits
        .map((x) => x.category_name)
        .join("・")}。${reviewHits.some((x) => x.notes) ? reviewHits.map((x) => x.notes).filter(Boolean).join(" / ") : "広告表現・掲載範囲を運営で確認してください。"}`,
    });
    preContractChecks.push("慎重審査業種の広告表現・掲載範囲・法令適合を確認する");
  } else {
    checks.push({
      code: "B",
      label: "慎重審査業種チェック",
      status: "ok",
      message: "慎重審査業種への該当は検出されませんでした。",
    });
  }

  // ---- C. 既存スポンサーとの競合チェック ----
  const competitors = detectCompetitors(c, ctx);
  const competitorCategories = [
    ...new Set(competitors.map((x) => x.categoryName).filter(Boolean)),
  ];
  const hardConflict = competitors.filter((x) => x.severity === "conflict");
  const likely = competitors.filter((x) => x.severity === "likely");
  if (hardConflict.length) {
    checks.push({
      code: "C",
      label: "既存スポンサーとの競合チェック",
      status: "block",
      message: `既存の提携先と競合が発生します：${hardConflict
        .map((x) => `${x.companyName}（${x.reason}）`)
        .join(" / ")}`,
    });
  } else if (likely.length) {
    checks.push({
      code: "C",
      label: "既存スポンサーとの競合チェック",
      status: "warn",
      message: `同一カテゴリーの既存提携先があります：${likely
        .map((x) => x.companyName)
        .join("・")}。競合可能性を運営で確認してください。`,
    });
  } else if (competitors.length) {
    checks.push({
      code: "C",
      label: "既存スポンサーとの競合チェック",
      status: "warn",
      message: `実質的に市場が重なる可能性のある提携先があります：${competitors
        .map((x) => x.companyName)
        .join("・")}。`,
    });
  } else {
    checks.push({
      code: "C",
      label: "既存スポンサーとの競合チェック",
      status: "ok",
      message: "既存提携先との競合は検出されませんでした。",
    });
  }

  // ---- D. 業種独占権チェック ----
  const exclusivityConflicts: string[] = [];
  const existingExclusive = competitors.filter((x) => x.exclusivity);
  if (existingExclusive.length) {
    existingExclusive.forEach((x) =>
      exclusivityConflicts.push(
        `${x.companyName} が独占権を保有（${x.categoryName || "同カテゴリー"}）`,
      ),
    );
  }
  if (c.exclusivity) {
    preContractChecks.push(
      "候補が希望する独占権の範囲・期間・対価を契約書で明確化する",
    );
  }
  if (existingExclusive.length) {
    checks.push({
      code: "D",
      label: "業種独占権チェック",
      status: hardConflict.length ? "block" : "warn",
      message: `独占権に関する確認が必要です：${exclusivityConflicts.join(" / ")}。`,
    });
  } else if (c.exclusivity) {
    checks.push({
      code: "D",
      label: "業種独占権チェック",
      status: "warn",
      message:
        "候補が独占権を希望しています。付与範囲（カテゴリー・地域・期間）を運営で定義してください。",
    });
  } else {
    checks.push({
      code: "D",
      label: "業種独占権チェック",
      status: "ok",
      message: "独占権に関する競合は検出されませんでした。",
    });
  }

  // ---- E. ブランド・親会社・子会社の関連チェック ----
  const groupMatches = competitors.filter((x) => x.matchType === "brand_group");
  if (groupMatches.length) {
    checks.push({
      code: "E",
      label: "ブランド・親会社・子会社の関連チェック",
      status: "info",
      message: `既存提携先とグループ／ブランド上の関連がある可能性：${groupMatches
        .map((x) => x.companyName)
        .join("・")}。同一グループなら競合ではない場合もあるため確認してください。`,
    });
    preContractChecks.push("親会社・子会社・関連会社の資本関係を確認する");
  } else {
    checks.push({
      code: "E",
      label: "ブランド・親会社・子会社の関連チェック",
      status: "ok",
      message: "既存提携先とのグループ関連は検出されませんでした。",
    });
  }

  // ---- F/G/H/I. 契約期間・地域・イベント・ゲームの重複 ----
  const anyPeriod = competitors.some((x) => x.overlap.some((o) => o.includes("契約期間")));
  const anyRegion = competitors.some((x) => x.overlap.some((o) => o.includes("地域")));
  const anyEvent = competitors.some((x) => x.overlap.some((o) => o.includes("イベント")));
  const anyGame = competitors.some((x) => x.overlap.some((o) => o.includes("ゲーム")));

  checks.push({
    code: "F",
    label: "契約期間の重複チェック",
    status: anyPeriod ? "warn" : "ok",
    message: anyPeriod
      ? "競合候補と契約期間が重複しています。期間の調整または棲み分けを検討してください。"
      : "契約期間の重複は検出されませんでした。",
  });
  checks.push({
    code: "G",
    label: "対象地域の重複チェック",
    status: anyRegion ? "warn" : "ok",
    message: anyRegion
      ? "競合候補と対象地域が重複しています。"
      : "対象地域の重複は検出されませんでした。",
  });
  checks.push({
    code: "H",
    label: "対象イベントの重複チェック",
    status: anyEvent ? "warn" : "ok",
    message: anyEvent
      ? "競合候補と対象イベントが重複しています。"
      : "対象イベントの重複は検出されませんでした。",
  });
  checks.push({
    code: "I",
    label: "対象ゲームタイトルの重複チェック",
    status: anyGame ? "warn" : "ok",
    message: anyGame
      ? "競合候補と対象ゲームタイトルが重複しています。"
      : "対象ゲームタイトルの重複は検出されませんでした。",
  });

  // ---- J. 大会・ゲーム会社側のスポンサー規定チェック ----
  const candGames = splitList(c.gameScope);
  const relevantRules = ctx.rules.filter((r) => {
    if (r.is_deleted) return false;
    if (!candGames.length) return false;
    return candGames.some(
      (g) =>
        norm(r.game_title).includes(norm(g)) || norm(g).includes(norm(r.game_title)),
    );
  });
  let tournamentStatus: CheckItem["status"] = candGames.length ? "ok" : "info";
  let tournamentMsg = candGames.length
    ? "対象ゲームに関する登録済みの大会規定に抵触は見つかりませんでした。"
    : "対象ゲームタイトルが未入力のため、大会規定チェックは実施できません。";
  for (const r of relevantRules) {
    const catHay = [c.categoryName, c.productCategory, hay].join(" ");
    const prohibited = r.prohibited_categories.filter((pc) => norm(catHay).includes(norm(pc)));
    const restricted = r.restricted_categories.filter((rc) => norm(catHay).includes(norm(rc)));
    if (prohibited.length) {
      tournamentStatus = "block";
      tournamentMsg = `大会規定で禁止された業種に該当：${r.tournament_name || r.game_title}（${prohibited.join("・")}）`;
      tournamentNotes.push(
        `【${r.tournament_name || r.game_title}】禁止カテゴリー該当：${prohibited.join("・")}（出典：${r.source_name || "未記載"}）`,
      );
    } else if (restricted.length && tournamentStatus !== "block") {
      tournamentStatus = "warn";
      tournamentMsg = `大会規定で制限される業種の可能性：${r.tournament_name || r.game_title}（${restricted.join("・")}）`;
      tournamentNotes.push(
        `【${r.tournament_name || r.game_title}】制限カテゴリーの可能性：${restricted.join("・")}`,
      );
    }
    // 規定の最終確認日が古い場合の注意
    const checked = parseDate(r.last_checked_at);
    if (checked && Date.now() - checked > 1000 * 60 * 60 * 24 * 180) {
      tournamentNotes.push(
        `【${r.tournament_name || r.game_title}】規定の最終確認から半年以上経過。最新版の再確認を推奨。`,
      );
    }
  }
  checks.push({ code: "J", label: "大会・ゲーム会社側のスポンサー規定チェック", status: tournamentStatus, message: tournamentMsg });

  // ---- K. 法人情報の確認状況 ----
  if (!c.corporateNumber.trim()) {
    checks.push({
      code: "K",
      label: "法人情報の確認状況",
      status: "unknown",
      message: "法人番号が未入力です。国税庁 法人番号公表サイトで確認してください（個人事業主の場合は不要）。",
    });
    missingDocs.push("法人番号（または個人事業主である旨の確認）");
  } else if (!c.corporateVerified) {
    checks.push({
      code: "K",
      label: "法人情報の確認状況",
      status: "warn",
      message: "法人番号は入力済みですが未確認です。法人番号APIまたは公表サイトで実在・名称一致を確認してください。",
    });
    preContractChecks.push("法人番号と登記名称の一致を確認する");
  } else {
    checks.push({
      code: "K",
      label: "法人情報の確認状況",
      status: "ok",
      message: "法人番号の確認済みチェックが入っています。（実在確認＝適格性の保証ではありません）",
    });
  }

  // ---- L. 必要情報の不足チェック ----
  if (requiredMissing.length) {
    checks.push({
      code: "L",
      label: "必要情報の不足チェック",
      status: canJudge ? "warn" : "unknown",
      message: `不足している情報：${requiredMissing.join("・")}。`,
    });
    requiredMissing.forEach((m) => missingDocs.push(m));
  } else {
    checks.push({
      code: "L",
      label: "必要情報の不足チェック",
      status: "ok",
      message: "必須情報は入力されています。",
    });
  }

  // ---- M. 広告表示に関する注意事項 ----
  checks.push({
    code: "M",
    label: "広告表示に関する注意事項",
    status: "info",
    message:
      "掲載・投稿が広告に該当する場合は「広告」「PR」等の表示が必要です。ステマ規制（景品表示法）に留意してください。",
  });
  preContractChecks.push("SNS・掲載での広告/PR表示ルールを取り決める");

  // ---- N. 選手の肖像・AGロゴ利用申請の必要性 ----
  const rightsHay = norm(`${c.desiredRights} ${c.notes}`);
  const needsPortrait =
    rightsHay.includes("肖像") ||
    rightsHay.includes("選手") ||
    rightsHay.includes("写真") ||
    rightsHay.includes("ロゴ") ||
    rightsHay.includes("出演");
  checks.push({
    code: "N",
    label: "選手の肖像・AGロゴ利用申請の必要性",
    status: needsPortrait ? "warn" : "info",
    message: needsPortrait
      ? "選手の肖像・AGロゴの利用が想定されます。利用範囲の申請・本人（未成年は保護者）同意・使用許諾を取得してください。"
      : "選手の肖像・AGロゴを利用する場合は、別途利用申請と本人同意が必要です。",
  });
  if (needsPortrait) {
    preContractChecks.push("選手肖像・AGロゴの利用許諾（本人／保護者同意）を取得する");
  }

  // -------------------------------------------------------------------------
  // 総合判定（precedence: red > gray > orange > yellow > green）
  // -------------------------------------------------------------------------
  const hasBlock = checks.some((x) => x.status === "block");
  const hasReviewConflict =
    hardConflict.length > 0 ||
    tournamentStatus === "warn" && relevantRules.length > 0 ||
    (c.exclusivity && (likely.length > 0)) ||
    exclusivityConflicts.length > 0;
  const hasCaution =
    checks.some((x) => x.status === "warn") ||
    reviewHits.length > 0 ||
    competitors.length > 0;

  let verdict: Verdict;
  if (hasBlock) {
    verdict = "red";
  } else if (!canJudge) {
    verdict = "gray";
  } else if (hasReviewConflict) {
    verdict = "orange";
  } else if (hasCaution) {
    verdict = "yellow";
  } else {
    verdict = "green";
  }

  const riskLevel =
    verdict === "red"
      ? "高（契約不可）"
      : verdict === "orange"
        ? "中〜高（要運営審査）"
        : verdict === "yellow"
          ? "中（条件付き）"
          : verdict === "gray"
            ? "不明（情報不足）"
            : "低（候補）";

  // 推奨する次の対応
  if (verdict === "red") {
    recommendedActions.push("お断り、または該当事由の再確認。営業を進める前に運営で共有する。");
  } else if (verdict === "orange") {
    recommendedActions.push("運営会議で審査。競合・独占・大会規定の論点を整理してから営業する。");
  } else if (verdict === "yellow") {
    recommendedActions.push("条件（掲載範囲・広告表示・棲み分け）を整理し、条件付きで前向きに検討。");
  } else if (verdict === "gray") {
    recommendedActions.push("不足情報を収集してから再チェックを実行する。");
  } else {
    recommendedActions.push("契約候補として営業を進めてよい。契約書で権利・期間・独占範囲を確定する。");
  }
  recommendedActions.push("最終承認は必ず運営（人間）が行う。このチェックは下準備です。");

  // サマリ文
  const summary = buildSummary(c, verdict, {
    prohibitedHits: prohibitedHits.map((x) => x.category_name),
    reviewHits: reviewHits.map((x) => x.category_name),
    competitors,
    tournamentNotes,
    exclusivityConflicts,
  });

  return {
    verdict,
    riskLevel,
    checks,
    competitors,
    competitorCategories,
    exclusivity: {
      requested: c.exclusivity,
      scope: c.exclusivityScope,
      conflicts: exclusivityConflicts,
    },
    tournamentNotes,
    missingDocs: [...new Set(missingDocs)],
    preContractChecks: [...new Set(preContractChecks)],
    recommendedActions,
    summary,
  };
}

function buildSummary(
  c: ScreeningCandidate,
  verdict: Verdict,
  info: {
    prohibitedHits: string[];
    reviewHits: string[];
    competitors: CompetitorMatch[];
    tournamentNotes: string[];
    exclusivityConflicts: string[];
  },
): string {
  const name = c.companyName || "（企業名未入力）";
  const parts: string[] = [];
  if (verdict === "red") {
    if (info.prohibitedHits.length)
      parts.push(`「${info.prohibitedHits.join("・")}」が禁止業種に該当するため契約不可です。`);
    else if (info.tournamentNotes.length)
      parts.push("大会規定に抵触するため契約不可です。");
    else parts.push("既存の独占提携先と競合するため契約不可です。");
  } else if (verdict === "gray") {
    parts.push(`${name} は判定に必要な情報が不足しています。事業内容・カテゴリー等を追加してください。`);
  } else if (verdict === "orange") {
    parts.push(`${name} は運営会議での審査が必要です。`);
    if (info.competitors.length)
      parts.push(`競合候補：${info.competitors.map((x) => x.companyName).join("・")}。`);
    if (info.exclusivityConflicts.length) parts.push("独占権の論点があります。");
  } else if (verdict === "yellow") {
    parts.push(`${name} は条件付きで検討可能です。`);
    if (info.reviewHits.length) parts.push(`慎重審査業種：${info.reviewHits.join("・")}。`);
    if (info.competitors.length)
      parts.push(`競合可能性：${info.competitors.map((x) => x.companyName).join("・")}。`);
  } else {
    parts.push(`${name} は現時点で契約候補です。禁止業種・競合・大会規定に明確な抵触は見つかりませんでした。`);
  }
  parts.push("※ 本結果は下準備であり、最終承認は運営（人間）が行います。");
  return parts.join("");
}
