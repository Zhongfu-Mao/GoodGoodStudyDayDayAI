---
title: "AI レーダー日報：2026-05-02"
date: 2026-05-02
category: radar
cadence: daily
plainSummary: "本日の AI レーダーでは、GEPA による RL 型プロンプト最適化の代替、Codex の知識作業・コンピューター操作への拡張、Qwen3.6 と GPT-5.5 のモデル動向、さらに Claude Code のプロダクト管理活用や車載 Gemini など Newsletter 由来の実装シグナルを整理します。"
difficulty: intermediate
tags:
  - Agent
  - Evaluation
  - Open Models
  - AI Engineering
lang: ja
coverImage: "/images/radar/daily-ai-radar-2026-05-02.ja-infographic.webp"
audioUrl: "/audio/radar/daily-ai-radar-2026-05-02.ja.mp3"
audioDuration: 1218
audioSize: 9747416
draft: false
---

---
![AINews Agents for Everything Else: Codex for Knowledge Work, Claude for Creative Work](https://substackcdn.com/image/youtube/w_728,c_limit/zepu8Kk6FBQ)

*代表画像は [[AINews] Agents for Everything Else: Codex for Knowledge Work, Claude for Creative Work](https://www.latent.space/p/ainews-agents-for-everything-else) から。この記事の主線を最もよく表す元シグナルとして選んでいます。*
## 対象範囲

- 対象期間：2026-04-29 から 2026-05-02 まで。

## カバー画像（アイキャッチ）の解説

今日のカバー画像は「AI ワークベンチの多層ダッシュボード」を想定します。左側に Agent エンジニアリングとプロンプト最適化、中央にモデル能力と評価曲線、右側に Newsletter から拾ったプロダクト化シーンを配置し、単一モデルの順位ではなく「モデル発表から実務ワークフローへつながる流れ」を見せる構図が合います。

## 1. AI Engineering & アーキテクチャ

### Codex はコーディング支援から知識作業・コンピューター操作の基盤へ広がっている

- 出典：Latent Space / AINews
- 日付：2026-05-01
- リンク：https://www.latent.space/p/ainews-agents-for-everything-else
- 要約：OpenAI は Codex を、コード生成だけでなく文書、スライド、表計算、調査、計画、企業アプリ連携まで扱う作業環境へ広げようとしている。注目点は、静的なチャット画面ではなく、動的 UI、役割別 onboarding、ブラウザ操作、企業 connector を組み合わせ、知識作業を実行可能で追跡可能なタスクフローに分解していることにある。

### GEPA は実行軌跡全体を使い、複雑な Agent 調整の計算コストを下げる

- 出典：Daily Dose of Data Science
- 日付：2026-05-01
- リンク：https://blog.dailydoseofds.com/p/how-to-beat-grpo-without-touching
- 要約：GEPA は GRPO のように長い rollout を単一の reward に潰すのではなく、完全な軌跡、タスクのフィードバック、失敗文脈を反省用モデルに渡し、プロンプトそのものを書き換えさせる。多段 RAG、Agent workflow、ツール呼び出しチェーンでは、重みを更新せずに実行証拠からシステム挙動を改善できるため、rollout が高価で学習データが少なく、評価を自然言語で説明できる場面に向いている。

### DeepAgents と Agent Collabs は Agent のデプロイと協働空間を実装レイヤーへ進めている

- 出典：Latent Space / AINews
- 日付：2026-05-01
- リンク：https://www.latent.space/p/ainews-agents-for-everything-else
- 要約：LangChain の DeepAgents は `deepagents.toml` によるリモート Agent デプロイを進め、Hugging Face 周辺の Agent Collabs は共有状態、ファイル bucket、Space を組み合わせた協働環境を示している。ここでのシグナルは「新しい Agent デモ」ではなく、Agent がローカルスクリプトから設定可能・デプロイ可能・複数人で運用可能なランタイム層へ移っていることだ。

### DeepSeek V4-Flash は GUI Agent の推論に視覚的な位置情報を前置する

- 出典：Latent Space / AINews
- 日付：2026-05-01
- リンク：https://www.latent.space/p/ainews-agents-for-everything-else
- 要約：DeepSeek V4-Flash は、bounding box や point coordinate といった視覚的な位置情報を推論過程に取り込み、コンピューター操作や UI 操作をより直接的に動かすモデルとして紹介されている。関連リポジトリが短時間で消えたとしても、「視覚座標 + 推論チェーン + 操作実行」の組み合わせは GUI Agent の重要な実装方向を示している。

## 2. モデル最前線 & アルゴリズム探索

### GPT-5.5 は長期サイバー評価で Mythos に近づき、リスク境界もより見えやすくなった

- 出典：Latent Space / AINews
- 日付：2026-05-01
- リンク：https://www.latent.space/p/ainews-agents-for-everything-else
- 要約：英国 AI Security Institute の長期サイバーシミュレーションでは、GPT-5.5 が複数段階の攻撃シナリオを end-to-end で完了でき、Claude Mythos に近い平均通過率を示した。これは frontier model の agentic cyber 能力が急速に近づいていることを意味し、企業評価では一般的な推論スコアだけでなく、長時間タスク、ツール利用、安全境界を別枠で追う必要がある。

### Qwen3.6 27B は 150B 未満のオープンウェイトモデルで新しい基準点になった

- 出典：Latent Space / AINews
- 日付：2026-05-01
- リンク：https://www.latent.space/p/ainews-agents-for-everything-else
- 要約：Qwen3.6 27B は Artificial Analysis の 150B 未満オープンウェイトモデルの評価で上位に立ち、Apache 2.0 ライセンス、長文脈、ネイティブマルチモーダル能力を備える。意味が大きいのは、ローカル運用や二次開発が可能なモデル能力がさらに一段進み、企業内導入や研究再現の選択肢が増える点だ。

### Epicure はレシピ関係から味の構造を学び、垂直業界 AI のデータ整備パターンを示した

- 出典：The Rundown AI
- 日付：2026-04-30
- リンク：公開版リンクなし
- 要約：KAIKAKU AI の Epicure は、6,653 件のばらついた食材記録を 1,032 個の標準食材に整理し、レシピ間の関係から味覚、料理ジャンル、組み合わせ構造を学習する。これは汎用モデルの性能競争ではなく、垂直業界で「汚れたデータの正規化 + ドメイン関係のモデリング + 自動化装置」を接続する実装例として重要だ。

### 小さめの教師モデルが、前線級モデルより fine-tuning に向く場合がある

- 出典：Daily Dose of Data Science
- 日付：2026-05-01
- リンク：https://arxiv.org/abs/2604.09791
- 要約：Pioneer の fine-tuning 実験では、Qwen3-8B のような対象モデルに対し、より強い教師モデルが常に良い結果を生むわけではないことが示された。容量の不一致、事前学習知識の忘却、出力の過度な複雑化が原因になり得るため、蒸留や教師あり fine-tuning では最強教師を機械的に選ばず、対象モデルの規模、タスク境界、例の複雑さを同時に評価すべきだ。

## 3. 実践コード & ツールライブラリ

### Claude Security と Cursor Security Review は AI コードレビューを安全基準へ近づける

- 出典：Latent Space / AINews
- 日付：2026-05-01
- リンク：https://www.latent.space/p/ainews-agents-for-everything-else
- 要約：Claude Security や Cursor Security Review のようなツールは、コード生成後のセキュリティスキャン、パッチレビュー、依存関係リスクの検出を開発ループの中へ前倒ししている。最近の PyPI `lightning` サプライチェーン問題と合わせると、AI コーディングの焦点は「より速く生成する」から「生成、レビュー、依存関係ガバナンスを一体化する」方向へ移っている。

### Cloudflare Agentic Inbox は React 19 とエッジ状態で作る実用的な Agent UI の例になる

- 出典：React Status
- 日付：2026-05-01
- リンク：https://react.statuscode.com/issues/472
- 要約：Cloudflare の Agentic Inbox は、React 19、React Router 7、Durable Objects、R2 を使ってメールクライアント風の Agent アプリを構成している。抽象的なデモよりも、ルーティング、streaming UI、状態保存、実タスク画面を同じサンプル内で扱う点が、実装チームにとって参考になる。

### pnpm 11 と Node 26 の延期は、ランタイム配布境界を見直すきっかけになる

- 出典：Node Weekly
- 日付：2026-04-30
- リンク：https://nodeweekly.com/issues/622
- 要約：pnpm 11 は `pack-app` などの機能で Node アプリを単一ファイル配布に近づけようとしており、一方で Node 26 は Rosetta 2 や Temporal まわりの課題で延期された。純粋な AI ニュースではないが、Agent ツール、MCP サービス、社内自動化スクリプトでは、パッケージ管理、ランタイム互換性、配布方式が再現性に直結する。

## 4. 業界 & ビジネス速報

### Anthropic Mythos の政府・企業展開は、計算資源と政策の制約に直面している

- 出典：The Rundown AI
- 日付：2026-05-01
- リンク：公開版リンクなし
- 要約：Anthropic は Mythos の企業・政府関連機関への提供範囲を広げようとしているが、計算資源配分や政府採用方針への懸念から調整を受けていると報じられている。この動きは、frontier model の商用化が単なる製品発表ではなく、国家安全保障、計算資源の割り当て、複数ベンダー調達の問題になっていることを示す。

### Gemini は Google built-in 搭載車に入り始めている

- 出典：The Rundown AI
- 日付：2026-05-01
- リンク：公開版リンクなし
- 要約：Google は Gemini を Google built-in 搭載車へ導入し、ナビゲーション、メッセージ、音楽、車両に関する質問、Gemini Live による音声対話を扱わせようとしている。車載環境は低遅延、マルチモーダル、継続音声対話、安全制約を同時に求めるため、消費者向け AI Agent が高頻度の物理空間に入れるかを見る重要な試験場になる。

### 中国当局による Meta の Manus 買収阻止は、AI 主権が M&A 変数になったことを示す

- 出典：老范讲故事
- 日付：2026-04-29（対象期間をやや超過）
- リンク：https://lukefan.com/2026/04/29/china-blocks-meta-manus-acquisition-ai-sovereignty/
- 要約：老范讲故事は、Meta による中国 AI Agent 企業 Manus の買収が阻止された背景として、データ、モデル能力、AI 主権の重みが増している点を挙げている。取引の詳細は引き続き確認が必要だが、AI 企業の海外展開や買収では、規制不確実性が中核的なビジネスリスクになりつつある。

## 📬 Newsletter 精選

### Every：Claude Code はプロダクトマネージャーの作業単位を変えつつある

- 出典：Every
- 日付：2026-05-01
- リンク：https://every.to/p/claude-code-for-product-managers
- 要約：Every は、Spiral チームが Claude Code を PRD、ticket、調査、プロダクト運用に使う方法を紹介している。重要なのは PM にコードを書かせることではなく、README、GitHub Project、顧客会話、プロダクト分析を実行可能な作業オブジェクトへ変換する点であり、compound engineering plugin やカスタム `/pulse` コマンドは、AI プロダクト管理が文書協業から文脈オーケストレーションへ移っていることを示す。

### The Rundown：OpenAI の “goblin obsession” は reward signal のプロダクトリスクを示した

- 出典：The Rundown AI
- 日付：2026-05-01
- リンク：公開版リンクなし
- 要約：OpenAI は、ChatGPT が一時期 goblin 関連の表現を好んだ問題を Nerdy personality の reward signal に起因すると説明し、最終的に該当 persona を停止した。小さな事例だが、スタイル reward や人格設定は大規模利用の中で観測可能な振る舞いとして増幅されるため、モデルの「語り口」も機能と同じように監視・ロールバック対象にすべきだと分かる。

### Node Weekly：Cloudflare agent skills はプラットフォーム機能を Agent ツールへ開き始めている

- 出典：Node Weekly
- 日付：2026-04-30
- リンク：https://nodeweekly.com/issues/622
- 要約：Cloudflare はプラットフォーム機能を agent skills として包み、AI ツールが Cloudflare リソースをより直接構築・設定・デプロイできるようにしている。社内プラットフォームチームにとっては、「ドキュメント + 管理画面」から「Agent が呼び出せる操作インターフェース」へ移る流れであり、権限設計とガバナンスも前倒しで整える必要がある。
