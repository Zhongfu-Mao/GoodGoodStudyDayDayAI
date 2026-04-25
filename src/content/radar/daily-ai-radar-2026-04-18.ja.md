---
title: "AI Radar Daily: 2026-04-18"
date: 2026-04-18
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

- 対象期間：2026-04-15 〜 2026-04-18（72 時間）


---
![Claude Opus 4.7 関連ビジュアル](https://substackcdn.com/image/fetch/$s_!iEJA!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7242e5f5-6105-4489-bc8b-143002fe7da6_1344x756.png)

*代表画像は [Anthropic Claude Opus 4.7](https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally) から選定。この日の最も強い model signal は、frontier model がより高速かつ粒度細かく更新される段階に入ったことだった。*

### 1. 🛠️ AI Engineering & アーキテクチャ

**[Evolution of Agent Landscape From 2022-26](https://blog.dailydoseofds.com/p/evolution-of-agent-landscape-from)**  
**出典：** Daily Dose of Data Science｜2026-04-16

Agent engineering の進化は、**Weights（2022）→ Context（2023-24）→ Harness Engineering（2025-26）** の三段階に整理できる。現在の中心課題は、もはや「model に何を伝えるか」ではなく、「model をどんな runtime 上で動かすか」だ。persistent memory、再利用可能な skills、MCP / A2A protocol、execution sandbox、approval gate、observability を含めて、model は知能の唯一の担い手ではなく、より大きな system の一部になりつつある。あわせて紹介された論文 *Externalization in LLM Agents: A Unified Review of Memory, Skills, Protocols and Harness Engineering* は、この枠組みを体系化するための重要文献だ。

**[[AINews] RIP Pull Requests (2005-2026)](https://www.latent.space/p/ainews-rip-pull-requests-2005-2026)**  
**出典：** Latent Space｜2026-04-16

GitHub が初めて OSS repository で PR 機能自体を無効化できるようにしたことを、Latent Space は AI-native software collaboration の象徴的変化として扱っている。記事中では次の動きが並んだ。
- **OpenAI Agents SDK** が harness 層を OSS 化し、Cloudflare、Modal、E2B、Vercel、Daytona など第三者 sandbox を execution 側に接続可能にした
- **Cloudflare Project Think** は persistent execution、sub-agent、sandboxed code run、workspace filesystem、runtime tool creation を内蔵
- **Hermes Agent** は「自動 skill 化」が特徴で、一度完了した workflow を再利用可能な skill に自動昇格させる
- AI-assisted mathematics では、GPT-5.4 Pro が Erdős problem #1196 に対して専門家が認める証明を生成したとされる

全体として、software engineering は「human writes → human reviews」から、「agent writes → harness gates → human reviews intent only」へ傾いている。

**[72 Techniques to Optimize LLMs in Production](https://blog.dailydoseofds.com/p/72-techniques-to-optimize-llms-in)**  
**出典：** Daily Dose of Data Science｜2026-04-17

production LLM serving における 72 の optimization を 9 層に整理した総覧記事。最適化 stack をフルに積んだ system と naive FP16 deploy では、**5〜8 倍**のコスト差が出るという。

1. **モデル圧縮**：INT8 / INT4 / FP8、GPTQ、AWQ、SmoothQuant、Multi-LoRA  
2. **Attention 改良**：FlashAttention、PagedAttention、MLA  
3. **解読最適化**：Speculative Decoding、Medusa、EAGLE、Lookahead  
4. **KV Cache**：Prefix Caching、SnapKV、Attention Sink  
5. **Batching / Scheduling**：Continuous Batching、Prefill-Decode 分離  
6. **並列化と Kernel**：Tensor / Pipeline / Expert 並列、CUDA Graph、Torch compile  
7. **アプリ層 Cache**：Semantic Caching、Embedding Deflection  
8. **I/O 圧縮**：LLMLingua、RAG による long context 代替  
9. **Routing / コスト制御**：Model Cascading、QoS 分級、task 専用 fine-tune

特に **Blockify** は文書を平均 98 token の IdeaBlock に分解し、同一 embedding の条件下で精度を 13.55% 向上、token 使用量を 3.09 倍削減した。

### 2. 🧠 モデル動向 & アルゴリズム

**[[AINews] Anthropic Claude Opus 4.7 — literally one step better than 4.6 in every dimension](https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally)**  
**出典：** Latent Space｜2026-04-17

Claude Opus 4.7 は、4.6 をほぼ全方位で更新した。
- 新 tokenizer により入力 token 数は最大 1.35 倍になるが、推論効率改善で全体 token 消費は**最大 50% 減**
- 新推論レベル **xhigh** を追加し、Claude Code でもデフォルト採用
- 画像入力は長辺 2576px（約 3.75MP）に対応し、従来の 3 倍近い高解像度 screenshot を扱える

主要 benchmark は以下の通り：

| 指標 | 4.6 | 4.7 | 変化 |
|------|-----|-----|------|
| SWE-bench Pro | ~53% | 64.3% | +11pt |
| SWE-bench Verified | ~80.6% | 87.6% | +7pt |
| TerminalBench 2.0 | ~65% | 69.4% | +4pt |
| ARC-AGI-1 | — | 92% | — |
| ARC-AGI-2 | — | 75.83% | — |
| Cursor 内部 benchmark | 58% | 70% | +12pt |

長文脈 MRCR の低下という争点はあるが、Anthropic は Graphwalks 38.7% → 58.6% の改善を根拠に、MRCR は実運用の reasoning を正しく測らないと反論している。

**[Google solved an Old RNN Problem](https://blog.dailydoseofds.com/p/google-solved-an-old-rnn-problem)**  
**出典：** Daily Dose of Data Science｜2026-04-15

Google Research は **Memory Caching** という仕組みを提案し、RNN の長系列記憶の弱点に真正面から取り組んだ。系列を複数セグメントに分け、各セグメント末尾の state を checkpoint として保存し、生成時は現在 state だけでなく全 checkpoint を参照可能にする。

計算量は次のように整理される。
- Standard RNN：O(L)
- Transformer：O(L²)
- **Memory Caching**：O(NL)（N は checkpoint セグメント数）

なかでも **Gated Residual Memory（GRM）** が最も良く、token ごとにどの checkpoint を参照すべきかを動的に重み付けする。実験規模は 1.3B パラメータ以内だが、長系列 memory の別解として重要だ。

**Nucleus-Image：最初の sparse MoE diffusion model**  
**出典：** Latent Space AINews 引用

Nucleus-Image は 17B パラメータ、2B active の sparse MoE text-to-image diffusion model で、Apache 2.0 で開放された。重み、学習コード、data recipe まで出ており、day-0 で diffusers 対応している。

**NVIDIA Nemotron 3 Super**  
**出典：** Latent Space AINews 引用

120B の hybrid Mamba-Attention MoE、12B active、1M context、25T token 学習。throughput は GPT-OSS-120B 比で 2.2 倍、Qwen3.5-122B 比で 7.5 倍という主張で、長文脈時代に memory bandwidth が一等課題であることを改めて示した。

**Parcae：layer-looping Transformer**  
**出典：** Latent Space AINews 引用

安定化した layer-looping Transformer の提案。固定パラメータ予算のもとで、looped block が実質 2 倍規模の model に近い品質を回復できるとされ、parameter scaling 以外の質向上軸を開いた。

### Persona Generators：より実在感のある合成人物像を進化探索で作る
**出典：** The Batch @ DeepLearning.AI  
**リンク：** <https://www.deeplearning.ai/the-batch/persona-generators-simulate-human-characters-across-a-controllable-range-of-points-of-view/>

Google の Persona Generators は、人口統計ラベルを貼るだけでなく、進化探索によって prompt program 自体を最適化し、態度空間をより広く覆う persona 群を作る。synthetic user research が「人設を書く」段階から、「対立や分布を再現する」段階へ進んでいることを示す。

### 3. 💻 実装コード & ツール

**Blockify — RAG の知識単位最適化 library**

- GitHub：記事内参照（"Blockify IdeaBlock" で検索可能）
- 核心機能：文書を Q&A ベースの IdeaBlock（平均 98 token）へ分解
- 効果：同一文書・同一 embedding 条件で精度 +13.55%、token 使用量 -3.09x
- 実行環境：Intel Xeon CPU で動作、GPU 不要

**Sim（Mothership）— self-building Agent**

- GitHub：[sim](https://github.com)（27k+ stars）
- 自然言語の要求から database schema、integration、cron job を自動生成し、独立稼働する Level 4 Agent を構築する
- 「Level 5 Agent の成果物が Level 4 Agent そのものになる」という意味で、かなり自構築システムに近い

**Claude Code workflow の運用知見**  
Anthropic の Cat Wu が Opus 4.7 と協調する際のコア原則をまとめていた。
1. **Micromanage せず委譲する**：Opus 4.7 を pair programmer ではなく、独立して動く engineer とみなす  
2. **目標と制約を前置きする**：小分けに追記するより、最初に目的・制約・完了条件を渡す  
3. **検証方法を教える**：CLAUDE.md や skill に test workflow を書き、自己検証させる

### 4. 📰 業界 & ビジネス

**[Claude KYC 上线：中国开发者影响解析](https://lukefan.com/2026/04/17/anthropic-claude-selective-kyc-china-user-crackdown/)**  
**出典：** 老范讲故事｜2026-04-17

Anthropic が 2026-04-14 に selective KYC を開始し、15 日から一部ユーザーへ本人確認を要求した。老范の見立てでは、これは蒸留防止というより、越境アクセス、共有アカウント、高頻度利用など「高消費ユーザー掃除」に近い。API ユーザーは今回の対象外であり、実際の影響は主に一般ユーザーと代理ルートに出る。

**[微软龙虾要来了？CEO 亲自下场，为什么我却不看好？](https://lukefan.com/2026/04/16/microsoft-openclaw-ai-agent-cloud-client-tradeoffs/)**  
**出典：** 老范讲故事｜2026-04-16

Microsoft OpenClaw に対する批判的分析。Node.js + Unix 権限体系を前提にした設計が Windows client と相性が悪く、cloud + local の中途半端な妥協になること、また企業 software の本質が「誰が権限を持つか」である以上、agent が owner のみを見る設計は組織権限と噛み合いにくいと論じている。

**Gemini 3.1 Flash TTS**  
**出典：** Latent Space AINews 引用

Google の TTS model は Audio Tags による感情制御、inline 非言語 signal、70+ 言語、多話者対応、SynthID watermark まで備える。Artificial Analysis では voice arena #2 に位置付けられた。

### 州レベルの AI 規制が分岐し、合規の複雑さはさらに上がる
**出典：** The Batch @ DeepLearning.AI  
**リンク：** <https://www.deeplearning.ai/the-batch/most-states-are-regulating-ai-despite-president-trumps-opposition-to-state-level-laws/>

米連邦政府がルール統一を望んでも、州政府は独自に AI regulation を加速している。watermark、copyright、audit、regional deployment の要件が州ごとにズレることで、platform と enterprise software にとっての product architecture は今後さらに複雑になる。
