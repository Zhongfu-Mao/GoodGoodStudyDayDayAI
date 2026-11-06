---
title: "AIレーダー日報：2026-11-04"
date: 2026-11-04
category: radar
cadence: daily
radarFormat: 2
lang: ja
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-04.ja.mp3
audioDuration: 1019
audioSize: 8148930
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
coverImage: /images/radar/daily-ai-radar-2026-11-04.ja-infographic.webp
draft: false
tags: []
description: "状態追跡、スライド生成、性能改善とブラウザ道具設計から、企業での責任境界まで。"
plainSummary: "同じモデルでも周囲の設計で結果は変わる。何を測り、何を人が確認し、どこまでが実装済みかを分けて読む。"
---

対象期間は2026年11月3日12:00から11月4日12:00（日本時間）。新しい研究・解説・導入事例を扱い、研究条件、第一者の報告、将来計画を区別する。

## 今日の重要な変化

- [StateBench：長文を検索できても、状態変化を追えるとは限らない](#radar-statebench)
- [Palette：スライド仕様を先に固定し、並列でコード化して修復する](#radar-palette-decks)
- [ブラウザAgentの道具設計：動作の束ね方、簡潔な観察、条件付き待機](#radar-browser-tool-design)

## 能力とエビデンス

### StateBench：長文を検索できても、状態変化を追えるとは限らない

<a id="radar-statebench"></a>

- 出典：Ai2 / StateBench
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-03
- リンク：https://huggingface.co/blog/allenai/statebench
- 要約：Ai2は状態追跡を、不変の代入、値の上書き、累積更新、変数間の参照・交換という四段階に分けた。同じ系列から四種類の問題を作り、変数数と更新位置をそろえて比較する。評価した最先端モデルは簡単な二段階では良好だが、最長の一般有限状態問題では正答率が13%以下になった。長文タスク全体の正答率ではない。一方、この課題で直接学習した2.75億パラメータの循環・混合モデルは、通常の事前学習モデルと異なる外挿を示す。検索、逐次計算、学習条件を分ける必要がある。現行の枠組みは変数数を固定し、新しい登場人物などが増える実会話はまだ扱わない。

<!-- radar-visual:statebench-frontier -->
[![四種の状態追跡における最先端モデルの正答率と入力長の関係](<https://www.datocms-assets.com/64837/1792006435-statebench-draft-blog-google-docs-image-3.png>)](<https://www.datocms-assets.com/64837/1792006435-statebench-draft-blog-google-docs-image-3.png>)

*横軸は入力token長で、四列は不変の代入から一般有限状態へと難しくなる。同じ行で比べると、単純な検索が安定しても依存更新の追跡は崩れ得ると分かる。StateBenchの合成課題と評価条件での結果で、長文アプリ全体の順位ではない。 画像出典：[Ai2 / StateBench](https://huggingface.co/blog/allenai/statebench)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:statebench-frontier -->

### ローカルQwenがゲームの重みを読む：再現したことと、していないこと

<a id="radar-local-weight-reading"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-11-03
- リンク：https://simonwillison.net/2026/Nov/3/qwen-can-interpret-model-weights/
- 要約：Simonは公開された完全なプロンプトを使い、簡略化ゲームの方策ネットワークの浮動小数点重みを、ノートPC上のQwen 3.8 27Bへ渡した。計算ツールなしで四例中Pac-Man、Pong、Breakoutを識別し、Freewayは誤った。成功例でも約46～65分を要し、即時診断ではない。四つのプロンプトは重み以外が同じと確認したが、小さく固定されたゲームでの実験である。再現したのは重みから動作を推測する限定的な部分であり、コードで別モデルの重みを書き換えて数学成績を改善する実験ではない。一般的な再帰的自己改善の実現とも区別したい。

### CADから製造へ：OpenAIの工学実験と、公差・組立の課題

<a id="radar-physical-engineering"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-03
- リンク：https://openai.com/index/accelerating-engineering-for-the-physical-world
- 要約：OpenAIは、筐体、PCB、ファームウェア、シミュレーションをまたぐ設計実験を紹介した。二人のメンバーが副業的に一週間未満でCodexへ接続する機器を設計し、委託先が一か月未満で少量の試作を製造したという。ただし製造準備には複数回の審査が必要で、製造制約、公差、組立の細部をモデルは安定して扱えなかった。Mazdaとの空力・衝突安全ワークフローの研究も発表したが、成果は今後の報告となる。内部新モデルのBenchCAD 2.0での進歩は特定の設計課題の評価であり、工学の全工程の自動化ではない。正確性、製造可能性、安全性は協力先の技術者が確認する。

## 構築と運用

### Palette：スライド仕様を先に固定し、並列でコード化して修復する

<a id="radar-palette-decks"></a>

- 出典：IBM Research / Palette
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-03
- リンク：https://huggingface.co/blog/ibm-research/palette-deck-building
- 要約：IBMのチームは20BモデルをLoRAで調整し、設計者と実装者の二役を担わせた。設計者が計画を編集可能なJSON仕様にし、実装者は一枚ずつpptxgenjsコードを生成する。合成データには採用しなかった案と理由も含め、事実の逸脱には指示の追加だけでなく参照例の修正で対応する。描画後に重なり、切れ、はみ出しを測り、検査器が改善と判定した修復だけを残す。131件のPresentBenchデッキで平均3.5点の改善と報告するが、その検査器と評価条件での結果であり、事実全体の正しさは保証しない。三分野平均はNotebookLMをわずかに下回り、特定のデザイン言語への忠実度を測る基準も未整備だ。

<!-- radar-visual:palette-pipeline -->
[![計画をJSON仕様にし、スライドごとに並列でコード化してHarnessが検査・修復する流れ](<https://cdn-uploads.huggingface.co/production/uploads/63890e3843d8b0797a0ad606/PZoiyAFg_nrWRryQhjGN_.png>)](<https://cdn-uploads.huggingface.co/production/uploads/63890e3843d8b0797a0ad606/PZoiyAFg_nrWRryQhjGN_.png>)

*中央のBriefで内容と配置を先に決めてから、一枚ずつ並列でコードを書く。右の規則修正、描画後の幾何検査、問題ページの修復は別の層である。「改善した修復だけ残す」は検査器の測定範囲内の話で、事実全体の自動証明ではない。 画像出典：[IBM Research / Palette](https://huggingface.co/blog/ibm-research/palette-deck-building)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:palette-pipeline -->

### Netflixの性能Agentを読む：改善は実測テレメトリで確かめる

<a id="radar-netflix-performance"></a>

- 出典：ByteByteGo
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-11-03
- リンク：https://blog.bytebytego.com/p/how-netflix-uses-ai-agents-for-performance
- 要約：ByteByteGoは公開資料からNetflixの性能改善フローを解説する。本番のプロファイルからホットスポットを探し、パッケージ接頭辞で分析対象をアプリコードへ絞って、変更できないOSやフレームワークの雑音に推論を費やさない。修正案は既存テストを通した後、基準版とのカナリア比較でCPU、遅延、エラー率、割り当てを測り、コード、フレームグラフ、報告を技術者へ渡す。繰り返しのマップ構築、ホットパスの正規表現、計測オブジェクトの探索などをパターンとして蓄積し、別サービスでも使う。二次的な技術解説であり、個別の利益を任意のサービスへ一般化できない。関連するNetflixの講演紹介も、モデルの自信ではなく測定結果による検証を強調する。

### FrameworkとHarness：再開できる作業状態は会話要約だけに置かない

<a id="radar-framework-harness"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-11-03
- リンク：https://blog.dailydoseofds.com/p/agent-framework-vs-agent-harness
- 要約：新しい教材は二つの層を分ける。フレームワークはモデル、ツール、状態、編成の部品を提供し、Harnessはツールループ、ファイル環境、記憶、進捗の約束を組み立てる。排他的な選択ではなく、LangGraphのグラフにも自由度のあるAgentループを入れられ、Deep Agentsはその上の層にある。長い仕事では変更履歴、テスト結果、残件を別々の確認可能な成果物として残す。チャットを保存するだけでは再開時の状態を誤認し得る。外側のワークフローが権限と結果を管理し、内側のAgentが限定された工程を調べる。途中で意図的に止めて再開し、重複作業、失敗の見落とし、証拠のない完了宣言がないかを試す方が、成功デモだけより有効だ。

<!-- radar-visual:framework-harness-comparison -->
[![左は部品から組むフロー、右はモデルの周囲にツール・文脈・記憶・子Agentを配置する模式図](<https://substack-post-media.s3.amazonaws.com/public/images/0e36d4fa-98f8-40dc-a6d0-f2925369482c_900x900.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/0e36d4fa-98f8-40dc-a6d0-f2925369482c_900x900.png>)

*左は状態と分岐を自分で組み、右は既存の実行ループを設定する違いを示す。役割の模式図であり、「フレームワークは固定フローだけ、Harnessだけが自由な課題を扱える」という二分法ではない。フレームワークにもAgentループを含められ、権限と完了基準はアプリ側が担う。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/agent-framework-vs-agent-harness)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:framework-harness-comparison -->

### ブラウザAgentの道具設計：動作の束ね方、簡潔な観察、条件付き待機

<a id="radar-browser-tool-design"></a>

- 出典：LangChain
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-11-03
- リンク：https://www.langchain.com/blog/how-we-optimized-browser-use-for-deep-agents
- 要約：LangChainはモデルと課題を固定して七種類のブラウザ道具を比較し、実行履歴を読んで設計を改良した。Claude Sonnet 5.5による100件のWebVoyagerではStagehandが90%、Playwright MCPが78%を通過したが、すべてのサイトやモデルに共通する順位ではない。一回のrunで確定済みの動作列を実行し、中間状態を変数に残して必要な結果だけをモデルへ返す。観察も元で簡潔にし、後から強制的に切って再取得を誘発する方法とは区別する。固定sleepをページが静まった時点で早く終える方式も難しい課題で再評価した。往復、文脈、待機を別々に測る考え方であり、短い応答だけでは成功を証明できない。

### 人の評価は会話単位で：異常の印だけでなく、理由を残す

<a id="radar-human-review-context"></a>

- 出典：LangChain
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-03
- リンク：https://www.langchain.com/blog/human-insight-strategic-advantage-agents
- 要約：LangChainは人のフィードバックを、品質の定義、文脈を踏まえた判断、再利用できる評価データ化に分ける。自動採点は疑わしい履歴をキューへ送り、専門家が会話全体、ツール呼び出し、実際の結果を見て点数と理由を残す。一文が正しくても、以前の条件に反することがある。Fetch Rewardsの事例では利用者が実際に使えるオファーや商品カード画像まで確認し、流暢だが使えない提案を見分ける。注釈は評価モデルの調整、基準の修正、ゴールデンデータ作成へつなげる。供給元の方法論と顧客事例であり、人のラベルの無謬性を示す実験ではない。不一致時は評価器が誤った行動を報酬化していないかも調べたい。

### Warpのソフトウェア工場論：宣言的設定、集中トレース、評価ループ

<a id="radar-warp-factory-interview"></a>

- 出典：Latent.Space / Zach Lloyd
- 情報経路：ポッドキャスト
- エビデンス区分：著者の説明
- 初出日：2026-11-03
- リンク：https://www.youtube.com/watch?v=LL0YmIyBKSU
- 要約：Warp創業者Zach Lloyd氏はソフトウェア工場を、道具の寄せ集めではなく測定できるクラウドAgentシステムと捉える。ワークフロー、ツール、権限を設定で表し、異なる入口からの実行履歴を集め、採点器と自社タスク集合で費用、正しさ、失敗パターンを比べる。Agentが工場設定への変更PRを提案する構想もあるが、すべての変更を自動承認する意味ではない。会話で挙げたPRの自動再生検証はまだ未実装で、公開済み機能として扱えない。小規模、成長中、独自性の強い大企業では導入負担が違う。費用や処理量の数字は内部利用についての話者の説明で、独立評価でも、同じ利益の保証でもない。

## プロダクトと実際の導入

### LangSmith BYOCが三クラウドへ：自社データ平面と供給元の制御平面を分離

<a id="radar-langsmith-byoc"></a>

- 出典：LangChain
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-11-03
- リンク：https://www.langchain.com/blog/langsmith-byoc-aws-gc-azure
- 要約：LangSmith BYOCはトレース、プロンプト、データセット、デプロイ、ワークスペースの秘密を顧客のクラウドアカウント内に置き、LangChainがデータ平面を運用する。AWSはGA、AzureとGoogle CloudはBetaである。認証、組織設定、課金メタデータ、ハッシュ化API鍵などは供給元の制御平面に残り、Google Cloudの初期版は米国の制御平面で管理される。自社クラウド内だから全情報と管理権限が境界内に閉じるわけではない。移行も分かれ、公開ツールはユーザー、データセット、実験、プロンプトを扱い、トレースとフィードバックは内部ツールで別途移す。トレース移行は現時点でAWSだけに対応する。運用負担の軽減と、権限・地域・責任境界の確認を一緒に考えたい。

### Heimstadenの事例：賃貸業務を分解し、専門家が方法と承認を保つ

<a id="radar-heimstaden-workflow"></a>

- 出典：OpenAI / Heimstaden
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-03
- リンク：https://openai.com/index/heimstaden
- 要約：OpenAIは住宅運営企業Heimstadenの導入を紹介した。家賃提案、広告画像、物件文、品質確認、市場からの反応を工程ごとに支援し、従業員が判断を確認・承認する。環境分析担当者はCodexでデータの発見、洗浄、標準化を進め、20,112件の資産を評価したが、方法と検証は本人が管理した。オランダで仮想家具配置の画像一枚の費用が約50ユーロから0.10ユーロ未満へ下がったというのは、特定の制作工程についての第一者の説明であり、賃貸全体の費用や利益の変化ではない。複数システムを結ぶ調達基盤は導入中で、MCP対応の物件管理も次段階の構想だ。「自律運営する建物」という目標を現状と混同しない。

## 産業とガバナンス

### CUGAの比較：同じモデルでも設定は異なり、得点は規則の検証ではない

<a id="radar-cuga-harness"></a>

- 出典：IBM Research / CUGA
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-03
- リンク：https://huggingface.co/blog/ibm-research/cuga-harness
- 要約：IBMチームはGLM-5.3-flashを固定し、AppWorldの30シナリオ・90課題で各一回だけ実行した。CUGA、Hermes、Deep Agentsはそれぞれ73、42、27課題を通過したが、CUGAにはAppWorld専用設定があり、三者の設定は同一ではない。一つの基準の小標本で、汎用Harnessの順位にはできない。CUGAはアプリ単位で作業を分け、ツール集合を絞り、コードでAPIを呼び、ページ送りと実行結果を確認する。承認とToolGuardは実行時にツールを止め、プロンプト内の助言とは異なる。ただし今回の得点実験ではポリシーを有効にしておらず、81.1%の通過率は規則執行の検証ではない。課題能力、設定の適合、強制的な制御を別々に確かめたい。
