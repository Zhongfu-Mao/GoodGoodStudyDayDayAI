---
title: "AIレーダー日報：2026-11-11"
date: 2026-11-11
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-11.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-11.ja.mp3
audioDuration: 1073
audioSize: 8582144
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "Gemini 4 Carbonの提供拡大から、高速デコード、エージェント向けの接点、Copilotの段階移行まで。"
plainSummary: "モデルが速く、多くのことをこなせても、仕事が早く終わるとは限らない。接点と検証方法が成果を左右する。"
---

対象期間は2026年11月10日12:00から11月11日12:00まで（日本時間）。新発表、過去の開発事例の新しい解説、深掘りは初出日を添えて区別する。

## 今日の重要な変化

- [Gemini 4 Carbonの提供拡大：長時間の仕事で能力と人の判断を分ける](#radar-carbon-availability)
- [Naive-N0.5-Flash：難問ではトークン増加が高速デコードを打ち消し得る](#radar-naive-decode-latency)
- [CopilotのRust移行：新旧を共存させ、部品ごとに置き換える](#radar-copilot-rust-migration)

## 能力とエビデンス

### Gemini 4 Carbonの提供拡大、長い仕事では能力と判断を分けて見る

<a id="radar-carbon-availability"></a>

- 出典：Google、Every
- 情報経路：公式、Newsletter
- エビデンス区分：公式発表
- 初出日：2026-11-10
- リンク：https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/
- 要約：一部の防御担当者への限定提供に続き、Googleは対象となる有料の開発者・企業向けにCarbonを提供し、Google AI Ultra加入者にも対応する製品で順次展開する。複雑な開発や長時間の検証向けと位置付け、Antigravityのプレビュー機能 /swarm では設計や監査をCarbonに、別の作業を隔離環境で動く軽量モデルに割り振れる。Googleから早期アクセスを受けたEveryは、公開部分でコーディングと3D制作の改善に触れつつ、どの程度の監督が要るかは試用者で意見が割れたとする。長く動けることと、何をすべきか、いつ終えるべきかを判断できることは別だ。

補助出典：[Everyの試用記事の公開部分](https://every.to/vibe-check/vibe-check-gemini-4-carbon-doesn-t-know-when-to-stop)

### Naive-N0.5-Flash：デコードが速くても、難問が先に終わるとは限らない

<a id="radar-naive-decode-latency"></a>

- 出典：Latent.Space、NaiveAI
- 情報経路：ブログ、GitHub
- エビデンス区分：著者の実測
- 初出日：2026-11-10
- リンク：https://latent.space/p/naiveai/
- 要約：NaiveAIは専用の推論エンジンと投機的デコードで生成を速める。約2,100 token/sは開発元がBlackwell GPUを8基搭載した単一ノードで測った1秒間のピークだ。Latent.Spaceはテキスト問題を難度別に10問ずつ用意し、Flash系3モデルを比較した。HLE-Diamondの難問10問では、思考ありのNaiveのクライアント側平均応答時間は89.8秒、DeepSeek V4.1 Flash 1017のhighは79.7秒だった。前者は生成トークンが多い。サービスや設定も異なる小規模比較で、総合順位は決められない。タスクの品質、生成量、完了時間を併せて見る意味がある。

補助出典：[NaiveAIのプロジェクト資料](https://github.com/NaiveAI-Labs/Naive-N0.5-Flash)

<!-- radar-visual:naive-flash-response-time -->
[![3つの問題集で応答時間、生成トークン数、実効トークン毎秒を比較](<https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/551a71b8-fce5-4259-b40e-fb938cdfc13e/image.png?t=1793716278>)](<https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/551a71b8-fce5-4259-b40e-fb938cdfc13e/image.png?t=1793716278>)

*最下段のHLE-Diamondでは、思考ありのNaiveは生成量も実効速度も大きいが、平均応答時間は最短ではない。問題集・設定ごとに10問。右列は図の注記どおり平均生成量をクライアント側の平均応答時間で割った値で、本文の別集計のスループットや開発元の1秒ピークとは異なる。 画像出典：[Gabriele Beltramo / Latent.Space](https://latent.space/p/naiveai/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:naive-flash-response-time -->

## 構築と運用

### CopilotランタイムのRust移行を支えた、段階的に置換できる境界

<a id="radar-copilot-rust-migration"></a>

- 出典：ByteByteGo
- 情報経路：Newsletter、ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-10
- リンク：https://blog.bytebytego.com/p/how-github-used-ai-to-port-copilot
- 要約：ByteByteGoが、GitHubが9月16日に公表した移行を解説した。今回の新規稼働ではない。旧SDKはヘッドレスCLIを介し、別プロセスのNode.jsと通信していた。移行後はRustランタイムをホストプロセス内で呼び出せる一方、プロセス外の経路も残した。移行中は薄いアダプターで未移行のTypeScript側とつなぎ、コンポーネント単位のPRで置換しながら出荷した。GitHubによると計128件のPR、本番用Rustは80万行超。エージェントにコードを書かせるだけでなく、置換単位を明確にして旧実装との動作の差を段階ごとに確かめることで、一括切り替え後の手戻りを抑える。

技術原文（2026-09-16）：[GitHubの移行記録](https://github.blog/ai-and-ml/generative-ai/migrating-the-github-copilot-runtime-to-rust-using-copilot)

<!-- radar-visual:copilot-runtime-architecture -->
[![旧Copilot SDKは別のCLIプロセスを経由し、Rust版はプロセス内外の両方に対応](<https://substack-post-media.s3.amazonaws.com/public/images/2e64b9e1-d8ca-427a-b096-38cffbb4851e_4024x1604.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/2e64b9e1-d8ca-427a-b096-38cffbb4851e_4024x1604.png>)

*左の旧SDKは標準入出力で別のCLIプロセスにつなぐ。右上はFFIでホスト内のRustを呼び、右下は別プロセスを使う。書き直しで外部プロセスを禁止したのではなく、ホストに選択肢を増やした。 画像出典：[ByteByteGo](https://blog.bytebytego.com/p/how-github-used-ai-to-port-copilot)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:copilot-runtime-architecture -->

### Resendの対談：ツールが見つかることと、返り値を読み切れること

<a id="radar-resend-agent-interfaces"></a>

- 出典：Latent.Space / Resend
- 情報経路：ブログ、ポッドキャスト
- エビデンス区分：著者の説明
- 初出日：2026-11-10
- リンク：https://latent.space/p/resend/
- 要約：共同創業者のZeno Rochaによると、Resendの料金ページには人が操作するスライダーと、直接読めるMarkdownの表がある。MCPサーバーはメール送信だけでなく管理作業も扱うが、あるツールの返り値は大きすぎてコンテキストに収まらなかったという。入口の数と、呼び出し1回分のデータ量は別問題だ。入口を汎用ツール数個に絞っても返り値は自動で小さくならず、操作をすべて並べても適切なものが選ばれる保証はない。対談は設計事例で、これらの工夫が推薦率や失敗率を改善すると実証したわけではない。

## プロダクトと実際の導入

### ChatGPTが事業者プロフィールと、独立した事業者エージェントとの対話を試行

<a id="radar-chatgpt-business-agents"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-10
- リンク：https://openai.com/index/introducing-businesses-chatgpt
- 要約：対象事業者はBusiness Hubで自社を登録・確認し、基本情報や商品フィードを管理できる。言及やクリックの集計は、一定の件数に達した場合に提供される。別機能のBusiness Agentは当初、米国の対象EC・オンラインサービス事業者向けで、利用者はプロフィールから任意で新しい対話を始める。OpenAIによると、対話は明示的にラベル付けされ、ChatGPT自身の回答とは別で、事業者に利用者の対話本文は共有しない。プロフィール、事業者との対話、スポンサー表示は異なる入口であり、事業者の回答はChatGPTの独立した提案ではない。

### AndroidのGemini Intelligence、機能と機種ごとに段階展開

<a id="radar-android-gemini-rollout"></a>

- 出典：Google
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-10
- リンク：https://blog.google/products-and-platforms/platforms/android/gemini-intelligence-november-features-devices/
- 要約：Googleは一部機能をPixel 10シリーズの対象機種に広げ、米国で11月19日に予約開始予定のmotorola signature 27にも対応させると発表した。アプリをまたぐタスク自動化は英国、インド、日本にも展開する。Create My Widgetは説明文からホーム画面のウィジェットを作り、一部の提供は今後数週間で進む。Device Assistanceは端末設定や不具合対応向けだ。対応は機種、地域、機能ごとに異なる。日本への拡大は、すべてのAndroid端末で全機能が即時に使えることも、すべての処理が端末内で完結することも意味しない。

### AdobeとGoogleがアプリをまたぐ編集の計画を発表

<a id="radar-adobe-google-integrations"></a>

- 出典：Google
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-10
- リンク：https://blog.google/company-news/inside-google/company-announcements/adobe-google-partnership-integration/
- 要約：GoogleはDriveとGmailのファイルプレビューからAcrobatで編集する入口を設け、Gemini、Gemini Enterprise、検索のAI ModeへのAdobeツール連携を広げる計画だ。逆方向ではAdobeとDeepMindが、Photoshopでほぼリアルタイムに編集できる画像モデルを探る。前者はファイルとツールをつなぐ入口、後者はモデル能力の探索であり、すでに提供済みという発表ではない。編集の実測遅延も示されていない。

## 産業とガバナンス

### OpenAIとUpworkの研究：外注案件で求められる作業の組み合わせが変化

<a id="radar-upwork-task-mix"></a>

- 出典：OpenAI / Upwork
- 情報経路：公式
- エビデンス区分：著者の研究
- 初出日：2026-11-10
- リンク：https://openai.com/index/ai-effect-on-freelance-work
- 要約：研究はChatGPTの利用分類とUpworkの募集分類を突き合わせた。対応する63分類のうち43では、ChatGPTで相対的によく使われる作業の募集割合が減る、または相対的に少ない作業の割合が増える方向だった。残りはこの方向に当てはまらない。AI関連案件では生成・編集・モーショングラフィックスなどを組み合わせることが増え、固定予算が大きい案件は工数も多かった。二つのプラットフォーム上の構成を比べたもので、同じ発注者の代替判断を追跡した調査ではない。失われた雇用数や、時給の上昇を示すものでもない。

## 深掘り

### 意思決定モデル：JSONを生成せず、候補に直接スコアを付ける

<a id="radar-hf-decision-models"></a>

- テーマ：構築と運用
- 出典：Hugging Face
- 情報経路：ブログ
- エビデンス区分：プロジェクト説明
- 初出日：2026-11-10
- リンク：https://huggingface.co/blog/decision
- 要約：対象期間の開始前に公開された技術記事。問い合わせの本文、質問、選択肢を入力し、各選択肢の確率を直接返すインターフェースを解説する。二重請求を請求担当に振り分ける例では、自由文を生成してから解析するより、既存の業務上の選択肢に出力を合わせやすい。Transformersのdecisionインターフェースと小規模な微調整例も紹介するが、例示の高い確率は実運用の精度ではない。振り分けや優先度付けでは、実データによる確信度の校正と、低確信時の人への引き継ぎを検証したい。

<!-- radar-visual:decision-model-state-and-options -->
[![問い合わせ本文と候補部署を入力し、各部署の確率を返す意思決定モデル](<https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/decision/decision-models.png>)](<https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/decision/decision-models.png>)

*左から問い合わせ、質問、所定の部署候補を入力し、右で各部署のスコアを受け取る。図の割合はインターフェースの例で、本番精度や校正済み確率ではない。 画像出典：[Hugging Face](https://huggingface.co/blog/decision)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:decision-model-state-and-options -->
