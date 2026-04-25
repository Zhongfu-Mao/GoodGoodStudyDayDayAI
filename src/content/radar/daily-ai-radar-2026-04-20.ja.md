---
title: "AI Radar Daily: 2026-04-20"
date: 2026-04-20
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - OpenClaw
  - Opus
lang: ja
draft: false
---
## 対象範囲

- 対象期間：2026-04-17 〜 2026-04-20（過去 72 時間）


---
![72 Techniques to Optimize LLMs in Production](https://substackcdn.com/image/fetch/$s_!mRT-!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F945c4676-d214-41d9-ac1e-062caf345ae7_1190x1107.png)

*代表画像は [72 Techniques to Optimize LLMs in Production](https://blog.dailydoseofds.com/p/72-techniques-to-optimize-llms-in) から選定。この日の中心的な signal を最もよく表していたのは、「差を生むのは単発の小技ではなく、積み上げ可能な LLM 最適化スタック全体である」という点だった。*

## 1. 🛠️ AI Engineering & アーキテクチャ

### 🔧 72 Techniques to Optimize LLMs in Production
**出典：** Daily Dose of Data Science（Avi Chawla）  
**リンク：** <https://blog.dailydoseofds.com/p/72-techniques-to-optimize-llms-in>  
**公開日：** 2026-04-18

**要点：**  
LLM を本番運用するうえでの 9 つの最適化レイヤーを総覧した記事。モデル圧縮（INT4 / FP8 / GPTQ / AWQ）、Attention 改良（FlashAttention / PagedAttention / MLA）、デコード高速化（Speculative Decoding / EAGLE / Medusa）、KV Cache 管理（SnapKV は 92% 圧縮）、バッチ処理とスケジューリング（Continuous Batching / Prefill-Decode 分離）、並列化と kernel 融合、アプリ層 caching、I/O 削減、モデル routing までを一つの体系として整理している。結論は明快で、素朴な FP16 推論とフル最適化スタックでは、token あたりコストが **5〜8 倍**違っても不思議ではない。

**注目ツール：**
> 📦 **Blockify**（GitHub）：文書を平均 98-token の構造化知識単位 IdeaBlock に分解し、同じ埋め込みモデルでも RAG 精度を **13.55%** 向上、token 数は **3.09 倍**削減。GPU 不要で使える点も実用的。

### 🧩 The Two Sides of OpenClaw：オープン Agent プラットフォームの規模と安全性の代償
**出典：** Latent Space（AINews）  
**リンク：** <https://www.latent.space/p/ainews-the-two-sides-of-openclaw>  
**公開日：** 2026-04-18

**要点：**  
OpenClaw は TED と AIE でまったく違う顔を見せた。一般向けには成長物語として、エンジニア向けには安全性の警告として語られている。現在の security incident 数は curl の **60 倍**、少なくとも **20%** の skill contribution に悪性コードが含まれる可能性があるとされ、史上もっとも急成長した OSS のメンテ難易度の象徴になっている。

**業界の共通認識は「シンプルな harness + 強い evaluation + model-agnostic な土台」へ収束**
- @AsfiShaheen の金融分析 pipeline（router / lane / analyst）では、多くの bug は model bug ではなく instruction / interface bug だった
- @AymericRoucher は Claude Code の harness から、「精巧な AI scaffold」よりも簡潔な planning constraint の方が効くと指摘
- Qwen3-8B は dspy.RLM で 33/507、vanilla では 0/507 で、**scaffold が 100% 分の改善を作った**といえる

**その他の重要な動き**
- **Claude Design**：Anthropic 初の design / prototype ツール。Opus 4.7 駆動で、slides、one-pager、prototype を生成し、Canva / PPTX / PDF / HTML へ出力して Claude Code に引き渡せる
- **Hermes Agent**：Ollama が `ollama launch hermes` をネイティブ対応。Nous Research と Kimi も $25K の hackathon を共同開催
- **Codex Computer Use**：企業の legacy software を扱える初の本格的 Computer Use platform とする実務者評価が出始めた
- **Stargate**：EpochAI 調査では、米国内 7 ノード全体で 2029 年に **9+ GW** 規模まで到達する可能性がある

### 🔬 Agent 研究フロント（Latent Space AINews より）

| 分野 | 論文 / ツール | 主要結果 |
|------|---------------|----------|
| Agent 推論の劣化監視 | Cognitive Companion | 第 28 層 hidden state の logistic probe で AUROC 0.840、追加推論コストなし。LLM judge で重複を 52〜62% 削減 |
| Web Agent の skill 転移 | WebXSkill | 軌跡から再利用 skill を抽出し、WebArena で +9.8pt、WebVoyager で 86.1% |
| Agent の自己改善 | Autogenesis | 能力ギャップを検出 → 改善案を生成 → 検証 → 統合を、再学習なしで回す |
| 科学発見 | GIANTS-4B | RL 訓練された insight anticipation model が、後続論文のコア貢献予測で frontier model を上回る |
| RAG 検索 | Late-Interaction | 後段 interaction 表現が原文テキストを代替し、一部 RAG pipeline は全文再構成なしで成立 |
| 消費者向けローカル推論 | Qwen3.6-35B-A3B | Red Hat NVFP4 量子化版で GSM8K Platinum 100.69% 復元率、llama.cpp + Pi でローカル agent stack を構成可能 |
| KV connector | MORI-IO (vLLM) | Prefill/Decode 分離 connector により、単一ノードで throughput **2.5 倍**向上 |

## 2. 🧠 モデル動向 & アルゴリズム

### 🚀 Claude Opus 4.7：4.6 を全方位で上回る更新
**出典：** Latent Space（AINews）  
**リンク：** <https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally>  
**公開日：** 2026-04-17

**要点：**  
Anthropic は Claude Opus 4.7 を正式公開し、4.6 をほぼ全ベンチで上回った。新たに **xhigh** 推論 effort が追加され、Claude Code のデフォルトにも採用されている。

| ベンチマーク | Opus 4.7 | 4.6 比 |
|-------------|----------|--------|
| SWE-bench Pro | 64.3% | +11pt |
| SWE-bench Verified | 87.6% | +7pt |
| Document Reasoning | 80.6% | +23.5pt（↑ 57.1%） |
| TerminalBench 2.0 | 69.4% | +4pt |
| GDPval-AA Elo | 1753 | #1 |
| Cursor 内部ベンチ | 70% | +12pt（↑ 58%） |

**主要な変化**
- 新 tokenizer と新しい pretrain の可能性。入力 token 数は最大 35% 増えるが、全体の token 消費量は**最大 50% 減少**
- 画像入力は **2,576px 長辺**（約 3.75MP）まで対応し、4.6 の 3 倍超。computer-use の高解像度 screenshot に十分
- Vals AI では Vibe Code Bench、Vals Multimodal、Finance Agent、SAGE など複数榜で #1
- 一部ユーザーから MRCR 長文脈性能低下の指摘もあったが、Anthropic 側は MRCR の欠陥を理由に Graphwalks の方を重視（4.6→4.7：38.7% → 58.6%）

### 📐 LLM アーキテクチャを読むための方法論ワークフロー
**出典：** Ahead of AI（Sebastian Raschka）  
**リンク：** <https://magazine.sebastianraschka.com/p/workflow-for-understanding-llms>  
**公開日：** 2026-04-18

**要点：**  
Raschka は、公式技術報告の情報量が減っていく中で、Hugging Face Hub の `config.json` と transformers の reference implementation を直接読むことを、実用的な標準ワークフローとして整理した。GQA、MLA、RoPE、MoE のような変種を読むときに「動くコードは嘘をつかない」という原則で追うやり方で、LLM-Gallery の図解もこの手法から生まれている。

### 🤖 NVIDIA Isaac GR00T N1.7：人型ロボット向けオープン VLA
**出典：** Hugging Face Blog  
**リンク：** <https://huggingface.co/blog/nvidia/gr00t-n1-7>  
**公開日：** 2026-04-17

**要点：**  
NVIDIA は人型ロボット向けの Vision-Language-Action モデル **GR00T N1.7** を Early Access として公開した。中核仮説は「人間データこそロボット知能に最もスケールするデータ源」であるというもの。工場での搬送、包装、検査といった量産業務に加え、指先レベルの器用な操作や task / subtask 単位の推論にも対応し、研究デモより一段実務寄りに踏み込んでいる。

## 3. 💻 実装コード & ツール

### ⚡ How to Fine-Tune LLMs in 2026：reward-free RL の時代
**出典：** Daily Dose of Data Science（Avi Chawla）  
**リンク：** <https://blog.dailydoseofds.com/p/how-to-fine-tune-llms-in-2026>  
**公開日：** 2026-04-20

**要点：**  
2026 年の fine-tuning は、SFT 中心から GRPO + RULER を核にした reinforcement fine-tuning へ移りつつある。手書き reward function も、大量の正解ラベルも前提にしない。

**GRPO（Group Relative Policy Optimization）**
- DeepSeek-R1 と同系統のアルゴリズム
- 同一 prompt から N 個の completion を生成し、グループ内の相対順位だけで policy を更新
- 必要なのは相対比較であって、絶対スコアではない

**ART（Agent Reinforcement Trainer）**
> 📦 **GitHub：** https://github.com/[art-repo]（記事内リンク）
- 100% オープンソースで、多段の tool-call agent 向けに設計
- LangGraph、CrewAI、ADK をネイティブ対応
- Client（agent code + trajectory 記録）と Backend（vLLM + Unsloth GRPO 学習）の二部構成
- 学習ステップごとに新しい LoRA checkpoint を推論サーバーへ自動反映

**RULER（Relative Universal LLM-Elicited Rewards）**
- LLM-as-judge を使って複数軌跡を相対比較し、「どちらが良いか」で判断
- 0〜1 の reward をそのまま GRPO に流し込める

**Notebook 実践例**
- 3B モデルに任意の MCP server の使い方を RL で学ばせる完全な notebook を提供
- MCP server URL を渡すだけで、タスク生成から訓練開始まで自動化できる

## 4. 📰 業界 & ビジネス

### 🔐 Claude KYC 開始：中国開発者への影響
**出典：** 老范讲故事  
**リンク：** <https://lukefan.com/2026/04/17/anthropic-claude-selective-kyc-china-user-crackdown/>  
**公開日：** 2026-04-17

**要点：**  
Anthropic は 2026-04-15 から一部ユーザーに KYC 認証を要求し始めた。政府発行 ID と live selfie の提出が必要になる。老范の分析では、これは**蒸留対策ではなく、むしろ「高消費の抜け道利用」対策**に近い。API 経由で使う組織的な蒸留プレイヤーはほぼ影響を受けず、打撃を受けるのは地域またぎ、共有アカウント、極端な高頻度利用の個人ユーザーだという見立てだ。

**重要な事実**
- KYC ベンダー Persona は**中国大陸の身分証をほぼ受け付けない**
- Persona は 2026-02 に設定ミスで 2,456 件のファイルを漏えいし、Discord は提携を打ち切った
- OpenRouter でも中国発行クレジットカードで Claude 系モデルが使えない事例が出ている
- Anthropic は 2025 年後半だけで **145 万**アカウントを停止、異議申し立て成功率は **3.3%**

**影響評価：**  
中国の一般開発者にとって利用経路は狭くなり、コストも上がる。ただし完全に使えなくなるわけではない。代理店側はコストも利幅も上がる一方、本格的な蒸留を行う組織にはほとんど効かない。

### 🦞 Microsoft OpenClaw 深掘り：CEO が押しても、構造的な矛盾は残る
**出典：** 老范讲故事  
**リンク：** <https://lukefan.com/2026/04/16/microsoft-openclaw-ai-agent-cloud-client-tradeoffs/>  
**公開日：** 2026-04-16

**要点：**  
Microsoft 版 OpenClaw は Satya Nadella が前面に出て支えているが、老范は根本的な雲-端末の利害対立を指摘している。Microsoft の収益基盤はクラウド消費に依存する一方、真に分散した agent client が広がると、算力はクラウドからローカルへ逃げる。Anthropic や Google のように比較的純粋な Agent 戦略を取れる企業と比べると、Microsoft は社内構造上の摩擦が大きいという見方だ。
