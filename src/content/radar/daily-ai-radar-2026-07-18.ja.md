---
title: "AIレーダー日報：2026-07-18"
date: 2026-07-18
category: radar
cadence: daily
plainSummary: "本日の主線：agent engineering は単発のモデル呼び出しから、測定、監査、実運用への組み込みが可能なシステム能力へ移っている。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-07-18.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-07-18.ja.mp3
audioDuration: 1245
audioSize: 9962456
draft: false
---

対象期間：2026-07-17 から 2026-07-18（JST）。本日の主線は、agent engineering の焦点がモデル能力そのものから、実験室、音声、コードベース、企業 ROI、法的責任といった本番システム上の課題へ移っていることです。

## 1. AI Engineering & アーキテクチャ

### Latent.Space / Lila Sciences：実験室をデータセンターとして設計する

- 出典：Latent.Space / Lila Sciences
- 日付：2026-07-16
- リンク：https://www.latent.space/p/the-lab-of-the-future-should-feel
- 要約：Lila Sciences のインタビューは、自動化実験室をデータセンターに近いシステムとして描いています。装置、ロボット、スケジューリング層が実験グラフを構成し、自然によって検証された科学データを継続的に生み出します。重要なのは人間の操作をロボットで置き換えることだけではなく、実験プロセスをキュー化、再利用、フィードバック可能な計算資源に変えることです。

### OpenAI Scorecard：企業 AI 導入では成功タスク当たりの総コストを見る

- 出典：OpenAI
- 日付：2026-07-17
- リンク：https://openai.com/index/a-scorecard-for-the-ai-age/
- 要約：OpenAI は、企業が AI を評価する際に token コストだけでなく、成功したタスク 1 件あたりの総コストを見るべきだと提案しました。人間のレビュー、再試行、手戻り、システム境界を含める必要があります。また、出力を「そのまま使える」「修正が必要」「エスカレーションが必要」に分ける考え方も示しています。企業 agent の ROI は、単発の呼び出し価格よりも、安定して完了できるタスク比率で決まります。

## 2. モデル最前線 & アルゴリズム探索

### The Batch：GPT-Live はリアルタイム音声とバックグラウンド推論を二層化する

- 出典：DeepLearning.AI The Batch
- 日付：2026-07-17
- リンク：https://openai.com/index/introducing-gpt-live/
- 要約：GPT-Live の構成で注目すべき点は、前面の音声モデルが低遅延の双方向対話を担い、複雑な質問は背後の推論モデルへ渡すことです。The Batch によると、高推論設定の GPT-Live は GPQA や BrowseComp などで従来の高度音声モードを大きく上回りました。音声 agent では、自然な会話体験と深い推論能力が別々に最適化される層になりつつあります。

### Puppet benchmark：モデルがユーザーの信念に与える影響の測定はまだ難しい

- 出典：MIT / CMU / DeepLearning.AI The Batch
- 日付：2026-07-17
- リンク：https://arxiv.org/abs/2603.20907
- 要約：Puppet benchmark は、対話がユーザーの信念をどう変えるかをモデルに予測させ、操作的な出力を検出できるかも測ります。結果として、一部の大規模モデルは信念変化を比較的よく推定できましたが、操作検出器の相関はほぼゼロでした。安全評価では、モデルが人を説得できるかだけでなく、不適切な影響を識別して避けられるかを別に測る必要があります。

## 3. 実践コード & ツールライブラリ

### GitHub Copilot SDK：Copilot Agent を外部アプリに組み込む

- 出典：GitHub
- 日付：2026-07-18
- リンク：https://github.com/github/copilot-sdk
- 要約：GitHub Copilot SDK は TypeScript、Python、Go、.NET、Java、Rust などのインターフェースを提供し、外部アプリから JSON-RPC 経由で Copilot CLI エンジンを呼び出せるようにします。計画、ツール呼び出し、ファイル編集、カスタム agent 能力を扱えるため、単なる Copilot 呼び出しではなく、coding agent のランタイムを製品や社内ツールに埋め込むための部品になっています。

### FutureHouse Robin：創薬再利用 agent がウェット実験の閉ループへ

- 出典：DeepLearning.AI The Batch / FutureHouse
- 日付：2026-07-17
- リンク：https://github.com/Future-House/robin
- 要約：FutureHouse は Robin を公開し、疾患メカニズムの特定、実験設計、候補薬の探索を agent が行い、人間がウェット実験を実施して結果をシステムへ戻す流れを示しました。The Batch は、乾性加齢黄斑変性を対象にした実験で、候補薬が細胞機能指標を約 2 倍改善した事例を紹介しています。agent が文献検索を超え、仮説、実験、フィードバックの閉ループへ入っている点が重要です。

## 4. 業界 & ビジネス速報

### 老范讲故事：Tencent による Manus 買い戻し説は資本上の帳簿問題でもある

- 出典：老范讲故事
- 日付：2026-07-17
- リンク：https://lukefan.com/2026/07/17/tencent-manus-2-billion-buyback/
- 要約：老范讲故事は、Tencent が約 20 億ドル評価で Manus の買い戻しを主導する可能性について、スタートアップ評価、既存株主の帳簿上の利益、ファンドの LP/GP インセンティブ、上場経路の関係から分析しました。業界シグナルとして重要なのは、独自モデルと安定した配布経路を持たない汎用 agent 製品は、初期の話題性が高くても Claude Code、Codex、Grok Build、OpenClaw などのツールチェーンに急速に圧迫されることです。

### Google AI Overview がドイツで検索結果責任の境界に直面

- 出典：DeepLearning.AI The Batch
- 日付：2026-07-17
- リンク：https://www.deeplearning.ai/the-batch/issue-362/
- 要約：The Batch は、ミュンヘンの裁判所が Google に対し、AI Overview が生成した名誉毀損的な検索要約について責任を認めたと報じました。裁判所はこれらの要約を独立した表現内容として扱っています。控訴で結果が変わる可能性はありますが、この事例は生成型検索がプラットフォームを単なるリンク順位付けから、コンテンツ発行者に近い法的リスク領域へ押し出していることを示しています。

## 5. GitHub 人気 repo & トレンド追跡

### code-review-graph：ローカルグラフでコードレビューの文脈を圧縮する

- 出典：GitHub
- 日付：2026-07-18
- リンク：https://github.com/tirth8205/code-review-graph
- 要約：code-review-graph は Tree-sitter を使ってコードベースのローカルグラフを構築し、変更の影響範囲、依存関係、PR レビュー文脈を MCP、CLI、GitHub Actions へ渡します。インクリメンタル更新、多言語対応、レビュー質問に必要な token 削減を重視しています。コード agent のボトルネックが単発の補完能力ではなく、文脈整理へ移っていることを示す実用的なプロジェクトです。

### OpenPipe ART：agent 向け強化学習トレーニング基盤

- 出典：GitHub
- 日付：2026-07-18
- リンク：https://github.com/OpenPipe/ART
- 要約：OpenPipe ART は実際の agent タスク向けの強化学習トレーニングフレームワークで、環境からのフィードバックを使ってツール利用や多段行動を最適化することを重視しています。agent が単にツールを呼び出すだけでなく、実行結果から方針を改善できるかに関心がある読者に向いています。GitHub の最近の傾向では、訓練、評価、文脈グラフの各領域が同時に伸びており、agent engineering が呼び出しの編成から最適化可能なランタイムへ移っていることが見えます。

## 📬 Newsletter 精選

### Daily Dose：RLHF、DPO、GRPO と Paged Attention の設計上の取捨選択

- 出典：Daily Dose of Data Science
- 日付：2026-07-17
- リンク：https://blog.dailydoseofds.com/p/rlhf-vs-dpo-vs-grpo-in-rl
- 要約：Daily Dose は RLHF、DPO、GRPO を比較しました。RLHF は報酬モデルと critic を使うため訓練経路は強力ですが高コストです。DPO は preference pair を直接使って軽量化しますが、データ範囲に依存します。GRPO はグループ内統計で critic を置き換え、負荷を下げます。さらに Paged Attention による KV cache ページングが推論スループットをどう改善するかも説明しており、訓練手法と推論システムをつなぐ読み物になっています。

### Every：編集者が Codex で有料記事のギフトリンクを構築

- 出典：Every
- 日付：2026-07-17
- リンク：https://every.to/on-every/how-we-built-gift-links
- 要約：Every は、新しいギフトリンク機能をどのように開発したかを紹介しました。編集者が Codex と frontier models を使い、調査、実装計画、コード変更、レビュー、PostHog 計測、テスト、ソフトローンチまで進めています。この記事の価値は、非エンジニアがコードを書けるかという話ではなく、AI-native な会社で編集、プロダクト、エンジニアリングの境界がどう再配分されるかを示している点です。
