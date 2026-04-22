---
title: "AI Radar Daily: 2026-04-14"
date: 2026-04-14
category: radar
cadence: daily
tags:
  - Agent
  - Harness Engineering
  - OpenClaw
  - Claude
lang: ja
draft: false
---
## 対象範囲

- スキャン期間: 2026-04-11〜2026-04-14（72 時間）
- 参照ソース: Latent Space · ByteByteGo · Daily Dose of DS · Ahead of AI · Hugging Face Blog · The Rundown AI · 老范讲故事
- 取得方法: Claude in Chrome で RSS と記事本文を直接解析

---
![Anthropic Mythos / Glasswing 相关视觉图](https://substackcdn.com/image/fetch/$s_!OlKB!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6e44dee4-d07c-4497-993b-8cca142a9e28_1210x1316.png)

*代表画像は [Anthropic @ $30B ARR, Project GlassWing and Claude Mythos Preview](https://www.latent.space/p/ainews-anthropic-30b-arr-project) から引用。プロダクト公開、最先端能力、プラットフォーム競争が一つの窓に押し込まれている感覚を、この画像がいちばんよく出していた。*

## 1. 🛠️ AI Engineering & アーキテクチャ

### Anthropic が Claude Managed Agents ベータを公開、Agent-as-a-Service が本格化
**出典：** Latent Space AINews / The Rundown AI  
**リンク：** https://www.latent.space/p/ainews-anthropic-30b-arr-project

Anthropic は 4 月 8 日、Claude Managed Agents のパブリックベータを公開した。sandbox 実行、認証情報管理、checkpoint、実行トレースを備え、数時間に及ぶ stateful session を扱える。課金は通常 token 料金に加え、$0.08 / session-hour。先行利用者として Notion が並列 custom agent を回し、Rakuten が Slack / Teams 横断の業務 agent を試している。Latent Space は同日に Anthropic の ARR が $30B に到達したこと、さらに **Project GlassWing** と **Claude Mythos Preview** を予告したことも伝えており、「agent 基盤を自前構築する」段階から「托管サービスとして使う」段階へ入ったと読める。

### Extreme Harness Engineering: OpenAI の Dark Factory が初めて公に語られる
**出典：** Latent Space Podcast  
**リンク：** https://www.latent.space/p/harness-eng

4 月 7 日公開の Ryan Lopopolo との対話では、OpenAI 内部の **Symphony** が 100 万行超のコードベースを運用し、**0% 人間が書き、0% 人間が merge 前 review を行わない** 形で回っていることが明かされた。毎日 10 億 token 超を消費し、multi-agent orchestration、observability、eval loop をまとめて harness 層に封じ込める。もはや chain 抽象ではなく harness が一次抽象になっていることを示す、かなり極端な実例だ。

### 老范実測: Hermes Agent vs OpenClaw
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/12/hermes-agent-vs-openclaw-lightweight-self-evolving-ai-comparison/

Hermes Agent と OpenClaw を詳細に比較した記事。Hermes の売りは、(1) SQLite + Markdown による軽量記憶、(2) 会話から自動で skill を生成する層、(3) 会話を微調整データへ変換する層、という **3 層の自己進化構造** にある。OpenClaw より軽量で NAS / VPS に載せやすい一方、Web UI や全チャネル統合では見劣りし、文脈容量もおよそ 1300 token 程度で弱い。個人助手型、code agent 型、多 agent 研究型、企業托管型という harness agent の分類も整理されている。

### Components of A Coding Agent
**出典：** Ahead of AI  
**リンク：** https://magazine.sebastianraschka.com/p/components-of-a-coding-agent

coding agent を構成する 6 つの要素、つまり tool use、context management、memory、control loop、state update、termination condition を整理した記事。「近年の LLM システムの進歩は、より良いモデルだけでなく、モデル外側のシステム工学から来ている」という主張が芯になっており、Latent Space の Harness Engineering や Hermes/OpenClaw 比較ときれいに三角関係を成している。

### ByteByteGo: LinkedIn Feed が 13 億ユーザー向けに LLM を使う方法
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/how-linkedin-feed-uses-llms-to-serve

LinkedIn が feed 再構築のなかで LLM を推薦パイプラインへどう差し込んだかを分解した実例。超大規模オンライン推論の設計、低遅延化、障害時の設計など、LLM を本番推薦システムに入れるときの難しさがよく分かる。

## 2. 🧠 モデル動向 & アルゴリズム

### Meta Muse Spark: Meta Superintelligence Labs 初のモデル、しかも閉源
**出典：** Latent Space AINews / The Rundown AI  
**リンク：** https://www.latent.space/p/ainews-meta-superintelligence-labs

Meta Superintelligence Labs は 4 月 8 日、ネイティブなマルチモーダル推論モデル **Muse Spark** を公開した。tool use、vision chain-of-thought、multi-agent 協調を備える一方で、**Meta 初の本格的な閉源モデル** とされ、アーキテクチャやコードは非公開。WhatsApp、Instagram、Facebook、Messenger、AI グラスへ広げる構想が示されており、従来の開源路線からの戦略転換が鮮明だ。

### Claude Mythos Preview: 「GPT-2 以来、強すぎてそのまま出せないモデル」
**出典：** Latent Space AINews / 老范讲故事  
**リンク：** https://www.latent.space/p/ainews-anthropic-30b-arr-project  
**補足リンク：** https://lukefan.com/2026/04/10/anthropic-claude-mythos-preview-cybersecurity-strategic-release/

Anthropic は 4 月 8 日前後に Claude Mythos の存在を明かした。Latent Space はこれを「自 GPT-2 以来、強すぎて直接公開できない初のモデル」と表現し、老范も別記事で、そのサイバーセキュリティ能力と戦略的な公開制御を掘り下げている。Anthropic CEO がすでに「高性能 compute を中国へ売るのは核拡散に近い」と語っていた文脈もあり、Claude Mythos は軍民両用性の高い frontier model の代表例になっている。

### Diffusion LLMs 完全解析
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms

自己回帰生成が A100 上で 1 FLOP / byte 程度の memory-bound に縛られるのに対し、masked diffusion は並列 unmasking により compute-bound に寄せられる、という第一原理から Diffusion LLM を解説する記事。LLaDA 8B、Dream 7B、Block Diffusion など具体例も多く、保存価値の高い技術資料になっている。

### Build Agents That Never Forget: Cognee で Agent 記憶を作る
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/build-agents-that-never-forget-98a

Agent 記憶が、単純な list から Markdown、vector search、knowledge graph へどう進化してきたかを整理しつつ、Cognee を推している。OpenClaw の Markdown checkpoint 記憶が長期利用で事実喪失を起こしやすい点など、実装寄りの比較も含まれており、老范の Hermes / OpenClaw 記憶比較と相補的だ。

## 3. 💻 実装コード & ツール

### llama.cpp で OCR モデルを回す
**出典：** Hugging Face Blog  
**リンク：** https://huggingface.co/blog/ggml-org/using-ocr-models-with-llama-cpp

llama.cpp を使って OCR モデルを CPU やエッジ環境へ持ち込む方法を示した記事。文書認識をローカルで回し、軽量マルチモーダル推論と組み合わせたい場面にかなり実用的だ。

### Codex + オープン OCR で 3 万本の論文を処理
**出典：** Hugging Face Blog  
**リンク：** https://huggingface.co/blog/nielsr/ocr-papers-jobs

Codex agent とオープン OCR を組み合わせ、大量論文を pipeline 化した実例。人手では重たい文書処理を、agent + OCR + batch 実行で回すやり方として参考になる。

### BidirLM: 生成系 LLM を最良のオープン全モーダル encoder に変える
**出典：** Hugging Face Blog  
**リンク：** https://huggingface.co/blog/Nicolas-BZRD/bidirlm-release

単方向の生成型 LLM を双方向 encoder として再利用し、embedding タスクで SOTA を狙う方法論。生成能力を残したまま encoder 化するというのがポイントだ。

### ByteByteGo EP210: Monolithic vs Microservices vs Serverless
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/ep210-monolithic-vs-microservices

AI 専題ではないが、agent システムのデプロイ構造を考えるうえで十分に役立つ比較記事。単体、マイクロサービス、Serverless の選択をどう切るかを、かなり整理している。

## 4. 📰 業界 & ビジネス

### 中国 AI 末日論と米国追随の現実
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/13/china-ai-doomism-us-gap-chip-talent-catchup/

「中国 AI 末日論」が何を意味するのかを三層で分解し、チップ、人材、社会受容度の差を整理した記事。数字を伴っており、悲観と楽観のどちらにも寄りすぎていない。

### XChat は「米国版 WeChat」になれるか
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/14/xchat-american-wechat-dm-to-im-social-network-effects/

X が 4 月 17 日に独立メッセージアプリ XChat を出すという話を軸に、スーパーアプリ化の難しさを見ている。エンドツーエンド暗号化や Grok 統合など、単なる DM 改良では終わらない野心がある。

### Anti-AI 情緒の高まり: Sam Altman 自宅前での抗議
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/anti-ai-anger-hits-sam-altman-front-door

反 AI 抗議が Sam Altman の自宅前にまで及んだというニュース。老范の「中国は楽観的、米国は恐怖が強い」という整理と対照的に読むと面白い。

### Perplexity の agent pivot
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money

Perplexity が検索から agent platform へ重心を移している流れを肯定的に読んだ記事。「モデルから Agent へ、検索から実行へ」という 2026 年の主旋律を改めて裏づけている。

### AI Engineer Europe 2026 回顧
**出典：** Latent Space AINews  
**リンク：** https://www.latent.space/p/ainews-ai-engineer-europe-2026

ロンドン開催の初回 AI Engineer Europe では、agent 工学、評価、企業導入が中心テーマになっていた。研究会議というより、AI エンジニアという職能が独立したことを示す場になっている。
