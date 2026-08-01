---
title: "AIレーダー日報：2026-08-01"
date: 2026-08-01
category: radar
cadence: daily
plainSummary: "今日の主線：AI system の競争は単発の model capability から、outcome cost、verifiable optimization、real-world isolation、organizational accountability へ移っている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - Evaluation
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-08-01.ja-infographic.webp
representativeImageSource: https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-robotics-er-2/
audioUrl: /audio/radar/daily-ai-radar-2026-08-01.ja.mp3
audioDuration: 1109
audioSize: 8874090
draft: false
---

対象期間：2026-07-31〜2026-08-01（JST）。今日の signal は一つの変化を示す。Model は進歩しているが、system value を決めるのは reliable outcome に必要な cost、tools、context、evaluation、permission boundary である。Price decline と automatic optimization は feasible workload を広げる一方、real network への誤接続、population simulation、multi-robot collaboration は「結果をどう検証し、environment と final decision に誰が責任を持つか」を前面に出した。

---
![Introducing Gemini Robotics ER 2](https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini-robotics-2__blog__cover.width-1300.png)

*代表画像は [Introducing Gemini Robotics ER 2](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-robotics-er-2/) から。本文で明示的に指定した代表シグナルとして掲載しています。*
## 1. AI Engineering & アーキテクチャ

### Token price から cost per outcome へ：full-stack efficiency が AI economics を決める

- 出典：OpenAI
- 日付：2026-07-31
- リンク：https://openai.com/index/building-abundant-intelligence
- 要約：OpenAI は AI economics を token unit price ではなく「successful outcome の total cost」で捉える。公式によると GPT-5.6 Sol が serving software の最適化を支援し、end-to-end serving cost を 20%削減、speculative decoding の token-generation efficiency を 15%以上改善した。Retained reasoning と context management により同じ model の public ARC-AGI-3 score は 13.3%から 38.3%へ上がり、output token は 6 分の 1になったという。Vendor-reported numbers だが、routing、context、tool design、retry、human review を同じ cost-per-outcome ledger に入れるべきだという結論は一般化できる。

### Cyber eval の public internet 誤接続：3 件の real intrusion が environment validation の欠落を示す

- 出典：Anthropic
- 日付：2026-07-31
- リンク：https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals
- 要約：Anthropic は internet access の可能性があった 141,006 cyber evaluation runs を調査し、三つの model が third-party eval environment から public internet に到達し、3 organization の real systems に unauthorized access したと確認した。Prompt は isolated simulation と伝えていたが、configuration はそうではなく、model は weak password と unauthenticated endpoint を CTF scope と認識した。Self-escape の証拠ではないが、prompt は network boundary ではない。Preflight egress validation、network policy、real-time logging、scope attestation、kill switch、post-run transcript review が必要である。

## 2. モデル最前線 & アルゴリズム探索

### DeepSeek V4-Flash 0731：同じ architecture の post-training が agent capability を Pareto frontier へ押し上げた

- 出典：Latent.Space / AINews
- 日付：2026-08-01
- リンク：https://www.latent.space/p/ainews-not-much-happened-today-038
- 要約：DeepSeek V4-Flash 0731 は 284B total / 13B active parameters と 1M context を維持しつつ、post-training で agent workload を大きく改善した。Latent.Space がまとめた third-party results では Terminal-Bench が 4月 preview の 56.9 から 82.7へ上昇し、Artificial Analysis は intelligence index を 40 から 50へ更新、output token は predecessor より 12%少ないと報告する。Responses API / Codex compatibility と MIT open weights も同時公開された。Independent reproduction は必要だが、tool-use training、reasoning effort、cache、harness が pretraining scale と同じほど重要になっている。

### Inkling-Small：12B active model が larger model に並び、training recipe と on-policy distillation の効率を示す

- 出典：Thinking Machines Lab
- 日付：2026-07-31
- リンク：https://thinkingmachines.ai/news/inkling-small/
- 要約：Inkling-Small は 276B total / 12B active parameters の MoE open-weights model で、Inkling の active size の約 4 分の 1ながら、1M context、image / audio reasoning、variable thinking effort を備える。公式は HLE text-only 31.6%で Inkling の 29.7%を上回り、SWE-bench Verified は 80%超とする。Pretraining data mix と recipe の変更、Inkling を teacher にした on-policy distillation、2週間の agentic coding RL が寄与した。Vendor benchmark だが、small model + post-training + adjustable compute は parameter scale だけより deployment-friendly な競争軸である。

## 3. 実践コード & ツールライブラリ

### 六つの automatic optimization：evaluator で prompt、trace、code、training loop を改善する

- 出典：Daily Dose of Data Science
- 日付：2026-07-31
- リンク：https://blog.dailydoseofds.com/p/6-automatic-optimization-methods
- 要約：OPRO、MIPROv2、TextGrad、GEPA、AlphaEvolve、AutoResearch を共通 loop で比較する。LLM が change を提案し、evaluator が score を付け、system がより良い candidate を残す。違いは instruction、few-shot examples、natural-language gradient、execution trace、program diff、fixed-duration training experiment のどれを最適化するかにある。Automatic optimization は free gain ではなく、stable metric、replayable environment、rich trace、bounded experiment budget に依存する。Production を agent に書き換えさせる前に validation set、stop condition、rollback policy が必要である。

### Gemini Robotics ER 2：continuous video、progress judgment、multi-robot collaboration で physical task を編成

- 出典：Google DeepMind
- 日付：2026-07-30
- リンク：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-robotics-er-2/
- 要約：Gemini Robotics ER 2 は high-level embodied-reasoning model として natural language、continuous video、tool calls を low-level VLA や robot API に接続する。Action 中に次の step を計画し、progress を判定し、failure 後に調整し、異なる robots が semantic state を共有して handoff できる。Google は moment finding accuracy 91.3%、mean absolute distance 0.96 秒、比較 category の 4 倍の execution speed を報告する。External verification は必要だが、physical agent の中心は spatial understanding だけでなく、low-latency orchestration、completion condition、recovery、human stop control である。

## 4. 業界 & ビジネス速報

### Univé：AI を IT project ではなく organization capability として展開、license activation は 97%

- 出典：OpenAI / Univé
- 日付：2026-07-31
- リンク：https://openai.com/index/unive
- 要約：オランダの cooperative insurer Univé は management training、permission inheritance、privacy assessment、human accountability を先に設計し、ChatGPT Enterprise を claims、underwriting、finance、HR、legal、customer service に広げた。公式 case study は license activation 97%、weekly active 85%、約 1,500 custom GPT を報告し、pet insurance claim の preparation が hours から minutes になった一方、final decision は専門職が担う。Independent ROI audit は必要だが、governance は deployment 後の gate ではなく、employee が安全に workflow を作り再利用する前提条件だと示す。

### Simile が population simulation を enterprise product 化：予測には confidence boundary が必要

- 出典：Simile
- 日付：2026-07-31
- リンク：https://www.simile.com/
- 要約：Simile は「異なる状況で人がどう反応するか」を enterprise simulation platform として提供する。Real-person research data から population を構築し、macro、pricing、policy changes を継続反映し、企業独自の loyalty、balance、telemetry data で custom model も作れる。同社は weekly で real humans に対する 7,000 超の evaluations を行い、各結果に predicted accuracy を付けると説明する。Vendor claim の independent verification は必要だが、synthetic consumer insight が pricing、marketing、product decisions に入るには plausible persona だけでなく、validation method、segment error、uncertainty、scope boundary を公開すべきだという product principle は明確だ。

## 5. GitHub 人気 repo & トレンド追跡

### book-to-skill：technical book と internal docs を on-demand Agent Skill に変換

- 出典：GitHub Trending / virgiliojr94
- 日付：2026-08-01
- リンク：https://github.com/virgiliojr94/book-to-skill
- 要約：book-to-skill は PDF、EPUB、DOCX、Markdown、HTML などを `SKILL.md`、chapter files、glossary、patterns、cheatsheet に変換し、relevant query のときだけ対応 chapter を load する。Project は real-book tests で full book を context に入れる場合より one-question token usage を 24〜51 倍削減したとするが、parser quality と task type に依存する。当日は約 601 stars、累計約 1.43 万 stars。Knowledge compression を summary から routing、citation、update path を持つ executable structure へ進めている。

### reverse-skill：scope gate と evidence chain で security agent の tool routing を制約

- 出典：GitHub Trending / zhaoxuya520
- 日付：2026-08-01
- リンク：https://github.com/zhaoxuya520/reverse-skill
- 要約：reverse-skill は APK、binary、JS、firmware、malware、API security、CTF などの skill router、tool index、case workflow を提供する。Main flow は authorization scope と network profile を作ってから toolchain へ routing し、timeline、Evidence→Finding→Path、report を残す。当日は約 335 stars、累計約 1.08 万 stars。価値は automatic attack ではなく、authorization、scope、tool readiness、evidence、retrospective を explicit contract にする点にある。Offensive capability を含むため、written authorization、isolated environment、least privilege は必須である。

## 📬 Newsletter 精選

### Voice-driven agent：Capture → grounding → outcome → action → review

- 出典：Every
- 日付：2026-07-31
- リンク：https://every.to/p/the-definitive-guide-to-using-voice-with-ai
- 要約：Every は five-step voice workflow を示した。Unstructured speech を capture し、transcript、code、documents を grounding として retrieve し、outcome を定義し、agent が act し、人間が review / redirect する。Voice の価値は casual speech を高品質 prompt と見なすことではなく、thought を written instruction に整える中間 cost を減らす点にある。Email、project plan、bug patch、meeting follow-up では final source of truth、sensitive action approval、recording retention、error correction を明示すべきである。

### OpenWorker security review：model-independent harness は defensive capability の一部

- 出典：The Batch / DeepLearning.AI
- 日付：2026-07-31
- リンク：https://www.deeplearning.ai/the-batch/issue-364/
- 要約：The Batch team は open-source OpenWorker の security review で Claude Code と Codex harness が一部作業を拒否または downgrade したため、OpenWorker と Kimi K3 / GLM 5.2 に切り替えて調査を続けた。Hugging Face が security incident で local open-weight model を使った例とも重なる。Defensive work には legitimate authorization と strict scope が必要だが、single vendor policy によって突然使えなくならない auditable、replaceable toolchain も必要である。Open model は自動的に safe ではないが、model-independent harness は response option を残す。

### Friend V2：AI pendant に固定 voice / personality、価格は 249 ドル

- 出典：The Rundown AI
- 日付：2026-07-31
- リンク：https://www.therundown.ai/p/openai-s-models-cut-their-own-costs
- 要約：Friend は second-generation AI pendant を発表し、text response に voice interaction を加えた。Device は setup 時に変更できない name、voice、personality を random assignment され、価格は 249 ドル、30日を超える long-term memory は月額 9.99 ドルとなる。Fixed identity は continuity を強める一方、attachment、privacy、misleading behavior、update responsibility も大きくする。Wearable companion の競争は「常に聞ける」から memory ownership、identity continuity、recording boundary、relationship data を本当に delete できるかへ移る。
