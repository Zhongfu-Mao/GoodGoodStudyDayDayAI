---
title: "AIレーダー日報：2026-09-25"
date: 2026-09-25
category: radar
cadence: daily
audioUrl: /audio/radar/daily-ai-radar-2026-09-25.ja.mp3
audioDuration: 1244
audioSize: 9953678
draft: false
plainSummary: "AIによる科学研究、リアルタイム世界モデル、音声生成に進展。Agent評価とコーディング手順が具体化し、教育、AIショッピング、長期記憶も焦点に。"
difficulty: intermediate
tags: [AI Engineering, Agents]
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-09-25.ja-infographic.webp
representativeImageSource: https://www.anthropic.com/news/claude-discovers-novel-enzyme-system
---

> 本号は2026-09-24から2026-09-25（JST）を対象とし、各項目には元の公開日を記しています。GitHub項目の日付はトレンド観測日であり、初回公開日ではありません。

---
![ピペットを使う研究者](https://www-cdn.anthropic.com/images/4zrzovbb/website/394de337d8a5d8db93a1c048fa1cb53e16a09625-2048x1240.jpg)

*代表画像は [Anthropic の生命科学研究所の発表ページ](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system) から。本号の AI による科学研究という主題と重なります。*

## 1. AI Engineering & アーキテクチャ

### データの生成から削除まで：キャッシュ、索引、バックアップには別々の寿命がある

- 出典：ByteByteGo
- 日付：2026-09-24（米国時間；2026-09-25 JST）
- リンク：https://blog.bytebytego.com/p/the-life-of-data-from-creation-to
- 要約：ByteByteGoは、一つのデータがデータベース、キャッシュ、検索インデックス、分析パイプライン、バックアップに複製される過程を整理した。各コピーの更新頻度と保持期間は異なるため、元のレコードを消しても全コピーが消えるとは限らない。同期、復旧、保存費用、プライバシー上の削除要求を同じライフサイクルで考える必要がある。

### AIを使う科学研究の二つの道：実験を速めるか、実験の判断を改善するか

- 出典：Latent.Space / Endura Therapeutics
- 日付：2026-09-24（米国時間；2026-09-25 JST）
- リンク：https://www.latent.space/p/foundries-vs-navigators-lowering
- 要約：Endura TherapeuticsのAdrian Sanbornは寄稿で「Foundries」と「Navigators」を区別した。前者は高スループット測定、自動化、データ生成に投資し、後者はAIを研究上の判断や日常業務に組み込む。物理的な実験には時間と資源が要るため、推論が速くなっても実験数が自動的に増えるわけではない。これは筆者の産業分析の枠組みであり、すべての研究室に同じ道が適するという意味ではない。

## 2. モデル最前線 & アルゴリズム探索

### RunwayのWorldPromptがリアルタイム世界モデルに時間軸の制御を追加

- 出典：Latent.Space / Runway
- 日付：2026-09-25
- リンク：https://www.latent.space/p/runway
- 要約：Latent.SpaceはRunwayチームへの取材を通じ、GWM Worlds 2の研究プレビューにあるWorldPromptを紹介した。生成する環境、最初のフレーム、時刻付きの動作を指定し、実行中にも動作を入力できる。リアルタイムの映像・音声シミュレーションに明示的な制御層を与えるが、まだ研究プレビューであり、継続時間、遅延、一貫性は用途ごとに確認が必要だ。

### Gemini 3.8 Flash TTSが音声設計と台詞ごとの演技制御を拡張

- 出典：Google
- 日付：2026-09-23（米国時間；2026-09-24 JST）
- リンク：https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-8-text-to-speech/
- 要約：GoogleはGemini 3.8 Flash TTSと、大量処理向けのFlash-Lite TTSを発表した。自然言語で声を設計し、台詞ごとのテンポ、口調、役柄の演技を指示できるとする。対応は100以上の言語・方言に及び、AI StudioやAPIなどから利用できるという。声の一貫性、費用、各言語での品質は実際の用途で試す必要がある。

## 3. 実践コード & ツールライブラリ

### JevとOpikの組み合わせ：Agent評価を判定と実験記録に分ける

- 出典：Daily Dose of Data Science
- 日付：2026-09-24（米国時間；2026-09-25 JST）
- リンク：https://blog.dailydoseofds.com/p/build-a-jev-judge
- 要約：記事は顧客の返金問い合わせを扱うAgentを例に、Jevで与えられた状態に対する限定的な問いを判定し、カスタム評価器を通じて結果をOpikへ記録する。意味的な判定と実験管理を分離する設計だ。例示された閾値は人手でラベル付けした実例で調整すべきで、Jevの信頼度も正答率の独立した証明ではない。これは独自の連携であり、Opikの標準機能ではない。

### Superpowersが組み合わせ可能なSkillsでコーディングAgentの設計とテストを構成

- 出典：GitHub Trending / obra
- 日付：2026-09-25（トレンド観測）
- リンク：https://github.com/obra/superpowers
- 要約：Superpowersは組み合わせ可能なSkillsを使い、コーディングAgentの作業順序を定める。要件と設計を明確にし、人の承認を経て実装計画を立て、テスト駆動で実行・レビューするという流れだ。リポジトリは複数のAgent環境への導入方法を載せる。これは作業方法であって品質保証ではなく、自動起動するSkills、権限、追加Agentの費用は各プロジェクトで評価する必要がある。

## 4. 業界 & ビジネス速報

### AIショッピングの入口にプラットフォームの壁：Museの取引経路は未確定

- 出典：老范讲故事
- 日付：2026-09-24
- リンク：https://lukefan.com/2026/09/24/meta-muse-ai-agent-ecommerce-barriers/
- 要約：老范はMeta Museの買い物機能を手がかりに、Agentによる取引の二つの障害を論じる。外部の販売事業者は第三者Agentのアクセスを認めるとは限らず、プラットフォーム自身の広告事業も、利用者に代わって商品を選ぶAgentと利害が衝突しうる。これは商業上の誘因についての論評であり、Museの最終的な成否を実証したものではない。

### OpenAI Academyが2周年：地域で教える人材の試行プログラムを拡大

- 出典：OpenAI
- 日付：2026-09-23（米国時間；2026-09-24 JST）
- リンク：https://openai.com/index/two-years-of-openai-academy
- 要約：OpenAIによると、Academyは2年間に250件超のイベントを開き、関連コンテンツに400万人超が関わった。新たに地域組織の職員が教材とワークショップ運営を学ぶトレーナー試行プログラムも始める。イベント数と到達人数は同社の自己申告で、学習成果そのものではない。試行が各地域で継続できるかは今後の検証が必要だ。

## 5. GitHub 人気 repo & トレンド追跡

### Hindsightがトレンド入り：Agentの記憶に保持、想起、反省を組み込む

- 出典：GitHub Trending / vectorize-io
- 日付：2026-09-25（トレンド観測）
- リンク：https://github.com/vectorize-io/hindsight
- 要約：HindsightはAgentの記憶をretain、recall、reflectなどの操作で構成し、単に会話履歴を保存するのではなく、やり取りから再利用できる知識を形成しようとする。サーバー、クライアント、統合の入口を備え、長期タスクの記憶を調べる材料になる。ベンチマーク優位と本番効果は主に開発元の主張であり、自分のタスクと忘却・削除の条件で検証すべきだ。

### CLI-Anythingがトレンド入り：既存ソフトをAgent向けCLIとして公開

- 出典：GitHub Trending / HKUDS
- 日付：2026-09-25（トレンド観測）
- リンク：https://github.com/HKUDS/CLI-Anything
- 要約：CLI-Anythingは既存ソフトにAgentが呼び出せるコマンドライン操作を設けることを目指し、CLI-Hub、インストール方法、実アプリのデモを公開している。操作境界を組み合わせやすくテスト可能なコマンドにする点が重要だ。ただし、アプリごとの権限、データ保護、機能範囲は個別に確認が必要で、「呼び出せる」ことは動作の信頼性を保証しない。

## 📬 Newsletter 精選

### The Rundown：ClaudeがウイルスDNAから未知の酵素系を発見

- 出典：The Rundown AI
- 日付：2026-09-24
- リンク：https://www.therundown.ai/articles/anthropic-ai-biology-lab-makes-its-first-find
- 要約：The RundownはAnthropicの新しい生命科学研究所の初期成果を紹介した。Claude AgentはファージのDNAにある反復配列と関連した酵素系を見つけ、その構造は研究者にCRISPRを想起させる。Anthropicの原報告も機能はまだ不明としており、候補となる仕組みの発見は、利用可能な遺伝子編集ツールの完成を意味しない。

### Every：評価セットがモデル選択とAgentの退行防止に身近な道具へ

- 出典：Every / Context Window
- 日付：2026-09-24（米国時間；2026-09-25 JST）
- リンク：https://every.to/context-window/why-evals-are-so-hot-right-now
- 要約：EveryはSentryでのコード変更に伴う評価実行や、社員が作る個人用ベンチマークを例に、Agentの更新で品質が下がらないか、モデルの品質・速度・価格をどう比べるかを論じた。数値や体験は特定チームの事例であり、業界全体の普及率は示さない。評価には明確な成功基準と代表性のあるサンプルが要る。
