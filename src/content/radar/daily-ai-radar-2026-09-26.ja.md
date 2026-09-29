---
title: "AI レーダー日報：2026-09-26"
date: 2026-09-26
category: radar
cadence: daily
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-09-26.ja.mp3
audioDuration: 1294
audioSize: 10355754
draft: false
plainSummary: "リリース監視、二モデルの役割分担、行動モデルを通じて、AI 工程はタスク境界と検証を重視。動画・表計算ツールも広がる一方、事例の自己申告と実測を区別する。"
difficulty: intermediate
tags: [AI Engineering, Agents]
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-09-26.ja-infographic.webp
representativeImageSource: https://blog.google/innovation-and-ai/models-and-research/google-research/google-project-suncatcher-facts/
---

> 主に 2026-09-25〜2026-09-26（JST）を対象とし、最近の未紹介の技術動向も収録。各項目に元の公開日を残し、分析記事では対象製品の発表日も明記。GitHub の日付はトレンド観測日。

---
![Behind Project Suncatcher, our moonshot to put AI in space](https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Project_Suncatcher_social.width-1300.png)

*代表画像は [Google の Project Suncatcher 研究紹介](https://blog.google/innovation-and-ai/models-and-research/google-research/google-project-suncatcher-facts/) より。宇宙 AI 計算基盤の試験という本号の工学的テーマを示しています。*
## 1. AI Engineering & アーキテクチャ

### Cursorがデプロイ回帰監視とセキュリティ検証ボットを発表

- 出典：Cursor
- 日付：2026-09-23
- リンク：https://cursor.com/blog/rollouts-and-security-reviewer
- 要約：Cursor が Rollouts と Security Reviewer を発表。前者は PR の差分から監視計画を作り、デプロイ前の基準と比較して回帰を検出する。設定に応じて通知、段階的展開の停止、承認待ちのリバート PR を行う。後者はコード全体の文脈で脆弱性と修正案を提示。機能フラグの直接操作は今後の予定である。

### CognitionのDevin Fusionデュアル構成とSWE-2モデル分析

- 出典：The Batch / Cognition
- 日付：2026-09-25（分析記事；Fusion ローカル版発表 2026-09-11）
- リンク：https://www.deeplearning.ai/the-batch/issue-372
- 要約：The Batchは2026年9月25日、CognitionのDevin Fusion（ローカル版は9月11日発表）を分析。主導モデルと副手モデルが独立した文脈とキャッシュを保持して割引を維持する構成であり、評価ベンチマークではトークン消費増の一方でコスト36%減を記録したとされるが、これは特定条件下での結果であり一般的なトークン削減の保証ではない。

## 2. モデル最前線 & アルゴリズム探索

### Daily Dose が CLM を解説：反復判断を状態と候補動作の検索へ

- 出典：Daily Dose of Data Science
- 日付：2026-09-25（2026-09-26 JST）
- リンク：https://blog.dailydoseofds.com/p/contrastive-language-model-clearly
- 要約：Daily Dose of Data Scienceは2026年9月25日（日本時間26日）、NVIDIAとスタンフォード大の対照言語モデル（CLM）を解説。状態と固定アクション候補を別々にベクトル化・キャッシュし検索的に決定する手法で、特定検証で最大9倍の低遅延化が報告されたが、効果は所定候補の選定タスクに限られ、自由文生成などの汎用LLMを代替するものではない。

### Black Forest Labsがロボット制御向け7B世界動作モデルFLUX 3 Actionを公開

- 出典：Black Forest Labs
- 日付：2026-09-22
- リンク：https://bfl.ai/models/flux-3-action
- 要約：Black Forest Labsは2026年9月22日、7BオープンモデルFLUX 3 Actionを発表した。動画と動作の共同事前学習や特定機体向けの微調整、単一ステップ蒸留により動画と制御指令を同時に予測する。シミュレーション検証RoboLab等で良好な数値を報告しているが、研究環境におけるシミュレーション結果であり、現実世界での絶対的な安全性を保証するものではない。

## 3. 実践コード & ツールライブラリ

### MirageがAIエージェント向け動画制作基盤Tesseractを公開

- 出典：Mirage / The Rundown AI
- 日付：2026-09-25（The Rundown 紹介日）
- リンク：https://mirage.app/tesseract
- 要約：Mirage の Tesseract は、キーフレーム、調整レイヤー、合成、時間、音声を編集可能なネイティブプロジェクトで扱う。Agent は映像を Web コードに置き換えず、動画要素を直接操作し、一部の修正でも他の工程を保持できる。既存素材の編集とモーショングラフィックスが中心で、映像素材やアバターの生成は別のツールが担う。

### Gemini Canvasを活用したGoogleスプレッドシート可視化ガイド

- 出典：The Rundown AI
- 日付：2026-09-25
- リンク：https://www.therundown.ai/articles/meta-connect-turns-into-a-muse-takeover
- 要約：The Rundownは2026年9月25日、GoogleスプレッドシートのデータをGemini Canvasで対話型ダッシュボードに可視化する手順を紹介した。リンク共有により共同確認やチャットでの修正が可能とされるが、本内容は迅速なプロトタイプ作成手法の提示であり、外部保証されたリアルタイム同期や強固な権限保護を確約するものではない。

## 4. 業界 & ビジネス速報

### OpenAI事例：車両管理企業ProactionによるCodex活用デモ構築

- 出典：OpenAI / Proaction
- 日付：2026-09-25
- リンク：https://openai.com/index/proaction
- 要約：OpenAI の顧客事例では、Proaction が Codex で車両管理の個別デモを月 4〜6 件、各 30〜45 分ほどで作成し、開発者への要件説明にも使うと紹介する。共同創業者は初回接触から解決策の開発段階へ進む割合が 50%〜60% 改善したと推計。売上高や最終成約率の伸びではなく、営業段階の移行に関する自己申告である。

### Googleが宇宙AI計算基盤構想Project Suncatcherの実証試験計画を公開

- 出典：Google
- 日付：2026-09-24
- リンク：https://blog.google/innovation-and-ai/models-and-research/google-research/google-project-suncatcher-facts/
- 要約：Google は Project Suncatcher で、Trillium TPU を搭載した試作衛星の初回軌道試験を計画している。まず振動・放射線への耐性と真空中の放熱を調べ、高帯域レーザーで二つの衛星を結ぶ試験は 2027 年の目標とする。初回打ち上げで通信基盤まで完成するという発表ではなく、長期研究の段階的な検証である。

## 5. GitHub 人気 repo & トレンド追跡

### マルチエージェント組織管理OSSのPaperclipがGitHubトレンド入り

- 出典：GitHub Trending / Paperclip
- 日付：2026-09-26（トレンド観測日）
- リンク：https://github.com/paperclipai/paperclip
- 要約：当日のトレンドに入った Paperclip は、Node.js と React で複数 Agent の目標、役割、タスク、コストを管理する。定期起動、予算制限、承認フローを備え、協調と追跡可能な統制を重視する。接続ツールと実行権限は設定次第であり、組織を模した仕組みが自律的な収益事業の完成を意味するわけではない。

### Anthropic公式Claude Codeプラグイン一覧がGitHubトレンド入り

- 出典：GitHub Trending / Anthropic
- 日付：2026-09-26（トレンド観測日）
- リンク：https://github.com/anthropics/claude-plugins-official
- 要約：Anthropic が管理する Claude Code プラグイン一覧がトレンド入り。社内保守のものと、パートナー・コミュニティ提供の外部プラグインを分けている。README は、含まれる MCP サーバーや外部ソフトウェアを全面的に制御・保証できないと注意する。発見の入口にはなるが、導入前の信頼性、権限、コードの確認を省略できるものではない。

## 📬 Newsletter 精選

### Latent.Space対談：OpenRouterの中立的マルチモデルルーティングと歩み

- 出典：Latent.Space
- 日付：2026-09-25（2026-09-26 JST）
- リンク：https://www.latent.space/p/openrouter
- 要約：Latent.Spaceは2026年9月25日（日本時間26日）、OpenRouter創業者らへのインタビューを公開。中立的な推論配信基盤の形成、モデル融合実験、エージェントによるトークン不正への対応やStripeへの統合背景が語られた。言及された利用者規模や日次トークン量、買収経緯は出演者の発言・主張に基づくものであり、独立した監査機関による検証値ではない。

### EveryによるMicrosoft Copilot新機能の初期検証と権限制約

- 出典：Every
- 日付：2026-09-25
- リンク：https://every.to/p/copilot-gets-a-seat-in-the-org-chart
- 要約：Every の Ryan Sloan は Copilot の発表会で Home、Code、継続動作する Autopilot を確認。スライド編集は成功したが、Word の表を Excel に移す操作や Code への引き継ぎは権限で止まった。プレビュー・早期アクセス段階で、Autopilot は初期無効かつ従量制。企業固有のタスク評価と人の作業基準で価値を測るべきだと述べる。
