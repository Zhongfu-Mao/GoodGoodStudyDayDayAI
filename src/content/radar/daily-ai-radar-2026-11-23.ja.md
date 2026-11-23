---
title: "AIレーダー日報：2026-11-23"
date: 2026-11-23
category: radar
cadence: daily
radarFormat: 2
lang: ja
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-23.ja.mp3
audioDuration: 1325
audioSize: 10603969
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
coverImage: /images/radar/daily-ai-radar-2026-11-23.ja-infographic.webp
draft: false
tags: []
---

対象期間：2026-11-22 12:00 から 2026-11-23 12:00（日本時間、開始時刻を含まず終了時刻を含む）。

## 今日の重要な変化

- [RAGの二つの品質管理：資料の鮮度と回答の裏付けを分ける](#radar-rag-operations)
- [作品で執筆スキルを調整：比較評価の後もホールドアウトテスト](#radar-writing-examples)
- [検出指標をそのまま裁定にしない：疑いスコアは不正の証拠ではない](#radar-ai-metrics)

## 構築と運用

### RAGコースの更新：検索への入力と回答の出力を別々に管理

<a id="radar-rag-operations"></a>

- 出典：Daily Dose of Data Science · Avi Chawla
- 情報経路：Newsletter、ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-23
- リンク：https://blog.dailydoseofds.com/p/moving-from-rag-apps-to-rag-systems-465
- 要約：今回のコース告知は、本番RAGの責任を二層に分けています。入力側では文書の改訂、古くなったチャンク、埋め込み空間、インデックス移行を管理し、出力側では回答中の主張が引用資料に支持されているかを判定して、校正した閾値で回答するか棄権するかを決めます。移行には判定基準・エイリアス・ロールバック経路も必要で、互換性のないベクトルを混在させてはいけません。重要なのは、検証器が回答と資料の整合性を確認できても、資料が今も最新だとは限らない点です。コースと工学的手法の紹介であり、新モデルの発表や独立した性能評価ではありません。第20・21回の本文はいずれも11月21日公開であり、本項の11月23日は今回のまとめ告知の日付です。

<!-- radar-visual:rag-build-operate-risk -->
[![検索と生成、評価・移行・ロールバック、検証・校正・棄権というRAGの責任を示す三段階の図](<https://substack-post-media.s3.amazonaws.com/public/images/db726b6d-5b6b-4c93-85af-39a20ecddaeb_5504x2558.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/db726b6d-5b6b-4c93-85af-39a20ecddaeb_5504x2558.jpeg>)

*左から、検索と生成の構築は出発点にすぎず、中央の運用層が評価・移行・ロールバックを担い、右側で検証・校正・棄権により回答リスクを制御します。矢印は責任のつながりであり、前段が後段の正しさを自動保証することや性能測定結果を示していません。 画像出典：[Daily Dose of Data Science / Avi Chawla](https://blog.dailydoseofds.com/p/moving-from-rag-apps-to-rag-systems-465)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:rag-build-operate-risk -->

### Every：作品例とホールドアウトテストで執筆スキルを改善

<a id="radar-writing-examples"></a>

- 出典：Every / Grant Harvey / Mike Taylor
- 情報経路：Newsletter、ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-22
- リンク：https://every.to/context-window/stop-telling-ai-how-you-write-show-it
- 要約：Everyの日曜ダイジェストは、作品に基づく執筆評価の手順を紹介しています。最近の同じ形式の記事を12〜25本集め、一部を最終テスト用に取り分け、残りを論点・事実・引用だけの簡潔なブリーフへ戻します。それを基に執筆モデルが候補原稿を作り、評価モデルが元の作品と照らして二稿を比較し、表示順を交換して再評価することで順序バイアスを軽減します。評価が改善したスキル変更だけを残し、実際に執筆に使うモデルで調整します。取り分けた作品は、調整用の事例や評価者の好みに合わせただけではないかを確かめるためのもので、そのリスクをなくすわけではありません。著者の経験と週次まとめであり、独立したブラインド評価でも、別モデル・別形式・別の書き手に同じ成果を保証するものでもありません。

### Select Styling Specimens：AIで比較できるUI見本を作る

<a id="radar-select-specimens"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-11-22
- リンク：https://simonwillison.net/2026/Nov/22/select-styling/
- 要約：SimonはHTMLのネイティブな選択ボックスがブラウザごとに異なる外観になることを受け、Claude Fable 5.2にスタイル見本のページを作らせました。選んだCSSでは、`appearance: none`で既定の外観を外し、枠線・余白・色を指定し、埋め込みSVGで矢印を描きます。記事にはChrome、Safari、Firefoxの変更前後の画像があります。この小さな例の意義は、「見栄えをよくして」という曖昧な依頼を並べて比較できる候補に変え、最終選択を人が行う点です。画像は表示された環境での外観を示すだけで、モバイル操作、キーボード操作、アクセシビリティ、すべてのブラウザ版の検証を証明するものでも、新しいブラウザ標準でもありません。

<!-- radar-visual:select-styled-after -->
[![CSS指定後の三つのブラウザで角丸の薄灰色の枠と下向き矢印が共通する](<https://static.simonwillison.net/static/2026/select-styled-firefox-safari-chrome.webp>)](<https://static.simonwillison.net/static/2026/select-styled-firefox-safari-chrome.webp>)

*変更後は、外観とSVGの矢印を明示して、表示された三つのブラウザの見た目を近づけています。この比較が示すのは画像上の関係であり、キーボード・モバイル・アクセシビリティの検証を代替しません。 画像出典：[Simon Willison](https://simonwillison.net/2026/Nov/22/select-styling/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:select-styled-after -->

## 産業とガバナンス

### AI生成疑いスコアと授業の顔上げ率：指標で判断を代替しない

<a id="radar-ai-metrics"></a>

- 出典：老范讲故事
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-23
- リンク：https://lukefan.com/2026/11/23/ai-detection-classroom-monitoring-managerial-power/
- 要約：この論考は、論文のAI生成疑いスコアと授業中の顔上げ率の監視を、同じガバナンス上の問題として扱います。管理者が測りやすい代理指標を目標そのものとすると、評価される側は研究・表現・学習よりも点数を優先して最適化しかねない、という主張です。著者は報道や個別事例を引用し、検出スコアをそのまま学術評価に用いることや、下を向く行動を注意不足と直結させることを疑問視しています。指標の使い方と誘因への批評であり、検出器の誤判定率を測る統制実験ではなく、特定の人のAI利用や不正も推定できません。実装への示唆は、補助的な手掛かりと最終判断を分け、人による再確認・説明・異議申し立ての余地を残すことです。これはガバナンス上の提案であって、効果が検証された解決策ではありません。
