---
title: "AIレーダー日報：2026-11-12"
date: 2026-11-12
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-12.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-12.ja.mp3
audioDuration: 807
audioSize: 6456404
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "マルチモーダル採点、AWSの動作比較、エージェントの実行環境と検査。"
plainSummary: "候補の採点、サービスの動作、成果物の合否は、それぞれ何を測ったかを分けて読む。"
---

対象期間は2026年11月11日12:00から11月12日12:00まで（日本時間）。新しい発表と、既存の運用を扱った報告を区別する。

## 今日の重要な変化

- [Gemini Decisions：一つのマルチモーダル入力で複数の限定質問を評価](#radar-gemini-decisions-api)
- [AWS Emulator：実サービスで期待動作を決め、同じテストをローカルでも実行](#radar-aws-emulator-fidelity)
- [Harness Arena：まずタスクを検証し、成功した構成の費用を比べる](#radar-harness-arena-comparison)

## 能力とエビデンス

### Gemini Decisions API：マルチモーダル入力を共有し、選択肢を個別に採点

<a id="radar-gemini-decisions-api"></a>

- 出典：Google、Simon Willison
- 情報経路：公式、ブログ
- エビデンス区分：公式発表
- 初出日：2026-11-11
- リンク：https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/
- 要約：11月11日、GoogleはGemini Decisions APIを公開した。同じテキスト、画像、音声、動画、PDFを複数の真偽判定、選択、段階評価に使い、Gemini Decision 1が文章を生成する代わりに候補を採点し、確率や確信度を返す。独立した質問は1リクエスト最大1,000件。公式のエンドツーエンド中央値150〜250ミリ秒は入力16Kトークンまで、質問1〜100件の測定範囲で、上限時の値ではない。Willisonが一つの動画で真偽判定を試すと、0や1に限らない確率が出た。不確実さを出力できる例で、実運用での校正を証明するものではない。

補助出典：[Willisonの動画での試行](https://simonwillison.net/2026/Nov/11/gemini-decisions-api/)

<!-- radar-visual:decision-api-architecture -->
[![マルチモーダル資料と3種類の質問をGemini Decision 1に渡し、個別に採点](<https://storage.googleapis.com/gweb-uniblog-publish-prod/images/decisions-architecture_f0NFXU9.width-1200.format-webp.webp>)](<https://storage.googleapis.com/gweb-uniblog-publish-prod/images/decisions-architecture_f0NFXU9.width-1200.format-webp.webp>)

*左の共有入力と3種類の質問をモデルに渡すと、右に真偽の確率、選択肢、段階評価が別々に返る。図の確信度はデモ結果だ。 画像出典：[Google](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:decision-api-architecture -->

## 構築と運用

### AWS Emulator：同じ動作テストを実サービスとローカルエミュレーターで実行

<a id="radar-aws-emulator-fidelity"></a>

- 出典：AWS / All Things Distributed
- 情報経路：ブログ、GitHub
- エビデンス区分：著者の説明
- 初出日：2026-11-11
- リンク：https://www.allthingsdistributed.com/2026/11/aws-emulator-and-the-engineers-job-when-agents-write-the-code.html
- 要約：AWSがローカルで動くAPIエミュレーターを公開した。公開Smithy APIモデルをもとにエンドツーエンドの動作テストを作り、実際のAWSで期待動作を確かめた後、同じテストでエミュレーターとの差を探す。例えばSQSで受信したメッセージは可視性タイムアウトまでは他の消費者に見えないはずだ。実装とテストはエージェントが担い、変更には自動化したマージ条件があると開発元は説明する。ローカルで結果を早く得られても、未検証のAPI、権限設定、本番障害まで一致するとは限らない。

プロジェクト：[aws/aws-emulator](https://github.com/aws/aws-emulator)

### Harness Arena：タスクをそろえて実行構成を比べる

<a id="radar-harness-arena-comparison"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter、GitHub
- エビデンス区分：著者の説明
- 初出日：2026-11-11
- リンク：https://blog.dailydoseofds.com/p/find-production-agent-failures-before
- 要約：Daily DoseはHarnessRouterのArenaを紹介した。異なるモデルと実行基盤の組み合わせに同じプロンプト、ファイル、ツール、合否条件を与え、合否、時間、費用、成果物を残す。まずタスクを達成したかを確かめ、合格した構成同士で費用を見る。実行基盤の影響を測りたければモデルを固定する。記事の少数タスクの比較はデモで、タスクをまたいだ順位ではなく、両方を変えた結果を片方の効果とは言えない。

プロジェクト：[HarnessRouter](https://github.com/HarnessRouter/harnessrouter)

<!-- radar-visual:harness-arena-shared-inputs -->
[![共通入力を複数の実行基盤とモデルに配り、費用、時間、合否を記録](<https://substack-post-media.s3.amazonaws.com/public/images/de6d1873-7e1e-463b-871b-682ac6cf069e_2752x1536.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/de6d1873-7e1e-463b-871b-682ac6cf069e_2752x1536.jpeg>)

*左でタスク資料をそろえ、右で構成ごとの結果を比べる。図ではモデルと実行基盤の両方が変わるため、構成全体の比較であって実行基盤だけの効果は示さない。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/find-production-agent-failures-before)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:harness-arena-shared-inputs -->

### Codexのワークショップ：設定を共有し、タスクの実行環境は分離

<a id="radar-codex-workshop-environment"></a>

- 出典：Latent.Space
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-11
- リンク：https://latent.space/p/codex-work/
- 要約：Latent.SpaceはAI Engineer Code SummitのCodexワークショップを報じた。先のDevDayで更新されたクラウド方式の解説で、環境設定を公開すると、複数タスクがその設定から分離されたインスタンスで動く。ローカルからクラウドへ渡したタスクで、以前のウィンドウ画像がブラウザーでも添付されたままの例も報告した。これは一度の実演で、あらゆるタスクが欠落なく移る保証ではない。引き継ぐ文脈、リポジトリ権限、再現可能な環境は別に確認する必要がある。

補助出典：[当日のワークショップ資料](https://aie-codex-workshop.openai.chatgpt.site/)

### LLM 0.37.2がプロバイダー間の認証情報の誤用を修正

<a id="radar-llm-provider-credential-fix"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-11
- リンク：https://simonwillison.net/2026/Nov/11/llm/
- 要約：メンテナーがLLM 0.37.2を公開した。OpenAI互換の別プロバイダーを設定した際、一部の条件でOpenAI用のAPIキーがそのサービスに送られ得る問題を修正する。リクエスト形式の互換性は認証情報の共用を意味しない。該当する外部エンドポイントを使う場合は対象ツールを更新したい。実際に送られたかは過去の設定やサービス側の記録を調べる必要があり、告知だけでは断定できない。

### Every：繰り返す修正指示を検査できる条件に変える

<a id="radar-every-corrections-to-tests"></a>

- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-11
- リンク：https://every.to/context-window/what-s-left-for-humans-after-automation
- 要約：Everyは評価担当のMike Taylorの方法を紹介した。成果物への修正指示を判定可能な項目にし、モデルや指示の版を変えて同じタスクを試す。例えば資料の図が専用に描かれたか、既存のブランド図の流用かを確かめる。一方、猫らしさを「正面を向く」と固定すると、丸くなって眠る猫を求めた場合に誤判定する。再発を検出するだけでなく、妥当な課題の変化を誤って落とさないかも確認する。チームの経験であり、モデル一般の優劣を示す結果ではない。

## プロダクトと実際の導入

### Tabletop：グループの計画を共同操作できる場にする

<a id="radar-tabletop-shared-space"></a>

- 出典：Google Labs
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-11
- リンク：https://blog.google/innovation-and-ai/models-and-research/google-labs/tabletop/
- 要約：Google Labsがリアルタイム共同作業の実験Tabletopを発表した。リンク、ファイル、アイデアを入れ、自然文やテンプレートから旅程や投票などの操作可能なツールを作り、仲間を同じ空間に招待する。チャットの文章だけでなく、複数人が操作できる成果物を作る点が特徴だ。発表時点では米国の18歳以上を対象に待機リストで展開しており、全地域での提供ではない。

## 産業とガバナンス

### Gilbert + Tobin：試行の余地を広げ、正式な成果には人が責任を持つ

<a id="radar-gilbert-tobin-human-approval"></a>

- 出典：OpenAI / Gilbert + Tobin
- 情報経路：公式
- エビデンス区分：著者の説明
- 初出日：2026-11-12
- リンク：https://openai.com/index/gilbert-tobin-sam-nickless
- 要約：OpenAIが豪州の法律事務所Gilbert + Tobinの責任者へのインタビューを公開した。最初は顧客情報や機密を入力しない条件で試し、その後、役割別アクセスや管理機能を備えた環境で個人支援から複数工程の業務へ広げ、人の確認と承認を残した。表の内容を文書に反映してPDFをまとめる例がある一方、タスクを定義し、出力を確認して納品に責任を負うのは人だ。利用者側の説明で、第三者の適合性認定、一般的な削減率、法的助言ではない。
