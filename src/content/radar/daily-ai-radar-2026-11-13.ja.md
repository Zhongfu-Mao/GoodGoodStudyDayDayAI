---
title: "AIレーダー日報：2026-11-13"
date: 2026-11-13
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-13.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-13.ja.mp3
audioDuration: 1305
audioSize: 10440129
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "モデルが指示とデータを区別する方法から、複数エージェントによる共有状態のマージまで。"
plainSummary: "入力構造、書き込み競合、製品指標を分けて確かめ、自動化の信頼性を判断する。"
---

対象期間は2026年11月12日12:00から11月13日12:00まで（日本時間）。製品発表、会議デモ、著者の見解を分けて読む。

## 今日の重要な変化

- [Granite LLMON：指示とデータを分けても、ツールの権限確認は必要](#radar-granite-llmon)
- [Omnigraph：複数のエージェントが並行して変更を提案し、主ブランチへの書き込みを競わずに済む](#radar-omnigraph-shared-state)
- [Amplitude Wave：製品データから課題を見つけ、実験で変更の効果を測る](#radar-amplitude-wave)

## 能力とエビデンス

### Granite LLMON：指示とデータの分離は権限管理の代わりにならない

<a id="radar-granite-llmon"></a>

- 出典：IBM Granite
- 情報経路：ブログ、GitHub
- エビデンス区分：著者の研究
- 初出日：2026-11-12
- リンク：https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite
- 要約：IBMはGranite 4.1をベースにした3Bと8BのLLMON実験プレビューを公開した。予約済みの特殊トークンで指示、データ、出力要件を区切り、識別子で特定のデータブロックを指せるようにする。チームが報告した間接プロンプトインジェクションのベンチマークでは耐性が向上したが、一般能力の指標には上がった項目も下がった項目もある。特定のモデルと評価での結果であり、実運用の隔離を保証しない。ツールの権限はモデルの外でも確認する必要がある。

<!-- radar-visual:granite-benchmark -->
[![同じ規模のGranite InstructとLLMONプレビューを七つの分野で比べた表](<https://cdn-uploads.huggingface.co/production/uploads/6484ca4d5ff9a3d2ee52a83b/VMIEO4qYlmxLhK0DmMO6C.png>)](<https://cdn-uploads.huggingface.co/production/uploads/6484ca4d5ff9a3d2ee52a83b/VMIEO4qYlmxLhK0DmMO6C.png>)

*同じモデル規模の列を横に比較する。たとえば8Bでは安全性の得点が上がり、数学は下がっている。最下段は七分野の平均で、全指標が改善したわけではない。 画像出典：[IBM Granite](https://huggingface.co/blog/ibm-granite/llmon-an-llm-native-markup-language-now-in-granite)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:granite-benchmark -->

### Jev：文書の断片を複数ラウンドの選択で並べ替える

<a id="radar-jev-tournament-ranking"></a>

- 出典：Latent.Space
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-12
- リンク：https://latent.space/p/jev-revolution
- 要約：UiPathは会議デモで文書の断片を小グループに分け、Jevで関連性の高い候補を選び、勝ち残った断片を次のラウンドに進めた。報道によると多数の呼び出しでもこのデモは1秒未満だったが、他の環境に当てはめるための負荷条件や再現手順は示されていない。自分の検索環境では再現率、順位付けの品質、全体の処理時間を別々に測る必要がある。

## 構築と運用

### Omnigraph：変更はブランチに分け、古いレコードによる上書きを防ぐ

<a id="radar-omnigraph-shared-state"></a>

- 出典：Daily Dose of Data Science、Omnigraph
- 情報経路：Newsletter、GitHub
- エビデンス区分：著者の実測
- 初出日：2026-11-12
- リンク：https://blog.dailydoseofds.com/p/how-top-ai-teams-scale-to-1000-agents
- 要約：著者は同じ版から始めた二つのエージェントで、一方がストレージ、もう一方が担当者を変更する実験を行った。先のブランチをマージすると、後のブランチは別のフィールドを変更しただけでも、同じレコードが更新済みだったため拒否された。最新の主ブランチを起点にやり直すと、両方の変更を残せた。ブランチと差分で変更を確認してから取り込めるが、競合判定はフィールド単位ではなくレコード単位。開発者一人とエージェント二つの実演であり、見出しにある千規模での実測ではない。

プロジェクト：[Omnigraph](https://github.com/ModernRelay/omnigraph)

<!-- radar-visual:omnigraph-merge-refused -->
[![Omnigraphの実演画面。ブランチで担当者を変更したが、同じサービスのレコードが競合した](<https://substack-post-media.s3.amazonaws.com/public/images/96ca1296-3220-4ef1-b3e2-50626e052d17_3200x938.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/96ca1296-3220-4ef1-b3e2-50626e052d17_3200x938.png>)

*上段の差分は担当者の変更だけだが、下段では同じサービスのレコードが分岐したためマージを拒否している。書き込みは行われず、更新を促している。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/how-top-ai-teams-scale-to-1000-agents)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:omnigraph-merge-refused -->

### 隠れた結合：直接呼び出さなくても障害を共有し得る

<a id="radar-hidden-coupling"></a>

- 出典：ByteByteGo
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-12
- リンク：https://blog.bytebytego.com/p/top-types-of-hidden-coupling-and
- 要約：APIが別のサービスでも、同じデータベース容量やログ基盤に依存したり、一緒にデプロイする必要があったりする。リクエストの流れだけを描いた構成図では見落としやすい。エージェントの運用をレビューする際も、どの構成要素が状態、容量、リリースのタイミングを共有するかを別に書き出し、片方の障害時にもう片方が独立して稼働・復旧できるかを確認するとよい。構成を点検する考え方であり、負荷試験の結果ではない。

## プロダクトと実際の導入

### Google検索にHydrogen：複合的な質問を分けて並行検索

<a id="radar-hydrogen-search"></a>

- 出典：Google
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-12
- リンク：https://blog.google/products-and-platforms/products/search/gemini-4-hydrogen-search-upgrade
- 要約：Googleは検索でGemini 4 Hydrogenを世界展開すると発表した。複雑な質問を関連する小テーマに分け、複数の検索を同時に行い、リンクや構造化された回答、比較表を示せるとしている。文章生成だけでなく、何を検索するかにもモデルが関わる。発表には独立した正確性評価や参照元の網羅性比較がない。検索経路を増やしても、すべての小問に信頼できる根拠が見つかるとは限らない。

### Amplitude Wave：セッションの再生から課題を見つけ、A/Bテストで検証

<a id="radar-amplitude-wave"></a>

- 出典：OpenAI／Amplitude
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-12
- リンク：https://openai.com/business/customer-stories/amplitude
- 要約：AmplitudeはWaveで利用データ、セッションの再生、フィードバック、コードをまとめ、コーディングエージェントに渡せる変更案を作る。紹介事例では、ホーム画面の汎用的な提案を最近の利用状況に応じたものへ変更し、人のレビューを経て実装した。同社によるとA/Bテスト開始から1日後、提案カード経由の送信数は対照群より160%増えた。全体のエンゲージメントや長期の継続率が上がったこと、他の変更でも同じ効果が得られることを示す数字ではない。

<!-- radar-visual:amplitude-card-proposal -->
[![Amplitudeホーム画面の汎用提案と、最近の利用状況に合わせた提案の比較](<https://images.ctfassets.net/kftzwdyauwt9/3LjZcXouhYtaCOBh1oGfTt/9dc30c9597dbff3dd6174b34b4c907c6/amplitude-wave-personalized-suggestions.png>)](<https://images.ctfassets.net/kftzwdyauwt9/3LjZcXouhYtaCOBh1oGfTt/9dc30c9597dbff3dd6174b34b4c907c6/amplitude-wave-personalized-suggestions.png>)

*上段のカードは最近の操作に依存しない。下段の提案では各カードが対応するグラフやダッシュボードに結び付く。画面変更の例で、実験結果のグラフではない。 画像出典：[OpenAI／Amplitude](https://openai.com/business/customer-stories/amplitude)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:amplitude-card-proposal -->

## 産業とガバナンス

### 『持械入宋』：制作工程を短縮できても、配信と精算は別の話

<a id="radar-red-fruit-ai-drama"></a>

- 出典：老范讲故事
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-13
- リンク：https://lukefan.com/2026/11/13/chi-xie-ru-song-red-fruit-ai-drama
- 要約：公開インタビューをもとに、番茄小説での作品選定と翻案、即夢での映像生成、紅果での配信を一つの事例として整理した記事。キャラクター、背景、小道具の共有は離れた場所で働く小チームの協業を助ける。著者はこの人気作品をプラットフォームのショーケースと見る。制作手順は参考にできても、推薦、成果として計上される視聴、精算は別の工程だ。広告出稿の帳簿や収益を独立に確認しておらず、全体の再生回数から利益は推定できない。

## 深掘り

### Every：戦略を並行で試し、繰り返して勝ち方の安定性を測る

<a id="radar-every-strategy-simulation"></a>

- テーマ：構築と運用
- 出典：Every／Mike Taylor
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-12
- リンク：https://every.to/also-true-for-humans/the-next-two-levels-of-ai-adoption
- 要約：Taylorはオーケストレーションの次を二段階に分ける。共通の目標と採点ルールのもとで複数チームが異なる戦略を試し、同じ初期条件で繰り返してどの戦略が安定して勝つかを調べる。関心は「作業をどう任せるか」から「どの戦略を採るべきかをどう確かめるか」に移る。計算負荷が増える実験的な枠組みであり、評価指標やシミュレーションに偏りがあれば、繰り返しても現実での優位性は証明できない。
