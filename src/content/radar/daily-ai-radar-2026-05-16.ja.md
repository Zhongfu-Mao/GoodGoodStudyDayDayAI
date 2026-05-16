---
title: "AI レーダー日報：2026-05-16"
date: 2026-05-16
category: radar
cadence: daily
plainSummary: "今日は ChatGPT の個人金融、Databricks の企業文書 Agent、Microsoft MDASH、Vera Rubin 推論基盤、Granite 多言語 embedding、Claude の企業・中小企業ワークフロー、そして Opik の Agent デバッグ閉ループに注目します。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Finance
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-16.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-16.ja.mp3
audioDuration: 1117
audioSize: 8939501
draft: false
---

## 本期范围

- 対象期間：2026-05-15 から 2026-05-16 まで。

---
![Defense at AI speed: Microsoft’s new multi-model agentic security system tops leading industry benchmark | Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/wp-content/uploads/2026/05/MS_Actional-Insights_Lock-1.jpg)

*代表画像は [Defense at AI speed: Microsoft’s new multi-model agentic security system tops leading industry benchmark | Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*

## 代表图说明

今日の主線は、「AI が汎用チャットの入口から、規制、文脈、検証可能な実行チェーンをより強く求める業務へ入り始めている」という流れです。OpenAI と Google は金融検索を、口座、チャート、リアルタイム情報と結びついた AI 体験にしつつあります。Databricks、Microsoft、NVIDIA、Hugging Face は、評価、脆弱性証明、推論ネットワーク、batching 調度の側から本番基盤を補っています。もう一つの線は企業導入です。Sea、PwC、Claude for Small Business、Gates Foundation の事例はいずれも、有効な Agent 導入がモデル交換ではなく、権限、データ、プロセス、研修、評価、人間の承認を接続することだと示しています。

## 1. AI Engineering & 架构

### Databricks は OfficeQA Pro で GPT-5.5 の企業文書 Agent 性能を測った

- 来源：OpenAI
- 日期：2026-05-15
- 链接：https://openai.com/index/databricks
- 摘要：OpenAI と Databricks は、GPT-5.5 が Databricks 顧客の Agent ワークフローで利用可能になり、OfficeQA Pro で企業文書タスクの性能を更新したと発表した。OfficeQA Pro は、スキャン PDF、レガシーファイル、長文脈文書、検索、grounded reasoning など、企業現場に近い処理を対象にする。Agent harness では、GPT-5.5 は GPT-5.4 と比べてエラーを 46% 減らし、50% accuracy を超えた初のモデルになった。Databricks は AI Unity Gateway、AgentBricks、Agent Supervisor API を通じて、GPT-5.5 に解析、検索、実行系サブ Agent を監督させる計画だ。企業 Agent の競争点は、複雑な文書を安定して読み、引用し、実行できるかに移っている。

### Microsoft MDASH は、安全 Agent の価値が単一モデルではなく harness にあることを示した

- 来源：Microsoft Security Blog
- 日期：2026-05-12
- 链接：https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/
- 摘要：Microsoft は MDASH と呼ばれる multi-model agentic scanning harness を公開した。100 以上の専門 Agent が、準備、スキャン、検証、重複排除、証明の各段階を担当し、複数の frontier model と distilled model を使って監査、討論、exploitability 判断を行う。Windows のネットワークと認証スタックで 16 個の新しい脆弱性を見つけ、そのうち 4 個は Critical RCE だった。非公開テストドライバーでは 21/21 の植え込み脆弱性をゼロ誤検知で検出し、CyberGym 公開ベンチマークでは 88.45% を記録した。重要なのは「モデルが脆弱性を見つける」ことではなく、候補発見が cross-file reasoning、ドメイン plugin、PoC 証明、Patch Tuesday 流程を通って初めて修正可能な安全成果になることだ。

### NVIDIA は agentic 推論を低ジッター、長文脈、跨チップ調度の問題として定義した

- 来源：NVIDIA Technical Blog
- 日期：2026-05-14
- 链接：https://developer.nvidia.com/blog/how-the-nvidia-vera-rubin-platform-is-solving-agentic-ais-scale-up-problem/
- 摘要：NVIDIA は Vera Rubin platform が Agentic AI の scale-up 問題にどう対応するかを説明した。multi-agent セッションは、非決定的な軌跡、増え続ける KV cache、tool definitions、会話履歴を生み、ユーザーごとに多数の推論 request を横断する。Vera Rubin NVL72 は高スループット prefill、長文脈 attention、同時 serving を担い、Groq 3 LPX は compile-time scheduling、低ジッター C2C、統合 SRAM pool で低遅延 FFN decode を処理する。NVIDIA Dynamo は Attention-FFN Disaggregation を調整する。Agent 性能は「GPU の数」だけではなく、network latency、compiler scheduling、KV-aware data exchange、tail latency の予測可能性で決まる段階に入っている。

### Hugging Face は async continuous batching で GPU 利用率を 76.0% から 99.4% に上げた

- 来源：Hugging Face
- 日期：2026-05-14
- 链接：https://huggingface.co/blog/continuous_async
- 摘要：Hugging Face は continuous batching の同期ボトルネックを分解した。CPU が次の request batch を準備している間に GPU が待ち、GPU が計算している間に CPU が待つため、8B model、batch size 32、8K token 生成の実験では、全体時間の約 24% が GPU 待ちで失われていた。チームは non-default CUDA streams、events、二つの input/output slot、carry-over mask、CUDA graph memory pool を使い、GPU が batch N を計算している間に CPU が batch N+1 を準備する形にした。GPU active time は 76.0% から 99.4% に上がり、生成時間は 300.6 秒から 234.5 秒へ短縮、22% 高速化した。推論最適化は新しい kernel だけでなく、調度と同期の設計でも直接コスト差になる。

## 2. 模型前沿 & 数据检索

### IBM Granite Multilingual R2 は 32K 文脈と 200+ 言語を小型 embedding model に載せた

- 来源：Hugging Face / IBM Granite
- 日期：2026-05-14
- 链接：https://huggingface.co/blog/ibm-granite/granite-embedding-multilingual-r2
- 摘要：IBM Granite は Apache 2.0 の多言語 embedding model を 2 種公開した。311M の full-size model と 97M の compact model である。どちらも 200+ 言語を扱い、52 言語と 9 種の programming language に対して強化訓練され、32K token context をサポートする。ONNX、OpenVINO、sentence-transformers、LangChain、LlamaIndex、Haystack、Milvus などの導入経路も用意されている。97M model は MTEB Multilingual Retrieval で 60.3 を記録し、公式は open sub-100M multilingual embedder として最上位と説明する。311M model は 65.2 を出し、Matryoshka dimension truncation に対応する。RAG システムにとって、多言語検索、長文書検索、コード検索の既定値を更新する候補になる。

### Google Finance は欧州で AI 金融研究、Deep Search、決算通話要約を拡大した

- 来源：Google
- 日期：2026-05-11
- 链接：https://blog.google/products-and-platforms/products/search/ai-powered-google-finance-in-europe/
- 摘要：Google は新版 AI-powered Google Finance を欧州で展開し、現地言語対応を提供すると発表した。新版には AI research、Google Finance でグローバル利用可能になった Deep Search、高度なチャート、商品と暗号資産データ、リアルタイム news feed、同期 transcript と AI summary を備えた earnings call が含まれる。これは ChatGPT の personal finance 体験と同じ方向を向いている。金融 AI は「株式の質問に答える」段階から、データソースを接続し、調査回答を生成し、チャート上の重要な変化を説明し、決算発表を追い、地域ごとにローカライズされる入口へ広がっている。

## 3. 垂直场景 & 产品落地

### ChatGPT personal finance preview は口座接続、financial memory、GPT-5.5 Thinking を一つにした

- 来源：OpenAI
- 日期：2026-05-15
- 链接：https://openai.com/index/personal-finance-chatgpt
- 摘要：OpenAI は米国の Pro ユーザー向けに ChatGPT personal finance experience を preview した。ユーザーは Plaid 経由で金融口座を接続でき、今後 Intuit にも対応する。12,000+ の金融機関をサポートし、残高、取引、投資、負債を参照できるが、完全な口座番号の閲覧や口座変更はできない。専用 financial memories、account dashboard、一時チャットの分離、接続解除後 30 日以内の同期口座データ削除などの制御もある。既定は GPT-5.5 Thinking で、50 人超の金融専門家が設計した評価では GPT-5.5 Thinking が 79/100、GPT-5.5 Pro が 82.5/100 を得た。金融 AI は、一般的助言から「実口座文脈を持つが権限境界を保つ」体験へ進んでいる。

### Sea は Shopee の engineering organization で Codex を展開し、「速く打つ」より「よく考える」を強調した

- 来源：OpenAI
- 日期：2026-05-14
- 链接：https://openai.com/index/sea-david-chen
- 摘要：Sea Limited は engineering organization で Codex を展開している経験を紹介した。内部データではユーザーの 87% が weekly active user で、Codex に 4 または 5 を付けた開発者の 73% が同僚に推薦すると答えた。Sea が重視するのは autocomplete ではなく、Agent が大規模 microservices を理解し、依存関係を追跡し、legacy logic を読み、CI/CD の中で requirements を推論し、test-driven implementation を提案し、distributed systems の edge case を表面化することだ。アジアの大規模 internet company における Agent 導入として見ると、多言語、地域化、決済、物流、ピークトラフィックの複雑さが、coding agent を局所補完から system orchestration へ押し上げている。

### PwC と Anthropic は Claude を deal、finance、modernization、高規制業務へ展開する

- 来源：Anthropic
- 日期：2026-05-14
- 链接：https://www.anthropic.com/news/pwc-expanded-partnership
- 摘要：Anthropic と PwC は戦略提携を拡大し、PwC は米国チームから Claude Code と Claude Cowork を導入し、世界の数十万人規模へ展開する。両社は joint Center of Excellence を設け、30,000 人の PwC professional を Claude で training and certification する。重点は agentic technology build、AI-native deal-making、enterprise function reinvention で、PwC は Claude を軸にした Office of the CFO business group も始める。記事では、保険 underwriting が 10 週間から 10 日へ短縮され、security response が時間単位から分単位へ短縮された事例、mainframe modernization、HR transformation などが示された。consulting firm は Agent をデモではなく、監査可能で納品可能な service line に変え始めている。

### Claude for Small Business は AI を chat window から QuickBooks、PayPal、HubSpot、Canva、Docusign へ移した

- 来源：Anthropic
- 日期：2026-05-13
- 链接：https://www.anthropic.com/news/claude-for-small-business
- 摘要：Anthropic は Claude for Small Business を発表した。Claude Cowork 経由で Intuit QuickBooks、PayPal、HubSpot、Canva、Docusign、Google Workspace、Microsoft 365 に接続する。15 個の ready-to-run agentic workflows と 15 個の skills を含み、payroll planning、month close、cash-flow insight、invoice chasing、sales campaign、contract review、lead triage、content strategy などを扱う。ユーザーが開始し、送信、投稿、支払いの前に承認すること、既存権限を継承すること、Team と Enterprise では顧客データを既定で training に使わないことも強調されている。中小企業向け Agent の鍵は、賢い chat box ではなく、承認可能な connector workflow を作ることだ。

### Anthropic と Gates Foundation は 2 億ドルで Claude を公共衛生、教育、経済流動性へ向ける

- 来源：Anthropic
- 日期：2026-05-14
- 链接：https://www.anthropic.com/news/gates-foundation-partnership
- 摘要：Anthropic と Gates Foundation は 4 年間 2 億ドルの partnership を発表した。grant funding、Claude usage credits、technical support を通じて、global health、life sciences、education、economic mobility を支援する。医療タスク向け connectors、benchmarks、evaluation frameworks、ワクチンや治療候補の screening、疾病予測、保健省の意思決定、K-12 educational tools、基礎 literacy and numeracy apps、小規模農業向け dataset と agriculture benchmark などが含まれる。これは beneficial deployment を、単なる compute や API credit の寄付ではなく、データ、評価、domain connector、public goods として具体化している。

## 📬 Newsletter 精选

### Daily Dose of Data Science は Opik と Ollie で Agent debugging、regression eval、tool wrapping をつないだ

- 来源：Daily Dose of Data Science
- 日期：2026-05-15
- 链接：https://blog.dailydoseofds.com/p/hands-on-building-custom-tools-for
- 摘要：今回の Newsletter は Agent quality を engineering harness の問題として扱っている。Opik は production failure trace から test suite を育て、natural-language assertion で挙動を検査し、prompt、tools、model、parameters を versioned configuration として管理する。Ollie debugging agent は失敗 trace の full span tree と source code を読み、diff を提案し、同じ入力で再実行し、修正を regression test として保存する。後半では CrewAI を使い、Pydantic input schema と BaseTool で real-time currency conversion tool を封装する例も示した。価値は、「Agent を信頼できるようにする」作業を trace、test、debugging、versioning、tool interface に分解している点にある。
