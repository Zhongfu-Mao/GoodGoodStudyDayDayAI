---
title: "AIレーダー日報：2026-08-10"
date: 2026-08-10
category: radar
cadence: daily
plainSummary: "今日の主線：AIエンジニアリングは、推論サービスの学習ロードマップ、法律エージェントのベンチマーク、気象モデルの公開を通じ、能力・リスク・運用コストを同じ証拠連鎖で測る段階へ進んでいる。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Evaluation
  - Models
  - GitHub
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-08-10.ja-infographic.webp
representativeImageSource: https://github.com/harveyai/harvey-labs
audioUrl: /audio/radar/daily-ai-radar-2026-08-10.ja.mp3
audioDuration: 1125
audioSize: 9003239
draft: false
---

対象期間：2026-08-09〜2026-08-10（JST）。週末明けの新着は多くないものの、方向性は明確だ。モデルとエージェントは単発回答だけでなく、デプロイ、観測、評価、復旧、専門領域の制約まで含めて比較され始めた。今日は本番推論ロードマップ、サイバー防護、法律・気象の垂直評価、そして能力をレビュー可能な資産として配布するOSSに注目する。

---
![Harvey Legal Agent Benchmarkのtask、document、scoring、comparison flow](https://github.com/harveyai/harvey-labs/raw/main/docs/assets/lab-hero.png)

*代表図は [Harvey LAB](https://github.com/harveyai/harvey-labs) より。法律agentがtaskとdocumentを受け取り、scoring、report、model comparisonへ進む評価flowを示す。*

## 1. AI Engineering & アーキテクチャ

### 10週間の本番LLMロードマップ：rooflineの理解からserving最適化へ

- 出典：Daily Dose of Data Science
- 日付：2026-08-10
- リンク：https://github.com/patchy631/time-to-first-token
- 要約：50セッションのロードマップは、vLLM、SGLang、PagedAttention、continuous batching、量子化、speculative decoding、KV cache、prefill/decode分離、Kubernetes、コストルーティングを一つの成果物につなぐ。decodeのメモリ帯域制約を理解し、TTFT、token間遅延、スループット、待ち行列、リクエスト単価を観測してから最適化する順序が重要だ。1000並列やH100実験は予算と実トラフィックに合わせて調整したい。

### Plan-and-Actには動的な再計画が必要：固定計画はplannerなしより悪化し得る

- 出典：Daily Dose of Data Science · arXiv
- 日付：2026-08-10
- リンク：https://arxiv.org/abs/2503.09572
- 要約：Plan-and-Actは高水準の計画とページ操作を分離するが、WebArena-Liteではplanner品質が結果を大きく左右した。単純に微調整したplannerはplannerなしの基準を下回り、各ステップで再計画すると失敗した手順を置き換えられた。導入時は計画粒度、具体的な値、context削減、再計画条件まで評価しなければ、誤った道筋を忠実に実行するだけになる。

## 2. モデル最前線 & アルゴリズム探索

### WeatherNext 2がコードと重みを公開：全球中期予報とサイクロン予報を一つのrepoに

- 出典：Google DeepMind
- 日付：2026-08-10
- リンク：https://github.com/google-deepmind/weathernext
- 要約：WeatherNext repoはWN2、WeatherNext Cyclones、GraphCast、GenCastのコードと文書をまとめ、0.25度の事前学習モデル、軽量Mini、Colab、複数プラットフォームの予報データを提供する。フルモデルはTPUまたはH100向け、Miniはより小さい環境で試せる。再現性は高まるが、研究コードであり気象機関の警報を代替しないという注意が明記されている。

### Harvey LABは1,671タスクで法律agentを評価し、Q&A精度だけに頼らない

- 出典：Harvey AI
- 日付：2026-08-10
- リンク：https://github.com/harveyai/harvey-labs
- 要約：Harvey Legal Agent Benchmarkは実務を指示、文書、rubric、実行harnessに分解し、24以上の法務分野と契約業務を扱う。M&A data room課題の実行から採点、比較dashboardまでのチュートリアルと、all-pass rubric・LLM judgeの方法も公開した。領域評価を「一連の仕事を完遂できるか」へ進める一方、法的判断、データ利用権、最終責任は専門家に残る。

## 3. 実践コード & ツールライブラリ

### code-graph-rag：コードをグラフ化し、依存関係と変更影響をagentが検索

- 出典：GitHub Trending / vitali87
- 日付：2026-08-10
- リンク：https://github.com/vitali87/code-graph-rag
- 要約：code-graph-ragはコードをエンティティと関係のグラフへ変換し、呼び出し経路、モジュール依存、変更影響を構造化して検索する。巨大repo全体をcontextに入れるより定位しやすいが、parserの対応範囲、動的挙動、生成コード、index鮮度が完全性を左右する。グラフ回答はビルド、テスト、実行証拠と照合すべきだ。

### witr：プロセス、port、resourceをagentが読める実行現場にする

- 出典：GitHub Trending / pranshuparmar
- 日付：2026-08-10
- リンク：https://github.com/pranshuparmar/witr
- 要約：witrはローカルのプロセス、port、resource情報を集約し、port占有、service状態、負荷異常の調査に一つの入口を与える。AIモデルそのものではないが、coding agentが見落としやすいruntime観測面を補う。自動化ではcommand権限を狭め、機密引数を除外し、process停止などの副作用は明示的な承認に残したい。

## 4. 業界 & ビジネス速報

### OpenAIがAstraの安全管理を強化：Critical cyber能力を排除できない段階

- 出典：Latent.Space / AINews · OpenAI
- 日付：2026-08-07
- リンク：https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/
- 要約：OpenAIはAstraのagentic codingとサイバー能力に大きな進展があり、Preparedness FrameworkのCritical閾値を現時点で排除できないと説明した。隔離環境、network・tool制限、weight保護、監視、第三者評価を強化し、要件を満たさない社内活動を停止した。リスク分類が開発工程を直接変える例だが、結論は予備評価であり、完全なzero-day攻撃能力が確認済みとは表現できない。

### Terafab構想：logic、memory、package、energyを同じ製造control planeへ

- 出典：老范讲故事
- 日付：2026-08-10
- リンク：https://lukefan.com/2026/08/10/elon-musk-terafab-space-computing-chip-factory/
- 要約：記事はTexasの「Terafab」を巡り、logic chip、DRAM、advanced packaging、電力、工場systemをより密接に統合する構想を分析する。AI計算力の拡張がenergy、memory、package、建設期間に制約されることを示す材料だ。投資額やroadmapは媒体分析の段階であり、企業文書、supplier、規制資料による追加確認が必要になる。

## 5. GitHub 人気 repo & トレンド追跡

### msitarzewski/agency-agents：職務、成果基準、workflowをインストール可能なagentへ

- 出典：GitHub Trending / msitarzewski
- 日付：2026-08-10
- リンク：https://github.com/msitarzewski/agency-agents
- 要約：このrepoは専門職ごとの目標、process、出力要件を再利用可能なagent設定として整理し、万能promptより役割分担を重視する。役割契約とtask分解の参考になるが、肩書きは能力保証ではない。自社data、tool権限、acceptance criteriaで各役割を試し、未監査の外部指示に書き込み権限を与えないことが重要だ。

### ZhuLinsen/daily_stock_analysis：市場、news、model分析を日次自動reportへ

- 出典：GitHub Trending / ZhuLinsen
- 日付：2026-08-10
- リンク：https://github.com/ZhuLinsen/daily_stock_analysis
- 要約：定期実行で市場データ、news、LLM分析を統合し、個人研究向けの日次株式reportを生成する。「収集―解釈―配布」の軽量agent workflowとして参考になるが、予測収益の根拠ではない。実用時はデータlicense、timezone、欠損、prompt injection、backtest biasを検証し、投資判断の代替にしてはならない。

## 📬 Newsletter 精選

### 50セッションで公開・再現可能な推論serviceを作る

- 出典：Daily Dose of Data Science
- 日付：2026-08-10
- リンク：https://blog.dailydoseofds.com/p/a-10-week-roadmap-to-run-llms-in
- 要約：10週間の学習を一つの成果物に集約する。推論serviceをdeployし、Grafana / Prometheusを整え、1000以上の並列load testを行い、FP16、FP8、INT4、speculative decoding、KV evictionを比較し、固定versionとcommand付きbenchmarkを公開する。毎週同じassetに証拠を追加する設計が、独立tutorialの収集より価値を持つ。

### AI時代にproduct managerは消えないが、情報運搬と定型調整はagent化する

- 出典：老范讲故事
- 日付：2026-08-09
- リンク：https://lukefan.com/2026/08/09/ai-product-manager-role-transformation/
- 要約：agentは要求集約、情報同期、文書整理、定型調整を先に自動化し、product managerの価値は問題選択、制約設計、利害調整、結果責任へ集中すると論じる。職務task mapを描き直す観点として有用だが、雇用数を直接予測するものではない。組織構造、業界責任、data権限、顧客対話が自動化境界を決める。
