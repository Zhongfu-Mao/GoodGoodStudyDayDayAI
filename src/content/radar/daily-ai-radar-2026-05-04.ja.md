---
title: "AI レーダー日報：2026-05-04"
date: 2026-05-04
category: radar
cadence: daily
plainSummary: "本日の AI レーダーでは、RL と agent 行動設計、AI 評価コスト、Codex 型の知識作業インターフェース、agent-native product management、そして AI compute が定額補助から利用量課金へ移る流れを整理します。"
difficulty: intermediate
tags:
  - Agent
  - Evaluation
  - AI Engineering
  - AI Economics
lang: ja
coverImage: "https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/images/radar/daily-ai-radar-2026-05-04.ja-infographic.webp"
audioUrl: "https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-05-04.ja.mp3"
audioDuration: 1064
audioSize: 8511928
draft: false
---

---
![AI evals are becoming the new compute bottleneck](https://cdn-uploads.huggingface.co/production/uploads/6413251362e6057cbb6259bd/ukJJW86oJu36zOJwqZJBG.png)

*代表画像は [AI evals are becoming the new compute bottleneck](https://huggingface.co/blog/evaleval/eval-costs-bottleneck) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*
## 対象範囲

- 対象期間：2026-05-01 から 2026-05-04 まで。

## カバー画像（アイキャッチ）の解説

今日のカバー画像は「Agent 経済の台帳」として描くのが合います。左側に RL / MDP、value function、reward design を置き、モデルの振る舞いがどう形作られるかを示す。中央には eval pipeline、agent rollout、skills、scripts、知識作業デスクトップを配置し、右側には利用量課金、compute fraud、低価格のオープンモデル、リアルタイム医療データを置くと、AI がより現実的なコストと規制の環境に入っていることが伝わります。

## 1. AI Engineering & アーキテクチャ

### AI 評価は安い付属作業ではなく、新しい compute ボトルネックになっている

- 出典：Hugging Face / EvalEval Coalition
- 日付：2026-04-29（対象期間外だが高信号）
- リンク：https://huggingface.co/blog/evaleval/eval-costs-bottleneck
- 要約：この記事は、静的 benchmark、agent benchmark、training-in-the-loop benchmark のコストを並べ、HAL の agent 評価が 1 回で約 4 万ドル、frontier model の GAIA run が 2829 ドルに達しうることを示している。さらに信頼性を見るには複数回の再実行が必要で、k=8 の HAL 型評価では約 32 万ドル規模になるため、外部監査、学術再現、leaderboard の信頼性そのものが予算制約を受け始めている。

### Codex 型 desktop agent は IDE から知識作業 OS へ広がっている

- 出典：Every
- 日付：2026-05-03
- リンク：https://every.to/context-window/one-app-to-rule-all-knowledge-work
- 要約：Every は、Austin Tedesco が日常業務の約 80% を Codex desktop app で処理している事例を紹介している。メール整理、GTM 計画、KPI 追跡、採用まで含む点が重要で、単に「コードを書く道具」ではなく、project sidebar、file context、plugin connection、企業知識、出力先アプリでの最終レビューを備えた知識作業 OS に近づいている。

### Incremental determinism は Agent コスト管理を skills、evals、scripts に分解する

- 出典：Every
- 日付：2026-05-03
- リンク：https://every.to/also-true-for-humans/you-are-the-most-expensive-model
- 要約：Mike Taylor の incremental determinism は、繰り返し作業を session から skill に固め、eval で品質を確認し、確定的な部分を script、CLI、MCP に落としていく考え方だ。重要なのは「最強モデルを使うか」ではなく、どの部分を frontier model、安価な model、subagent、DSPy 最適化、純粋なコードへ分担するかを設計問題として扱う点にある。

## 2. モデル最前線 & アルゴリズム探索

### MDP と value function は RLHF、GRPO、Agent 行動を理解する基礎言語であり続ける

- 出典：Daily Dose of Data Science
- 日付：2026-05-03
- リンク：https://blog.dailydoseofds.com/p/markov-decision-processes-and-value
- 要約：Daily Dose の RL シリーズ第 2 回は、Markov property、MDP の 5 要素、discounted return、reward hypothesis、policy、state-value function を扱い、4×4 gridworld の Monte Carlo policy evaluation 実装まで含む。RLHF、GRPO、constitutional AI、tool-using Agent を「状態、行動、報酬、方策」の共通フレームで捉え直せる点が実務上の価値だ。

### DeepSeek V4 は入力価格を大きく下げ、Agent 実行コストの前提を変えつつある

- 出典：老范讲故事
- 日付：2026-05-01
- リンク：https://lukefan.com/2026/05/01/deepseek-v4-price-cuts-disrupt-ai-agent-economics/
- 要約：記事は DeepSeek V4 Flash と Pro の価格を整理している。Flash は入力 100 万 tokens あたり約 1 元、cache hit では 0.02 元まで下がり、Pro も入力 100 万 tokens あたり約 3 元、cache hit で 0.025 元程度になる。Claude Code 風 harness での建站タスクが約 0.8 元で済んだという実測は、長時間 coding agent の採算が cache hit と token 単価に強く依存することを示す。

## 3. 実践コード & ツールライブラリ

### Agent-native product management は strategy、issue、product pulse を実行可能な流れにする

- 出典：Every
- 日付：2026-05-03
- リンク：https://every.to/guides/ai-product-management-guide
- 要約：Every の guide は product management を plan、ship、review の循環として捉え、`/ce-strategy` と `/ce:product-pulse` という 2 つの実行可能な command を示している。前者はインタビューを通じて `docs/strategy.md` を生成し、後者は指標、ログ、feedback、support 情報を読み、`~/pulse-reports/` に product memory として残す。

### Codex Knowledge Work Camp は並列調査、要約、小さな自動化を再利用可能な型にしている

- 出典：Every
- 日付：2026-05-03
- リンク：https://every.to/context-window/codex-goes-to-work
- 要約：Every の週末合集は、Codex Knowledge Work Camp で紹介された drafting、research、summarization、parallel task、小規模ツール生成の使い方をまとめている。特に重要なのは、Agent の出力を chat window で終わらせず、最終レビューを実際の destination app で行うという運用原則だ。

## 4. 業界・ビジネス速報

### AI compute の定額補助は、より直接的な利用量課金へ移り始めている

- 出典：Every
- 日付：2026-05-03
- リンク：https://every.to/context-window/compute-is-the-new-cash
- 要約：Every は Stripe の agent-native commerce 論点から、AI 企業の fraud がカード決済だけでなく token、trial credit、未払い compute へ広がっていると整理している。GitHub Copilot が token 消費に連動する billing preview を出し、Anthropic Enterprise も per-seat から usage-based pricing へ移る流れは、autonomous agent のコスト構造が従来の subscription pricing を押し崩していることを示す。

### FDA のリアルタイム治験データ接続は、医療承認に software 的な feedback loop を持ち込む

- 出典：Every
- 日付：2026-05-03
- リンク：https://every.to/context-window/codex-goes-to-work
- 要約：Every の整理によれば、FDA は AstraZeneca と Amgen の 2 つのがん治療薬 trial data をリアルタイムで受け取る方向に進んでおり、同機関の AI 責任者は研究室から薬局までの時間を 20% から 40% 短縮しうると見ている。これは単なる医療ニュースではなく、AI と real-time data pipeline が段階的・batch 処理的だった規制プロセスを software 的な feedback loop に近づけるシグナルだ。

## 📬 Newsletter 精選

### Every の週末合集は、知識作業、product management、AI cost discipline を一本の流れにしている

- 出典：Every Newsletter
- 日付：2026-05-03
- リンク：https://every.to/context-window/codex-goes-to-work
- 要約：この合集は、agent-native product management、incremental determinism、Codex Knowledge Work Camp、agent commerce、FDA real-time data を同じ号で扱っている。価値があるのは、Agent がモデル性能の話を超えて、product workflow、cost control、desktop work interface、regulatory process にまたがる新しい operational layer として見えてくる点だ。

### Daily Dose の RL シリーズは、post-training と tool-using Agent を実装可能な数学に戻す

- 出典：Daily Dose of Data Science Newsletter
- 日付：2026-05-03
- リンク：https://blog.dailydoseofds.com/p/markov-decision-processes-and-value
- 要約：この newsletter は RL nanodegree 第 2 回を紹介し、RLHF、DeepSeek-R1 の GRPO、Claude の constitutional AI、agentic systems を同じ進化線上に置いている。実務読者にとって重要なのは概念名を覚えることではなく、reward、policy、value function が行動するシステムの境界をどう決めるかを理解することだ。
