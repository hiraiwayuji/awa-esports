-- AWAKEN GLOW スポンサーカテゴリー 初期データ（冪等）
-- category_name を一意キーに ON CONFLICT DO NOTHING。再実行しても重複しない。
-- competitor_group：実質的に市場が重なる束。企業名/カテゴリーが完全一致でなくても
-- 同一グループなら「競合可能性あり」として検出できるようにするためのキー。

insert into public.awa_sponsor_categories
  (parent_category, category_name, risk_level, is_prohibited, requires_review, keywords, competitor_group, notes)
values
  -- ===== 通常カテゴリー（24分類） =====
  ('IT・ハードウェア', 'ゲーミングPC',          'normal', false, false, '{ゲーミングPC,BTO,パソコン,PC,デスクトップ}',        'pc_hardware',  ''),
  ('IT・ハードウェア', 'PCパーツ',              'normal', false, false, '{PCパーツ,GPU,グラボ,CPU,メモリ,マザーボード,SSD}', 'pc_hardware',  'ゲーミングPCと市場が重なる'),
  ('IT・ハードウェア', 'モニター',              'normal', false, false, '{モニター,ディスプレイ,液晶,ゲーミングモニター}',    'display',      ''),
  ('IT・ハードウェア', 'ゲームコントローラー',   'normal', false, false, '{コントローラー,ゲームパッド,パッド}',              'input_device', ''),
  ('IT・ハードウェア', 'アーケードコントローラー','normal', false, false, '{アケコン,アーケードコントローラー,レバー,ヒットボックス}','input_device','ゲームコントローラーと市場が重なる'),
  ('通信',            '通信・インターネット',    'normal', false, false, '{通信,回線,プロバイダ,光回線,インターネット,格安SIM,モバイル}','telecom',''),
  ('施設',            '会場・施設',            'normal', false, false, '{会場,施設,スタジオ,ネットカフェ,eスポーツ施設}',    'venue',        ''),
  ('飲食',            '飲食店',                'normal', false, false, '{飲食店,レストラン,カフェ,居酒屋,ラーメン}',        'food_service', ''),
  ('飲食',            '食品',                  'normal', false, false, '{食品,菓子,食料品,お菓子}',                        'food',         ''),
  ('飲料',            '清涼飲料',              'normal', false, false, '{清涼飲料,ジュース,お茶,水,スポーツ飲料,炭酸}',      'beverage',     ''),
  ('飲料',            'エナジードリンク',       'normal', false, false, '{エナジードリンク,エナドリ,栄養ドリンク}',          'beverage',     '清涼飲料・スポーツ飲料と市場が重なる'),
  ('生活',            'アパレル',              'normal', false, false, '{アパレル,衣料,ウェア,服,ファッション}',            'apparel',      ''),
  ('生活',            'スポーツ用品',          'normal', false, false, '{スポーツ用品,スポーツギア,シューズ}',              'sports_goods', ''),
  ('医療・健康',      '医療・接骨院・整体',     'review', false, true,  '{医療,接骨院,整体,整骨,鍼灸,治療院}',              'health_care',  '広告表現に薬機法上の注意が必要'),
  ('医療・健康',      '健康・フィットネス',     'review', false, true,  '{フィットネス,ジム,トレーニング,健康,パーソナル}',    'health_care',  '効果効能の表現に注意'),
  ('教育',            '教育・スクール',        'normal', false, false, '{教育,スクール,塾,習い事,eスポーツスクール}',        'education',    ''),
  ('生活',            '自動車',                'normal', false, false, '{自動車,カーディーラー,車,中古車}',                'automotive',   ''),
  ('生活',            '不動産',                'review', false, true,  '{不動産,賃貸,住宅,マンション}',                    'realestate',   '投資勧誘型は慎重審査'),
  ('金融',            '金融・保険',            'review', false, true,  '{金融,保険,銀行,ローン,信用金庫}',                 'finance',      '広告表示規制に注意'),
  ('メディア',        '動画・配信・メディア',   'normal', false, false, '{動画,配信,メディア,放送,YouTube,Twitch}',         'media',        ''),
  ('制作',            '印刷・デザイン',        'normal', false, false, '{印刷,デザイン,制作,広告制作}',                    'creative',     ''),
  ('地域',            '地域企業',              'normal', false, false, '{地域,地元,徳島}',                                '',             ''),
  ('公共',            '行政・団体',            'normal', false, false, '{行政,自治体,団体,NPO,協会}',                      '',             ''),
  ('その他',          'その他',                'normal', false, false, '{}',                                              '',             ''),

  -- ===== 慎重審査カテゴリー =====
  ('要慎重審査',      '酒類',                  'review', false, true,  '{酒,ビール,アルコール,日本酒,ワイン,焼酎}',         'alcohol',      '未成年が多い活動のため掲載範囲・表現を要協議'),
  ('要慎重審査',      '美容・美容医療',        'review', false, true,  '{美容,エステ,脱毛,美容医療,美容整形}',              'beauty',       '医療広告ガイドライン・薬機法に注意'),
  ('要慎重審査',      'サプリメント・健康食品', 'review', false, true,  '{サプリ,サプリメント,健康食品,プロテイン}',          'supplement',   '効果効能の表現に注意'),
  ('要慎重審査',      '投資・暗号資産・FX',    'review', false, true,  '{投資,暗号資産,仮想通貨,FX,証券,NISA}',            'finance',      '誇大表現・元本保証の禁止等に注意'),
  ('要慎重審査',      '消費者金融・キャッシング','review', false, true,  '{消費者金融,キャッシング,カードローン}',            'finance',      '若年層への訴求に特に慎重'),
  ('要慎重審査',      '求人・人材サービス',     'review', false, true,  '{求人,人材,転職,派遣}',                            'recruit',      ''),
  ('要慎重審査',      '医療・医薬品',          'review', false, true,  '{医薬品,製薬,クリニック,病院}',                    'health_care',  '薬機法・医療広告ガイドラインに注意'),

  -- ===== お受けできない業種（禁止） =====
  ('お受けできない業種','アダルト・風俗',        'prohibited', true, false, '{アダルト,風俗,成人向け,出会い系}',               '',             '青少年育成の方針によりお受けできません'),
  ('お受けできない業種','ギャンブル・賭博',      'prohibited', true, false, '{ギャンブル,賭博,パチンコ,スロット,オンラインカジノ,ブックメーカー,賭け}','', '青少年育成・依存の懸念によりお受けできません'),
  ('お受けできない業種','反社会的勢力・関連事業','prohibited', true, false, '{反社,暴力団,反社会的勢力}',                       '',             ''),
  ('お受けできない業種','違法薬物・脱法ドラッグ','prohibited', true, false, '{違法薬物,脱法ドラッグ,大麻}',                     '',             ''),
  ('お受けできない業種','たばこ・電子タバコ',    'prohibited', true, false, '{たばこ,タバコ,電子タバコ,ニコチン,加熱式たばこ}', '',             '未成年が多い活動のためお受けできません'),
  ('お受けできない業種','マルチ商法・情報商材',  'prohibited', true, false, '{マルチ商法,ネットワークビジネス,MLM,情報商材,ネズミ講}','',        ''),
  ('お受けできない業種','誇大・虚偽の医療健康商材','prohibited', true, false, '{誇大広告,虚偽,無承認医薬品}',                    '',             ''),
  ('お受けできない業種','政治・宗教活動団体',    'prohibited', true, false, '{政治団体,宗教団体,布教,選挙}',                    '',             '特定の政治・宗教活動を目的とする団体はお受けできません')
on conflict (category_name) do nothing;
