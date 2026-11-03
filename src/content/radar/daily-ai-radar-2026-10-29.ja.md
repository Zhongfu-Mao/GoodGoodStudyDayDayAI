---
title: "AIレーダー日報：2026-10-29"
date: 2026-10-29
category: radar
cadence: daily
radarFormat: 2
lang: ja
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-29.ja.mp3
audioDuration: 1347
audioSize: 10773295
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
coverImage: /images/radar/daily-ai-radar-2026-10-29.ja-infographic.webp
draft: false
tags: []
---

対象期間：2026年10月28日12:00～10月29日12:00（日本時間）。新発表と既存技術の解説を分け、期間外の3件は初出日を残して深掘りする。

## 今日の重要な変化

- [GoogleがGemini 4 Carbonを発表、限定的展開を実施](#radar-gemini4-carbon)
- [LangChainがOpenWikiと証拠グラフによる記憶検証を公表](#radar-openwiki-graph-memory)
- [Octoverse 2026報告：活動急増の集計手法と因果の限界](#radar-octoverse-methodology)

## 能力とエビデンス

### GoogleがGemini 4 Carbonを発表、限定的展開を実施

<a id="radar-gemini4-carbon"></a>

- 出典：Google
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
- 要約：Googleは28日、Gemini 4 Carbonを発表し、Artificial Analysis知能指数v5.0で59点と報告した。脆弱性発見・悪用検証・修正の外部ベンチマークは88.2％・54.8％・71.0％だが、防護を外した評価であり、防護付き製品の成績を直接予測しない。社内の長期工程や安全性改善も第一者の結果として読む。まず一部の防御担当者に提供し、Fairwindで信頼された協力先へ段階的に広げる計画で、一般の開発者・企業・消費者への提供は今後だ。開始時の予定価格は100万入力token当たり2ドル、出力10ドル。米政府の自発的な事前テストへの参加も、試験完了やリスク認証を意味しない。

<!-- radar-visual:carbon-secbench -->
[![Google掲載のSEC-bench Pro脆弱性検出Pass@1を比較した棒グラフ](<https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini_4_carbon_secbench-pro.width-1200.format-webp.webp>)](<https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini_4_carbon_secbench-pro.width-1200.format-webp.webp>)

*縦軸はSEC-bench ProのPass@1で、Carbonは88.2％を示す。Googleが公表したガードレールなしの特定評価であり、本番での成功保証ではなく、利用も一部の防御担当者と信頼された相手へ段階的に進めるため全ユーザーへの提供済みとは限らない。 画像出典：[Google／Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:carbon-secbench -->

### NVIDIAがNemotron 3.5 Transcribeとデータ基盤を公開

<a id="radar-nemotron-transcribe"></a>

- 出典：NVIDIA
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://huggingface.co/blog/nvidia/nemotron-transcribe-granary
- 要約：NVIDIAはNemotron 3.5 TranscribeとGranary v2のデータ処理基盤を公開した。同じチェックポイントで40言語の文字起こし、31言語と英語の相互翻訳、13言語の話者ラベルに対応し、最大1時間・8話者を扱う。音声質問応答の学習・評価範囲は主に英語だ。自然言語で形式や用語を指定し、NeMoで領域向けに調整できる。医療事例の単語誤り率45.8％削減は、未学習の話者を使った評価で最良のプロンプトと比較した相対値であり、全用途への保証ではない。公開Granary v2の仕様をモデル全体の学習混合比と同一視せず、ローカル利用でも機材・ライセンス・データ処理範囲を確認したい。

## 構築と運用

### 技術解説：DeepSeekがKVキャッシュをSSD配置する理由

<a id="radar-deepseek-kv-disk"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-28
- リンク：https://blog.dailydoseofds.com/p/why-deepseek-stores-its-kv-cache
- 要約：28日のDaily Doseは、再利用するKVキャッシュをSSDに置くDeepSeekの既存設計を解説した。当日の新モデル発表ではない。比較はSSDからの復元とGPUでの前置文再計算であり、SSDがGPUメモリより速いという話ではない。MLAで保存状態を小さくし、3FSでSSDから並列に読み出し、層の計算と重ねることで反復prefillを減らす。記事の128K前置文で13秒から500ミリ秒という初回応答例も、全ハードウェア・全要求へ一般化できない。実用では命中率、状態量、I/O帯域、再計算費を合わせて見る必要があり、共有できる前置文がなければ同じ利益は得られない。

### 設計分析：UberによるAIエージェント向けMCP網羅基盤

<a id="radar-uber-agent-gateway"></a>

- 出典：ByteByteGo／Uber Engineering
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-28
- リンク：https://blog.bytebytego.com/p/how-uber-built-a-gateway-for-ai-agents
- 要約：ByteByteGoはUberのMCP Gatewayを制御プレーンとデータプレーンに分けて解説する。Registryはツール定義・所有者・設定を管理し、Proxyは呼び出しを既存のHTTP、gRPC、TChannelサービスへ変換する。AutoCrawlerはIDLやネイティブMCPから定義を発見するが、新規ツールは既定で無効で、所有チームが確認・承認して提供する。内部アクセス制御を適用し、ツール単位の認可や応答内PIIの削除にも対応する。外部サービスでは内部IDと外部tokenを仲介する。これらは運用の境界を作る設計であり、漏えいを完全に防ぐ実証ではない。 [Uber Engineeringの原文](https://www.uber.com/in/en/blog/designing-mcp-gateway/)も参照。

<!-- radar-visual:uber-gateway-plane -->
[![呼出元から入口と中間層を経てツール実行とプロトコル変換で下流サービスへつなぐUber MCPの六層構成](<https://cn-geo1.uber.com/image-proc/resize/udam/format=auto/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy80MmRmYmNjMy02MmY4LTQ0YzAtOGMxZi1jYWFlZGNmYTg2N2MucG5n>)](<https://cn-geo1.uber.com/image-proc/resize/udam/format=auto/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy80MmRmYmNjMy02MmY4LTQ0YzAtOGMxZi1jYWFlZGNmYTg2N2MucG5n>)

*左上の呼出元から入口へ下り、流量制御・応答の機微情報除去・認可を経て、右のツール解決・検証・実行とThrift、HTTP、gRPC、MCPの変換へ進む。公式のデータプレーン図であり、登録と所有者承認は別の制御プレーンに属するため、矢印だけで権限が自動承認されるわけではない。 原図は[Uber Engineering](https://www.uber.com/in/en/blog/designing-mcp-gateway/)。 画像出典：[Uber Engineering（ByteByteGo所引原文）](https://blog.bytebytego.com/p/how-uber-built-a-gateway-for-ai-agents)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:uber-gateway-plane -->

### LangChainがOpenWikiと証拠グラフによる記憶検証を公表

<a id="radar-openwiki-graph-memory"></a>

- 出典：LangChain
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://www.langchain.com/blog/building-agent-memory-openwiki-graphs
- 要約：LangChainは合成した111件の保険文書・972事実で検索とOpenWikiを比較した。モデルと質問を固定し、文書横断の50問ではWikiで精度が0.10から0.52へ上がったが、3回の引用集合の重なりは0.25だった。引用を段落へ結び、citesやsupersedesなどの型付き辺でたどる証拠グラフを追加する。構築時に追加モデル呼び出しは不要でも、元のモデル生成引用の正しさには依存する。グラフ追加後の精度27％向上・引用一貫性2倍・正答費用58％削減はこの合成実験の結果だ。単一箇所の検索は精度が増さず遅く、報告費用は編纂・更新を除くため、再利用と維持費が判断を分ける。

<!-- radar-visual:openwiki-evidence -->
[![OpenWikiページとclaimを段落へ結び版の置換や文書間参照を示す証拠グラフ](<https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ae0e1c8ea9b434fb2072ec8_Evidence%20graph%20structure.png>)](<https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ae0e1c8ea9b434fb2072ec8_Evidence%20graph%20structure.png>)

*Wikiページからclaimとcitesをたどって具体的な段落へ進み、2024年版が2018年版を置き換えるsupersedesと、別文書へのrefers_toを分けて読む。合成保険文書の研究で示した証拠探索の例であり、企業の全知識を検証済みとする図ではない。 画像出典：[LangChain](https://www.langchain.com/blog/building-agent-memory-openwiki-graphs)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:openwiki-evidence -->

### LangChainがManaged Deep Agents向け定期実行SDKを発表

<a id="radar-proactive-agent-schedules"></a>

- 出典：LangChain
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://www.langchain.com/blog/proactive-agents
- 要約：LangChainはManaged Deep AgentsのSchedules SDKで、能動型エージェントを支える定時処理を説明する。「70％超」はLangSmith上のManaged Deep Agent実行を指し、全プラットフォームや業界全体の比率ではない。会話を記憶へまとめ、情報流を点検し、通知や非同期作業の進捗確認を行う。予定の提示文が、作成主体に対応するスレッドと記憶で実行され、作成・一覧・削除のSDK例はownerを渡す。安定したサーバー、負荷をずらす処理、統治された操作口も必要だ。定期起動の仕組みだけを外部操作の安全保証とせず、道具の権限と承認範囲は導入時に別途検証したい。

## プロダクトと実際の導入

### 業界分析：AnthropicのS-1申請から見るモデル更新周期

<a id="radar-model-shelf-life"></a>

- 出典：Every／Grant Harvey
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-28
- リンク：https://every.to/context-window/every-model-has-a-six-month-shelf-life-now
- 要約：Everyは2026年10月28日、Grant Harveyによる「すべてのモデルの寿命は6ヶ月」と題した分析記事を掲載した。Anthropicの新規上場申請書類（S-1）を分析し、公開から6ヶ月以上経過した同社モデルの収益シェアが20％未満に低下している実態を指摘した。しかし、これはユーザーの乗り換え速度と事業リスクを論じた論評・主観分析であり、モデルが技術的に6ヶ月で機能停止・失効するという物理的・法的規則ではない。記事では2028年に年間約1550億ドルの計算資源コミットメントを抱える中、新世代の差別化が鈍化した場合の経営リスクが警告されている。

### OpenAIとServiceNowが連携拡大：現行機能と将来構想

<a id="radar-servicenow-workflows"></a>

- 出典：OpenAI／ServiceNow
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://openai.com/index/openai-servicenow-partnership-expansion
- 要約：OpenAIとServiceNowは2026年10月28日、企業向けワークフロー統合の拡大を発表した。ここでは現行の提供機能と将来計画の区別が不可欠である。即日利用可能なのはOpenAIマーケットプレイスで提供開始されたServiceNow MCPプラグインであり、Action Fabricの権限下でChatGPTから直接障害対応が可能（年内に追加機能予定）。一方で、Super Intelligence Control Towerの音声機能は2027年第1四半期、共同セキュリティ機能は2027年1月早期アクセス／第2四半期一般公開、AI Workflow FactoryへのCodex統合は2027年中と将来の予定である。

### 導入事例：Legoraが法務エージェント基盤を構築

<a id="radar-legora-legal-agents"></a>

- 出典：OpenAI／Legora
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://openai.com/index/legora
- 要約：OpenAIはLegoraの法務導入事例を紹介した。同社の法務は過去のNDAからプレイブックを作り、新契約で外れた条件を先に抽出する。法務責任者の見積もりでは、この業務がチームの稼働の約20％から1％未満になったのであり、1契約の時間を独立測定した値ではない。Tabular Reviewは多数の契約を複数の問いで整理し、弁護士が確認・解釈する。CEOはFortune 100の1顧客について外部訴訟・調査費2000万ドル超の削減も挙げる。いずれもベンダー側の事例で一般的な収益保証ではない。初期点検を広げて専門家が判断する接続が参考になり、百万ページを夜間処理する話は今後の構想だ。

### 著者検証：バイブコーディングによるブラウザゲーム試作

<a id="radar-vibe-game-prototypes"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-10-28
- リンク：https://simonwillison.net/2026/Oct/28/vibe-game-development/
- 要約：Simon Willisonは2026年10月28日の個人ブログで、コードを見ずに自然言語指示のみで開発する「バイブコーディング」によるゲーム制作の実験記録を公開した。Claude Opus 5.5とThree.jsを用い、『Tree Appreciator』やRPG『Emberwick』など4つのブラウザゲームを試作し、面白さの設計における転換点を主張した。しかしこれは著者の個人環境によるプロトタイプ実験に過ぎず、商用プロダクションに耐えうるゲーム制作の証明ではない。Tree Appreciatorは一度の提示で完成した一方、Emberwickは物語の進行不具合などを反復修正した。4作すべてが一発生成だったわけではない。

## 産業とガバナンス

### Octoverse 2026報告：活動急増の集計手法と因果の限界

<a id="radar-octoverse-methodology"></a>

- 出典：GitHub Octoverse／Simon Willison
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-28
- リンク：https://github.blog/news-insights/octoverse/octoverse-commits-pushes-reach-new-highs-in-2026-as-developers-build-with-agents/
- 要約：GitHubは2026年10月28日、2026年版Octoverseレポートを公開した。年間プッシュ数は179億回と過去2年分の合計を超え、コミット数は343億回に達し、エージェント設定を持つ新リポジトリの平均コミット数は非設定の新規リポジトリの8倍を記録した。分析手法としてVPN影響を補正するLLMプロファイル所在地重み付けや、ユーザーが能動選択したCopilotリクエストのみを集計する規約が明記されている。ただし留意すべきは、これらはプラットフォーム上の活動ログ・操作カウントであり、エージェントが開発者の実質的な生産性を直接向上させたという独立検証された因果関係の証明ではない。

### 試論考察：企業の未来像と組織再編に関する条件付き仮説

<a id="radar-future-of-firm"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：見解・推論
- 初出日：2026-10-28
- リンク：https://openai.com/index/the-future-of-the-firm
- 要約：OpenAI公式サイトは2026年10月28日、若手社員2名による論考『企業の未来』を掲載した。冒頭でOpenAIの公式見解ではなく著者個人の私見であると明記されている。本稿はAI導入による組織再編を「下位層（全社員がAIの管理者となる）」「並行層（同僚として協働）」「中間層（経営と現場の調整役）」の3つのシナリオで提示した。極めて重要なのは、予測が確定事項ではなく、とくに雇用を残すシナリオには条件がある点だ。人類の労働が生産に対して付加価値を生み続けられるか、そして社会全体の消費意欲が飽和せず拡大し続けるかという経済的前提に強く依存した試論である。

## 深掘り

### 26日の原稿を補読：有限単純群分類の形式化は仕様と依存関係まで確認

<a id="radar-axiom-cfsg-deep"></a>

- テーマ：能力とエビデンス
- 出典：Axiom Math
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://axiommath.ai/research/the-enormous-theorem-formalized/
- 要約：Axiomは26日、有限単純群分類定理をLeanで形式化したと発表した。本期は旧原稿の深掘りとして扱う。同社は約4310万行のLeanコードと24日間の作業を報告し、分割や検証の進め方も説明する。証明支援系が推論を検査することと、記述した定義・命題・最終定理が数学的な目標に一致するかを人が調べることは別だ。原稿では途中の仮定の誤りを発見・修正した例も扱い、それを分類定理そのものの反証と解釈しない。規模と速度は第一者の記録であり、主定理の依存関係・未証明の前提・定義まで追い、受理されたコードや行数だけで意味の独立検証を済ませない。

### 27日の編集モデルを補読：順位は日付と用途を持つスナップショット

<a id="radar-mai-editing-deep"></a>

- テーマ：能力とエビデンス
- 出典：Microsoft AI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-27
- リンク：https://microsoft.ai/news/mai-image-2-7-debut/
- 要約：Microsoft AIは27日、MAI Image 2.7をプレビュー公開した。29日の新発表とはせず編集用途を補読する。発表時の順位はArena Editでモデル3位、Artificial Analysisの編集榜で2位であり、「研究所2位」と「モデル3位」を混同しない。同社は評価対象の10用途・7編集動作で2.6を上回り、場面とスタイル、修復、推論、文字・記号編集を挙げる。特定試験の相対性能であり、全言語の文字や毎回の編集が正しくなる証明ではない。手元の原画像、保持したい部分、文字内容で再評価し、プレビューという提供状態と順位の時点を残したい。

### 27日の創薬事例を補読：実験・工程改善と臨床効果を分ける

<a id="radar-claude-drug-development-deep"></a>

- テーマ：プロダクトと実際の導入
- 出典：Anthropic
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-27
- リンク：https://www.anthropic.com/research/early-progress-drug-development
- 要約：Anthropicの27日の原稿は6組織との連携と自社の初期創薬を紹介する。分子案だけでなく、実験データの見直し、製造書類、申請草案、試験計画にも使う。Envedaの1061ページの試験では、人が把握した11件を検出し追加7件を指摘したが、その文書群の事例であり全申請の無誤り保証ではない。BigHatの特性改善は実験室での変異体試験、Divergenceの約3万5000抗体案も選別と組合せの追加検証が必要だ。同社は大半が前臨床と明記する。マウスの結果やBMSの臨床計画支援を人体の有効性証明に変えず、最短で2028年末の人体試験も候補薬が有望さを保つ条件付きと読む。工程短縮と承認・治癒は区別したい。
