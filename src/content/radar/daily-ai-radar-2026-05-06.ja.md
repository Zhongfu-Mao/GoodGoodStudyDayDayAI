---
title: "AI レーダー日報：2026-05-06"
date: 2026-05-06
category: radar
cadence: daily
plainSummary: "今日の AI レーダーは、Postgres + pgvector による検索基盤、生成 UI のサンドボックス、GPT-5.2 Pro を使った理論物理の導出、BM25 / Random Patches など古典的手法の再評価、そして frontier model 企業のエンタープライズ展開と計算資源戦略に注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - AI Infrastructure
  - Search
lang: ja
coverImage: "https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/images/radar/daily-ai-radar-2026-05-06.ja-infographic.webp"
audioUrl: "https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-05-06.ja.mp3"
audioDuration: 848
audioSize: 6785130
draft: false
---

---
![How Instacart Built a Search for Billions of Products](https://substackcdn.com/image/fetch/$s_!r5T4!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06aaf987-618a-4074-84c6-2625879c1678_2086x1654.png)

*代表画像は [How Instacart Built a Search for Billions of Products](https://blog.bytebytego.com/p/how-instacart-built-a-search-for) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*
## 本日の範囲

- 対象期間：2026-05-03 から 2026-05-06 まで。

## カバー画像メモ

今日のカバーは「AI システムの重心移動」を描く構成が合います。左側には検索、RAG、生成 UI、Agent の操作マニュアル、評価フィードバックループを置き、エンジニアリング層が厚くなっていることを示す。中央には GPT-5.2 Pro による理論物理の導出、Random Patches、BM25 を置き、モデル能力と古典的手法の再結合を表す。右側には海上データセンター、企業向け導入会社、Anthropic に移る CTO、顧客体験プラットフォームの大型資金調達を置き、AI が API から産業構造へ広がる流れを示す。

## 1. AI Engineering & アーキテクチャ

### Instacart は商品検索を Elasticsearch / FAISS から Postgres + pgvector へ寄せ直した

- 出典：ByteByteGo
- 日付：2026-05-05
- リンク：https://blog.bytebytego.com/p/how-instacart-built-a-search-for
- 要約：Instacart の検索基盤は、数十億の商品、日々の大量検索、価格・在庫・割引の膨大な更新を扱う必要がある。Elasticsearch の denormalized document は価格変更だけでも全文書の再インデックスを引き起こし、書き込み増幅が大きかったため、チームはキーワード検索を Postgres に戻して約 10 倍の書き込み削減を実現した。その後、FAISS のセマンティック検索も pgvector に統合し、在庫フィルタ、ベクトル検索、ランキング信号を同じデータベース上で処理した結果、ゼロ件検索は 6% 減り、全体の検索経路は約 2 倍高速化した。

### Open Generative UI は Agent が生成した UI をサンドボックスで実行する

- 出典：Daily Dose of Data Science
- 日付：2026-05-05
- リンク：https://github.com/CopilotKit/CopilotKit
- 要約：CopilotKit の Open Generative UI は、Agent が会話中に HTML / SVG / Chart.js などの UI 片を生成し、token streaming でアプリ内の sandboxed iframe に表示する仕組みだ。重要なのは「モデルに UI を書かせる」こと自体ではなく、隔離された実行環境、prompt-based skills、AG-UI プロトコル、MCP server を組み合わせている点にある。生成された UI は動的に変化できるが、親アプリの DOM、ユーザーデータ、ツール権限へ直接アクセスできない。

### 企業 Agent の難所はモデル知能から context・権限・handoff へ移っている

- 出典：Every
- 日付：2026-05-05
- リンク：https://every.to/context-window/the-dawn-of-codex-native-apps
- 要約：Every は AI ワークフローを、Agent に委任できる仕事と、人間が同じ画面で付き添うべき仕事に分けている。Dan Shipper の inbox-zero Codex ワークフロー、Airtable の AI Agent Architect 職、OpenAI Frontier Alliance、Anthropic の企業サービス会社を並べると、企業導入の本当の課題はモデルの賢さではなく、context、権限、handoff、eval、監査可能な操作ログだと見えてくる。

### BM25 は RAG における精密検索の土台としてまだ強い

- 出典：Daily Dose of Data Science
- 日付：2026-05-05
- リンク：https://www.dailydoseofds.com/a-crash-course-on-building-rag-systems-part-1-with-implementations/
- 要約：Daily Dose は BM25 を、単語の希少性、出現回数、文書長補正という三つの観点から整理している。すべての検索を embedding に投げるのではなく、エラーコード、専門用語、製品番号、略語のような exact match が重要な領域では BM25 が安定する。実運用の RAG で BM25 + vector hybrid search がよく使われる理由は、意味検索と精密検索の弱点を互いに補えるからだ。

## 2. モデル最前線 & アルゴリズム探索

### GPT-5.2 Pro が非ゼロ single-minus graviton tree amplitude の導出に参加

- 出典：OpenAI / Latent Space
- 日付：2026-05-05
- リンク：https://openai.com/index/extending-single-minus-amplitudes-to-gravitons/
- 要約：OpenAI の新しい preprint は、gluon に関する先行結果を graviton に拡張し、half-collinear regime では従来消えると考えられていた tree-level amplitude が分布として存在しうることを示した。GPT-5.2 Pro は gluon 論文を文脈として与えられた後、directed matrix-tree theorem に関係する導出を提示し、初稿生成にも関与した。人間の研究者の主な作業は、その後の解析的検証、極限チェック、論文化へ移っている。

### “Vibe Physics” は frontier model が検証可能な科学推論ループに入り始めたことを示す

- 出典：Latent Space
- 日付：2026-05-05
- リンク：https://www.latent.space/p/lupsasca
- 要約：Alex Lupsasca へのインタビューは、GPT-5 / GPT-5.2 を理論物理でどう使ったかを具体的に説明している。関連する教科書や論文でモデルを先に温め、近い問題へ推論を移すという使い方が中心だ。ここで重要なのは AI が物理学者を置き換えることではなく、発見の速度が上がると、研究のボトルネックが検証、証明の整理、追うべき結果の選別へ移るという点だ。

### Random Patches はメモリに載らない大規模表データにも木モデルを使えるようにする

- 出典：Daily Dose of Data Science
- 日付：2026-05-05
- リンク：https://blog.dailydoseofds.com/p/train-classical-ml-models-on-large-f9c
- 要約：Random Patches は ensemble 前提の手法で、行と列を同時にサンプリングした patch ごとに木を学習し、それらを組み合わせてランダムフォレストを作る。通常の random forest よりも木同士のデータ重なりを減らせるため、variance reduction に効きやすい。企業の構造化データでは今でも木モデルが強く、全データを一度にメモリへ載せられないケースでは特に実用的な選択肢になる。

### 自己構築する AI のタイムラインが 2029 年より前に置かれ始めている

- 出典：The Rundown AI
- 日付：2026-05-05
- リンク：https://www.therundown.ai/p/ai-data-centers-head-for-the-ocean
- 要約：The Rundown は、Anthropic 共同創業者 Jack Clark の self-improving AI に関する見立てを紹介している。Clark は、2029 年より前に AI が自分の後継システムを訓練し始める確率を 60% 以上と見ている。METR のデータでは、AI が独立して処理できるタスク時間は 2022 年の 30 秒級から 2026 年には 12 時間級へ伸びており、SWE-Bench でも Claude 2 の 2% から Mythos Preview の 93.9% まで急速に伸びたことが、モデル開発自動化の加速シグナルとして扱われている。

## 3. 実践コード & ツールライブラリ

### ローカルモデルを iPhone Action Button に割り当て、オフライン音声アシスタントにする

- 出典：The Rundown AI
- 日付：2026-05-05
- リンク：https://www.therundown.ai/p/ai-data-centers-head-for-the-ocean
- 要約：The Rundown は、iPhone に Locally AI を入れ、Gemma などのローカルモデルをダウンロードし、Action Button を Voice Mode に割り当てる手順を紹介している。初回は speech-to-text モデルも端末に入れるため、ネットワークなしでも音声質問ができ、データを外へ送らずに済む。実用上は、速度、保存容量、回答品質のバランスを見ながらモデルサイズを選ぶ必要がある。

### Agentic Inbox と TypeScript-to-Lean は、ツールを「操作可能」かつ「検証可能」へ近づける

- 出典：JavaScript Weekly
- 日付：2026-05-05
- リンク：https://javascriptweekly.com/issues/784
- 要約：JavaScript Weekly は純粋な AI newsletter ではないが、AI エンジニアリングに近いシグナルが複数ある。Cloudflare は React 19 / React Router 7 と Cloudflare API を使った self-hosted agentic email app、Agentic Inbox を公開した。Thales は TypeScript の一部を Lean sidecar に変換する試みで、AI coding workflow に「実行する Agent UI」と「形式的に推論できるコード意味論」の両端が必要になっていることを示している。

### Node.js 26 と Remix 3 は AI Web App の実行時前提を変え続けている

- 出典：JavaScript Weekly
- 日付：2026-05-05
- リンク：https://javascriptweekly.com/issues/784
- 要約：Node.js 26.0.0 は Current として公開され、Temporal API が標準で有効になり、V8 14.6 と Undici 8 へ更新された。Remix 3 beta は React フレームワークから離れ、web standards-first で独自 UI component model を持つ方向へ進んでいる。AI アプリにとって、こうした基盤の変化はタスクスケジューリング、ストリーミング UI、server action、edge runtime、長い会話状態の管理に影響する。

## 4. 業界 & ビジネス速報

### CTO が Anthropic の MTS に移る流れは「モデルに近いこと」の職業レバレッジを示している

- 出典：老范讲故事
- 日付：2026-05-06
- リンク：https://lukefan.com/2026/05/06/silicon-valley-ctos-join-anthropic-mts/
- 要約：記事は Workday CTO、You.com 共同創業者兼 CTO、Super.com CTO などが Anthropic の MTS 職へ移る現象を、単なる降格ではなく、職業ラベル、技術レバレッジ、次の起業や企業サービスへの入口を frontier model 企業に結び直す動きとして読む。Anthropic 側にとっても、彼らは旧来のソフトウェア企業の組織、顧客、プロセス、上場企業運営の知見を持ち込み、企業 AI サービス領域を攻めるための人材になる。

### Panthalassa が 1.4 億ドルを調達し、AI データセンターを海へ移そうとしている

- 出典：The Rundown AI
- 日付：2026-05-05
- リンク：https://www.therundown.ai/p/ai-data-centers-head-for-the-ocean
- 要約：Peter Thiel が Panthalassa の 1.4 億ドル Series B を主導した。同社は 85 メートル級の海上構造物で波力を電力に変え、AI チップに給電し、海水で自然冷却する構想を掲げる。商用化までは距離があるが、データセンターの立地、エネルギー、地域住民の反発、冷却方式が AI 産業競争の前面に出てきたことを示すニュースだ。

### Sierra が 9.5 億ドルを調達し、顧客体験 Agent プラットフォームの評価額は 150 億ドルへ

- 出典：The Rundown AI / Sierra
- 日付：2026-05-05
- リンク：https://sierra.ai/blog/better-customer-experiences-built-on-sierra
- 要約：Sierra は 9.5 億ドルの資金調達を発表し、評価額は 150 億ドルになった。同社は自社の AI customer experience platform が Fortune 50 の 40% 以上に使われているとしている。顧客対応は、明確な業務フロー、測定可能な KPI、大量の非構造化会話、高い人件費がそろっているため、企業 Agent が最初に大規模化しやすい領域の一つだ。

## 📬 Newsletter 精選

### Every：Codex-native Apps の核心は「全自動」ではなく、どこで密着協業するかを知ること

- 出典：Every Newsletter
- 日付：2026-05-05
- リンク：https://every.to/context-window/the-dawn-of-codex-native-apps
- 要約：Every は Agent ワークを delegation と collaboration に分け、Codex + Cora + Proof document による inbox-zero ワークフローを例にしている。Agent はメールを走査し、下書きし、アーカイブできるが、判断、下書き、送信アクションは共有ドキュメント上で可視化され、監査でき、承認できる必要がある。AI ネイティブアプリの重要 UI は、チャット欄ではなく「操作マニュアル + 状態ドキュメント + 取り消せるアクションログ」かもしれない。

### The Rundown：UiPath は RPA の延長線を Agentic Business Orchestration として語り直している

- 出典：The Rundown AI Newsletter
- 日付：2026-05-03
- リンク：公開版リンクなし
- 要約：UiPath CMO Michael Atalla は、企業 AI が失敗する理由を、AI pilot や自動化が孤立しており、AI agents、robots、humans、業務システムをつなぐ governed workflow がないことだと説明している。境界線としては、非構造化データ、文脈判断、例外処理は Agent に向き、決定的なルール処理は従来型自動化に向く。承認、エスカレーション、責任の所在は、人間と組織の仕組みに残すべきだという点が重要だ。

### JavaScript Weekly：Web ツールチェーンは AI App のための実行時余白を広げている

- 出典：JavaScript Weekly Newsletter
- 日付：2026-05-05
- リンク：https://javascriptweekly.com/issues/784
- 要約：今号では Remix 3 beta の脱 React 化、Node.js 26 の Temporal 標準有効化、Vitest の framework-agnostic 化提案、PM2 7 の Bun サポート強化、Cloudflare Agentic Inbox が取り上げられている。モデル能力のニュースではないが、agentic inbox、ローカル開発、タスクスケジューリング、ランタイム互換性、E2E テストの選択に効いてくるエンジニアリング信号だ。
