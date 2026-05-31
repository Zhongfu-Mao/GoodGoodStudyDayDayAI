---
title: "AI レーダー日報：2026-05-31"
date: 2026-05-31
category: radar
cadence: daily
plainSummary: "作り直した今日の主線は明確です。agent engineering は「より強いモデル」から、「評価できる、復旧できる、納品できる、学びを蓄積できる」生産システムへ移っています。Claude/Anthropic の市場 narrative、Google Gemini の体験拡張、OpenAI Codex の顧客 feedback loop、GitHub 上の agent workflow plugin と harness が、この流れを補完しています。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Evaluation
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-31.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-31.ja.mp3
audioDuration: 1142
audioSize: 9134270
draft: false
---

## 対象範囲

- 対象期間：2026-05-29 から 2026-05-31 まで。
- 本号は core sources、公式三社の確認元、GitHub trends、メール原文をもとに再構成しました。単一 platform の補足記事で日報全体を代替しない方針に戻しています。

---
![DoorDash LLM chatbot simulation and evaluation flywheel](https://substackcdn.com/image/fetch/$s_!L2Ta!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5832df44-5f71-4dcf-b4e9-6f38f771758d_2054x1852.png)

*代表画像は [How DoorDash Built a Testing System to Evaluate LLMs](https://blog.bytebytego.com/p/how-doordash-built-a-testing-system) から。今号の中心シグナル、つまり AI product は一度の prompt ではなく、反復可能な simulation、evaluation、regression loop によって改善される、という点を表しています。*

## 1. AI Engineering & アーキテクチャ

### DoorDash は simulation と evaluation flywheel で客服 LLM の hallucination を減らした

- 出典：ByteByteGo
- 日付：2026-05-30
- リンク：https://blog.bytebytego.com/p/how-doordash-built-a-testing-system
- 要約：DoorDash の customer support chatbot の問題は、context が足りないことではなく、注文、配送、返金、tool call の raw 情報が多すぎて model が field を誤読し、存在しない policy を返してしまうことでした。チームは改善方法を offline flywheel に変えました。過去の transcript から user profile と scenario を抽出し、LLM に customer role を演じさせて multi-turn conversation を作り、human judgment に calibration した LLM judge で policy adherence を評価します。5 分未満で 200 以上の simulated conversations を回し、50 以上の評価項目を扱えます。特に重要なのは case state です。raw tool history を structured intermediate state に蒸留し、context noise を下げています。

### Agent crash recovery は state consistency の問題になっている

- 出典：Daily Dose of Data Science
- 日付：2026-05-29
- リンク：https://blog.dailydoseofds.com/p/why-agent-crashes-are-nothing-like
- 要約：この記事は agent crash と database crash を分けて考えます。database recovery は deterministic replay に依存できますが、agent を再実行すると model が過去の判断、tool call、branch を変える可能性があります。長時間 task の agent には checkpoint/resume、serializable intermediate state、正確な context reconstruction、人間が介入できる pause point が必要です。Google Cloud Agent Platform の Memory Bank、Resume Agents、Ambient Agents もこの文脈で整理されています。agent memory は単なる RAG 追加ではなく、task state を consistency asset として扱う問題です。

### AI Forward Deployed Engineer は移行期の役割で、長期の主体は AI Engineer

- 出典：The Batch / DeepLearning.AI
- 日付：2026-05-29
- リンク：https://www.deeplearning.ai/the-batch/issue-355
- 要約：Andrew Ng は The Batch で AI Forward Deployed Engineer の回帰を取り上げました。この role は customer organization に入り、汎用 LLM、agent workflow、eval、business constraint を custom system に落とし込みます。ただし記事の見立ては、FDE は存在しても、長期的にはより広い AI Engineer の需要が大きいというものです。多くの企業は vendor-neutral な内部 team で AI application を継続的に作り、運用し、vendor を選び続ける必要があります。この見方は DoorDash や Braintrust の case とつながります。

## 2. モデル最前線 & アルゴリズム探索

### The Rundown は Claude Opus 4.8、funding、新 Mythos 期待を同じ競争線に置いた

- 出典：The Rundown AI
- 日付：2026-05-29
- リンク：https://www.therundown.ai/p/anthropic-just-eclipsed-openai
- 要約：The Rundown は Anthropic の Opus 4.8、650 億ドルの funding、9650 億ドル valuation をまとめ、benchmark と capital narrative の両方で OpenAI を上回ったと位置づけました。ここは冷静に読む必要があります。具体的な score や valuation の判断は official source や primary source で確認すべきですが、当日の英語圏 information flow の焦点はよく捉えています。Claude の narrative は「慎重な model company」から、「model、capital、Claude Code runtime、IPO expectation を同時に進める competitor」へ移っています。

### Apple の新 Siri は Gemini で再構築される可能性があり、model frontier は phone entry point へ流れている

- 出典：The Rundown AI / Bloomberg
- 日付：2026-05-29
- リンク：https://www.bloomberg.com/news/features/2026-05-28/apple-ios-27-photos-screenshots-revamped-siri-pro-camera-app-new-ai-features
- 要約：The Rundown は Bloomberg の Apple 新 Siri 報道を要約しました。新しい Siri は Gemini を基盤に再構築され、ChatGPT-style app、Dynamic Island entry point、AI search、screen と local data の理解、third-party AI agent support を含む可能性があります。この signal を model frontier section に置く理由は、multimodal と agent capability の次の競争が API console だけでなく、mobile OS の default entry point に流れているからです。

## 3. 実践コード & ツールライブラリ

### The Rundown は Codex /goal で「agent に finish line を渡す」書き方を示した

- 出典：The Rundown AI
- 日付：2026-05-29
- リンク：https://app.therundown.ai/guides/use-codex-goal-to-build-a-fully-functional-game-in-one-prompt
- 要約：The Rundown の training section は、小さな browser game を例に Codex `/goal` を紹介しました。曖昧な idea を testable な短い goal に圧縮し、agent に plan、implementation、test、fix を進めさせ、追加 feedback も新しい goal として渡します。この item 自体は大型 release ではありませんが、重要な product trend を表しています。agent product は「model を見張り続けながら code を直す」から、「明確な acceptance line を与え、agent に自走させる」へ移っています。

### Cursor Developer Habits Report は AI adoption gap を team behavior の層で数量化する

- 出典：The Rundown AI / Cursor
- 日付：2026-05-29
- リンク：https://cursor.com/insights
- 要約：The Rundown は Cursor の Developer Habits Report を取り上げました。developer の週次追加 code lines は大きく増え、agent tool calls も増加し、AI-generated changes が commit に届く例も増えています。ただし gains は少数の power users に集中しています。この item は tool section に置くのが自然です。AI coding の議論は「tool を使っているか」から、「誰が高 leverage workflow を作れているか、誰が autocomplete に留まっているか」へ移っています。team manager が見るべき次の指標は、agent usage cohort、review quality、cost、delivery stability の組み合わせです。

## 4. 業界 & ビジネス速報

### Anthropic の valuation narrative は pre-IPO 段階に入ったが、metric の口径は分けて読む必要がある

- 出典：老范讲故事
- 日付：2026-05-31
- リンク：https://lukefan.com/2026/05/31/anthropic-pre-ipo-funding-ai-bubble/
- 要約：老范讲故事は Anthropic の最近の動きを capital market narrative として整理しています。未承認の株式移転制限、profitability signal、650 億ドルの financing、post-money valuation 9650 億ドル、Claude Opus 4.8 release が一つの流れに見えます。この記事の価値は、異なる時点と異なる定義の ARR を直接比較してはいけないこと、そして「AI が本当に有用である」ことと「public market の valuation が妥当である」ことを混同しない点にあります。

## 5. GitHub 人気 repo & トレンド追跡

### Every は compound engineering を installable な agent workflow plugin にした

- 出典：GitHub Trending / Every
- 日付：2026-05-31
- リンク：https://github.com/EveryInc/compound-engineering-plugin
- 要約：Every の `compound-engineering-plugin` が GitHub Trending に入りました。同日の Every newsletter とも対応しており、compound engineering が方法論記事から、Claude Code、Codex、Cursor などに入れられる workflow plugin になっています。この repo は追跡価値があります。plan、execute、review、learned lessons を engineering constraint として外部化しており、今回の AI レーダー production pipeline の修復で補おうとしている能力そのものです。

### revfactory/harness は agent team design を composable skills の層へ押し出す

- 出典：GitHub Trending / revfactory
- 日付：2026-05-31
- リンク：https://github.com/revfactory/harness
- 要約：`revfactory/harness` は meta-skill によって domain-specific agent teams を設計する project です。単一の general agent にすべての context を背負わせるのではなく、specialized agents、skills、orchestration に分けます。trend signal として重要なのは、名前どおり harness が中心に来ていることです。agent reliability は model だけでなく、harness そのものが reusable、composable、auditable な software asset になるかに依存し始めています。

### liteparse は document parsing を軽量 open-source infrastructure に近づける

- 出典：GitHub Trending / run-llama
- 日付：2026-05-31
- リンク：https://github.com/run-llama/liteparse
- 要約：`run-llama/liteparse` は LlamaIndex ecosystem の lightweight document parsing project です。headline としては派手ではありませんが、実際の RAG、agent tool calling、knowledge-base pipeline に重要です。document parsing の品質は、後続の retrieval、summary、evaluation、citation の品質に直接影響します。こうした project を trend section に入れることで、日報が model headline だけを追い、production system を支える基盤 tooling を見落とす偏りを避けられます。

## 📬 Newsletter 精選

### Every：Compound Engineering は四步から八步へ拡張された

- 出典：Every
- 日付：2026-05-29
- リンク：https://every.to/guides/compound-engineering-gets-an-upgrade
- 要約：Every の原文は compound engineering を “brainstorm → work → review → compound → repeat” から “ideate → brainstorm → plan → work → review → polish → compound → repeat” に拡張しました。AI は中間の execution layer を担える一方、人間は最初に何を作る価値があるかを決め、最後に体験が本当に成立しているかを見る必要があります。これは単なる方法論ではなく、agent engineering の quality control への補習です。ideation、polish、compound がなければ、自動化は既存の偏りを増幅します。

### AI Valley：Anthropic valuation と developer productivity が同日の主要 narrative になった

- 出典：AI Valley
- 日付：2026-05-29
- リンク：https://www.theaivalley.com/p/anthropic-is-bigger-than-openai-now
- 要約：AI Valley の当日メールは、Anthropic のほぼ 1 兆ドル valuation、Claude 4.8、Apple Siri、developer productivity report を同じ号で扱いました。老范讲故事の capital market 視点とは違い、AI Valley は英語圏 information flow の index として機能します。どの topic が複数 source に広がり、どれを official link や primary source で再確認すべきかを示してくれます。Newsletter 精選の本来の意味は、本文に吸収済みという注記ではなく、メール原文にあった追跡価値のある signal を記録することです。
