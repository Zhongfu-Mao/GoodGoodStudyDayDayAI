---
title: "AI レーダー日報：2026-06-22"
date: 2026-06-22
category: radar
cadence: daily
plainSummary: "今日の主線は、agent engineering が single model call から sustainable runtime system へ進んでいることです。Every は model volatility、product loops、workflow automation を同じ流れで捉え、DeerFlow、ruflo、Cognee、Hermes Agent は long-horizon tasks、multi-agent harnesses、memory layer、self-improving agents が infrastructure になりつつあることを示します。slime は post-training RL を composable pipeline に広げ、OpenAI と Samsung の enterprise deployment、老范讲故事による DeepMind talent flow analysis、GitHub 上の Orca と Hunk は agent adoption が enterprises、organizations、developer tools の各層で同時に進んでいることを示しています。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-06-22.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-06-22.ja.mp3
audioDuration: 1021
audioSize: 8169829
draft: false
---

## 対象範囲

- 対象期間：2026-06-21 から 2026-06-22 まで。
- 今日は model supply-chain volatility、long-horizon agent harnesses、multi-agent orchestration、post-training RL、self-improving agents、enterprise Codex deployment、DeepMind talent movement、GitHub 上の multi-agent development environment and diff review tools を中心に整理します。

## 1. AI Engineering & アーキテクチャ

### Every：model capability の「ground」はまだ動き続け、agent systems には resilient workflows が必要になる

- 出典：Every
- 日付：2026-06-21
- リンク：https://every.to/context-window/built-on-moving-ground
- 要約：Every は今回、いくつかの signal を一つの流れとして扱いました。Developers が依存する model は突然終了したり挙動を変えたりし得る一方、frontier model の制約は後続アップデートで一気に変わることがあります。Agent workflows も one-off call から multi-round loops へ移りつつあります。Engineering teams にとって、capability planning は特定の model version だけを前提にできません。Fallback、replaceable providers、state recovery、evaluation replay、human takeover を system capability として設計する必要があります。

### DeerFlow 2.0：long-horizon super agent harness が sub-agent、memory、sandbox、channel を統合する

- 出典：project / DeerFlow
- 日付：2026-06-22
- リンク：https://github.com/bytedance/deer-flow
- 要約：ByteDance の DeerFlow 2.0 は、research、coding、creation などの long-horizon tasks を sub-agents、memory、sandbox、tools、skills、message gateway に分解します。README は Claude Code、Codex、Cursor、Windsurf などの development entry points を支え、GPT-5 Responses API、vLLM Qwen、Codex CLI、Claude Code OAuth provider に接続できると説明します。価値は「agent が一回タスクを終える」ことではなく、「agent が configurable runtime の中で数十分から数時間動く」ことです。Compute sizing、sandbox permissions、MCP、trace、context engineering、long-term memory が architecture boundary に入ってきます。

### ruflo：multi-agent harness は CLI agents、memory、MCP、team boundaries を一つの runtime layer にする

- 出典：project / ruflo
- 日付：2026-06-22
- リンク：https://github.com/ruvnet/ruflo
- 要約：ruflo は Claude Code、Codex などの CLI agents 向け multi-agent harness です。README は swarms、self-learning memory、federated communication、enterprise security、MCP server、hooks、daemon、多数の agents、commands、skills、plugins を強調します。意味があるのは、「one agent helps me edit code」から「multiple specialized agents coordinate across teams, machines, and trust boundaries」へ進む点です。Agent の数が増えるほど難しいのは model call wrapper ではなく、communication、permissions、memory、monitoring、organizational boundaries です。

## 2. モデル最前線 & アルゴリズム探索

### slime：post-training RL は Megatron、SGLang、rollout data flow の組み合わせ工程になる

- 出典：project / slime
- 日付：2026-06-22
- リンク：https://github.com/THUDM/slime
- 要約：THUDM の slime は LLM post-training 向けの RL scaling framework です。Megatron training、SGLang rollout、reward / verifier / environment interaction、Data Buffer を composable pipeline としてつなぎ、custom generation interface によって complex data generation を支えます。README は GLM 系列だけでなく Qwen、DeepSeek、Llama などにも対応すると説明します。これは model post-training が system engineering になっていることを示します。Training framework、inference engine、async rollout、agentic RL、verifier、data scheduling を一緒に設計する必要があります。

### Hermes Agent：self-improving agent は skill、memory、multi-channel runtime を closed loop にする

- 出典：project / Hermes Agent
- 日付：2026-06-22
- リンク：https://github.com/NousResearch/hermes-agent
- 要約：Nous Research の Hermes Agent は self-improving AI agent を掲げています。経験から skills を作り、利用中に改善し、自分に knowledge persistence を促し、session をまたいで past conversations and user model を検索します。Telegram、Discord、Slack、WhatsApp、CLI などの入口を持ち、local、Docker、SSH、Singularity、Modal、Daytona などの terminal backends で動きます。この方向は重要です。Self-improvement は model training だけでなく、agent runtime の memory、skill versioning、cron、delegation、trajectory compression に広がっています。

## 3. 実践コード & ツールライブラリ

### Cognee：agent memory layer は vector retrieval から knowledge graph and traceable API へ広がる

- 出典：project / Cognee
- 日付：2026-06-22
- リンク：https://github.com/topoteretes/cognee
- 要約：Cognee は open-source AI memory platform として、`remember`、`recall`、`forget`、`improve` などの API を提供し、vector embeddings、knowledge graph、ontology、session memory、traceability を組み合わせます。README は Claude Code hooks も示し、SessionStart、PostToolUse、UserPromptSubmit、PreCompact、SessionEnd などの events を memory layer に同期できます。Enterprise agents にとって、memory は chat history ではなく、audit、cleanup、cross-agent sharing が可能な knowledge infrastructure です。

### Cora：AI email tool は Gmail overlay から full inbox replacement へ向かう

- 出典：Every
- 日付：2026-06-21
- リンク：公開版リンクなし
- 要約：Every Studio は Cora の次の段階を紹介しました。Cora は Gmail の上に重なる AI layer だけではなく、standalone email app になり、iPhone app も出す予定です。この変化は「another email summarizer」以上の意味があります。Email は high-permission、high-noise、high-context work entry です。AI email product が inbox を置き換えるには、sync、search、mobile notifications、privacy、user preferences、undoable actions を扱う必要があります。

### Monologue：voice-to-action workflow が Apple Shortcuts に接続する

- 出典：Every
- 日付：2026-06-21
- リンク：公開版リンクなし
- 要約：Every Studio は Monologue も更新しました。Action Button、Siri、widget、Home Screen から起動でき、Apple Shortcuts と連携して voice input を Notion、email draft、その他の automation に routing できます。この signal は実用的です。Voice AI が transcription に留まるなら daily productivity に入りにくいですが、Shortcuts のような system automation layer に接続すると、idea capture、structured text、task conversion、tool routing まで担えます。

## 4. 業界 & ビジネス速報

### OpenAI：Samsung が ChatGPT Enterprise と Codex を global employee workflow に展開する

- 出典：OpenAI
- 日付：2026-06-21
- リンク：https://openai.com/index/samsung-electronics-chatgpt-codex-deployment
- 要約：OpenAI は、Samsung Electronics が Korea の全従業員と global Device eXperience 部門に ChatGPT Enterprise and Codex を提供すると発表しました。これは OpenAI の largest enterprise AI rollouts の一つで、R&D、manufacturing、marketing、product development、corporate functions を対象にします。記事は Codex が code writing、review、debug だけでなく、non-technical teams が ideas を internal tools、websites、workflows に変える用途にも使われると説明します。Enterprise adoption は chat assistant から software production and business process への埋め込みへ進んでいます。

### 老范讲故事：DeepMind talent movement は Google AI organization の長期的な tension を映す

- 出典：老范讲故事
- 日付：2026-06-22
- リンク：https://lukefan.com/2026/06/22/google-deepmind-ai-talent-exodus-openai-anthropic/
- 要約：老范讲故事 は、Noam Shazeer が OpenAI へ、John Jumper が Anthropic へ移った後の Google DeepMind の組織問題を分析しました。記事は、Google が top AI talent を育て続けられる一方、research organization、product route、internal resource competition、incentive structure が retention に影響すると述べます。Gemini、DeepMind、AlphaFold、Antigravity の間にも route and resource tension があります。AI competition は model parameters and GPUs だけでなく、organization design、product entry、research freedom、commercial pressure、talent contract structure にも左右されます。

## 5. GitHub 人気 repo & トレンド追跡

### Orca：multi-agent development environment が Codex、Claude Code、OpenCode を parallel worktrees に置く

- 出典：GitHub Trending
- 日付：2026-06-22
- リンク：https://github.com/stablyai/orca
- 要約：Orca は open-source AI orchestrator / ADE で、Codex、Claude Code、OpenCode、Pi などの agents をそれぞれ isolated worktree に置いて並行実行できます。README は mobile companion、terminal splits、real Chromium window in design mode、GitHub / Linear integration、SSH worktrees、AI diff annotation、files and images in prompts、account switcher、usage tracking を示します。Coding agent toolchain の重心は、単に terminals を複数開くことではなく、worktree isolation、diff review、cost tracking、cross-device control に移っています。

### Hunk：agent changeset 向け terminal diff review が独立した tool layer になる

- 出典：GitHub Trending
- 日付：2026-06-22
- リンク：https://github.com/modem-dev/hunk
- 要約：Hunk は review-first terminal diff viewer で、agent-generated changesets を対象にしています。OpenTUI と Pierre diffs を基盤に、multi-file review stream、sidebar、inline AI / agent annotations、split / stack layout、watch mode、keyboard / mouse / pager operations を支え、Git、Jujutsu、Sapling、raw files、patches に対応します。Agent が書くコードの比率が上がるほど、review tools は “read git diff” から “understand why the agent changed this, what context it used, and whether to re-prompt or split commits” へ進みます。

## 📬 Newsletter 精選

### Every：Cora と Monologue は AI productivity を full inbox と system shortcuts へ押し出す

- 出典：Every
- 日付：2026-06-21
- リンク：公開版リンクなし
- 要約：Every の今回の号は model volatility だけでなく、Every Studio の二つの product directions も示しました。Cora は standalone email app へ向かい、Monologue は Apple Shortcuts と接続します。共通する trend は、AI productivity products が browser chatbox から inbox、mobile notifications、system shortcuts、automation routing という real work entry points へ移っていることです。

### Latent.Space：AI Engineer community activity は infra、agents、developer platforms を同じ場に集める

- 出典：Latent.Space / AINews
- 日付：2026-06-21
- リンク：https://www.latent.space/
- 要約：Latent.Space / AINews は今回も AI Engineer community activity を軸に、agent infra、developer platforms、model application engineering、startup ecosystem を扱っています。日報にとっての価値は single release ではなく、AI engineering community の関心が prompt tricks から runnable systems に移り続けていることです。Evaluation、runtime、toolchains、cost、permissions、delivery paths が中心テーマになっています。

### Every：Codex power-user content は agent usage を reusable workflow に戻す

- 出典：Every
- 日付：2026-06-21
- リンク：公開版リンクなし
- 要約：Every は今回、Codex power users 向けの practical content も予告しました。中心は coding agent を single Q&A ではなく reusable workflow にすることです。この方向は今日の engineering theme と一致します。High-quality agent use は stronger model だけではなく、task decomposition、context preparation、review、testing、rollback、experience capture を stable habits にすることから生まれます。
