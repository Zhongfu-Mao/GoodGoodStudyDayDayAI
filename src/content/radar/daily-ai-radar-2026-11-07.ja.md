---
title: "AIレーダー日報：2026-11-07"
date: 2026-11-07
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-07.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-07.ja.mp3
audioDuration: 819
audioSize: 6550863
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
---

対象は 2026 年 11 月 6 日 12:00 から 11 月 7 日 12:00 まで（日本時間）。深掘りでは初出日を記載する。

## 今日の重要な変化

- [ToyBlocks：制御可能な積み木環境で、ロボットの計画と動作を別々に試す](#radar-toyblocks)
- [MoE ルーティング：トークン当たりの専門家数だけでなく通信と負荷を見る](#radar-moe-routing)
- [OpenAI と Hacktron：外部サービスとの連携を共同テストの対象に](#radar-hacktron)

## 能力とエビデンス

### ToyBlocks：ロボットの汎化失敗を計画と実行に分けて調べる

<a id="radar-toyblocks"></a>

- 出典：Ai2
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-06
- リンク：https://huggingface.co/blog/allenai/toyblocks
- 要約：Ai2 は実験を卓上のロボットアームと積み木に絞り、学習データと評価条件を制御できる環境を作った。強化学習と動作計画で押す・裏返すといった短い技能を作り、タスク・動作プランナーが技能をつないで、シミュレーションで実演データとラベルを記録する。特定の位置や積み上げ段数を学習から除外し、学習範囲内の補間と範囲外への外挿を別々に評価できる。上位の計画や下位の動作を担う部品を置き換えれば、長いタスクがどこで失敗したかも切り分けられる。成功率に加え、速度、力、進捗も測る。実機への移行は限られた場面での実演で、開放環境での汎化を保証しない。

<!-- radar-visual:toyblocks-planning-evaluation -->
[![ToyBlocksのシーンとタスクを技能生成、計画実行、学習、評価につなぐ図](<https://www.datocms-assets.com/64837/1793917318-toyblocks-framework-current.png>)](<https://www.datocms-assets.com/64837/1793917318-toyblocks-framework-current.png>)

*中央の Planning は技能を組み合わせ、Plan execution は計画を実行してデータとラベルを記録する。下段の Training と Evaluation に注目すると、実演データを作る工程とモデルを評価する工程の違いが分かる。 画像出典：[Ai2](https://huggingface.co/blog/allenai/toyblocks)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:toyblocks-planning-evaluation -->

### 仮想細胞：評価指標によって平均値ベースラインとの比較が変わる

<a id="radar-virtual-cell-metrics"></a>

- 出典：Latent.Space
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-06
- リンク：https://latent.space/p/controlling-biology-fabian-theis-helmholtz-munich/
- 要約：Fabian Theis のインタビュー解説記事は、モデルの大きさより摂動予測の評価に目を向ける。大半の遺伝子がほとんど変化しないと、集計指標によっては平均に近い保守的な予測が有利になる。モデル比較では、実際に変化した信号を指標がどう捉えるかを明示したい。解説ではさらに、異なるスケールのデータを対応づけて摂動後の細胞を観測し、モデルの提案を実験のフィードバックにつなげる方向を論じる。番組で議論した研究課題であり、スケールをまたぐ細胞シミュレーションが実証済みという意味ではない。

## 構築と運用

### MoE ルーティング：トークン当たりの専門家数を固定しても負荷は均等にならない

<a id="radar-moe-routing"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-07
- リンク：https://blog.dailydoseofds.com/p/7-moe-routing-strategies-in-production
- 要約：一般的な top-k は各トークンが選ぶ専門家数を固定するが、複数のトークンが同じ専門家に集中し得る。Expert Choice は逆に専門家が容量の範囲でトークンを選ぶ。専門家間の負荷は制御しやすいが、各トークンの計算量が等しくなるわけではない。機器の配置に合わせて候補の専門家グループを絞ると、ノードをまたぐ送信先を減らせるが、全体の高速化を保証しない。運用時は経路選択、機器間の分配、専門家バッチの計算、結果の結合を分けて測る。紹介された七つの設計には学習や画像認識の研究も含まれ、自己回帰推論でそのまま切り替えられる設定ではない。

<!-- radar-visual:moe-expert-dispatch -->
[![MoEの経路選択、トークン分配、専門家バッチ計算と、通信・小バッチの負荷を示す図](<https://substack-post-media.s3.amazonaws.com/public/images/0fd54815-f5f7-4a71-9a99-83f0b58ff6f7_2752x1536.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/0fd54815-f5f7-4a71-9a99-83f0b58ff6f7_2752x1536.jpeg>)

*矢印を追うと、専門家の選択後にトークンを転送し、各専門家がそれぞれのバッチを処理する。通信と小さなバッチでの計算のどちらもボトルネックになり得る。七つの設計の実測遅延を比較した図ではない。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/7-moe-routing-strategies-in-production)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:moe-expert-dispatch -->

## 産業とガバナンス

### OpenAI と Hacktron：外部サービスとの連携を共同で検証

<a id="radar-hacktron"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-06
- リンク：https://openai.com/index/partnering-with-hacktron/
- 要約：OpenAI はセキュリティチーム Hacktron との提携を発表した。両者が優先度の高いテスト対象を選び、OpenAI のシステムと外部サービスのやり取りを重点的に調べる。Daybreak Red を通じて Hacktron の先端モデルへのアクセスも拡大する。新しいのは特定の研究チームとテストの焦点であり、全顧客向けの開放ではない。今回の提携で発見・修正した脆弱性の件数も発表されていない。個別の入力に対するモデルの反応だけでなく、アプリ、クラウド基盤、認証基盤の組み合わせを見る取り組みだ。

## 深掘り

### METR：能力指標の傾きは従来の 1.9 倍、研究開発加速の因果推定ではない

<a id="radar-metr-aeci"></a>

- テーマ：能力とエビデンス
- 出典：METR
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-05
- リンク：https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/
- 要約：METR が Anthropic の研究開発を評価したところ、内部モデルと内部ベンチマークを含む場合、2025 年 10 月以降の能力指標 AECI の傾きは、それ以前の 1.9 倍と推定された。95% 信頼区間は 1.5〜2.8 倍。結果はベンチマークと傾向推定の仮定に左右され、公開されていない証拠もある。技術者の生産性、AI の因果的な寄与、自律的な研究開発能力を直接測った数字ではない。能力曲線、開発現場の観察、加速の要因を分けて読むと意味がある。

<!-- radar-visual:metr-aeci-trend -->
[![モデルごとの推定点と誤差範囲、傾向線を示すMETRのAECIグラフ](<https://metr.org/assets/images/ai-rd-acceleration-assessment/aeci-main.png>)](<https://metr.org/assets/images/ai-rd-acceleration-assessment/aeci-main.png>)

*縦軸は AECI、点はモデルごとの推定位置。1.9 倍は前後の傾向線の傾きの比で、個別モデルのスコアの倍率でも、AI の因果的な寄与でもない。 画像出典：[METR](https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:metr-aeci-trend -->

### Every：AI ワークフローを維持、作り直し、保留、終了に分ける

<a id="radar-every-workflow-review"></a>

- テーマ：プロダクトと実際の導入
- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-07-20
- リンク：https://every.to/working-overtime/why-some-ai-workflows-stick-and-others-don-t
- 要約：Every は 11 月 6 日に Katie Parrott の個人的な振り返りを再掲載した。デモを見て仕事の連絡を集約するツールを作ったが、ほとんど使わなくなった。一方、既存の習慣に合う執筆や予定管理の補助は定着した。実際に繰り返す作業か、確認や維持に見合うか、使い始めるきっかけが明確かを問い、維持、作り直し、時期を待つ、終了に分ける。個人の選別方法であって、チーム全般の導入率を予測する比較研究ではない。
