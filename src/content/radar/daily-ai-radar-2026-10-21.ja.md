---
title: "AIレーダー日報：2026-10-21"
date: 2026-10-21
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-21.ja-infographic.webp
draft: true
tags: []
plainSummary: "評価モデルは閾値を調整し、確率も用途別に検証する。 プロセスを越えた再開と副作用の冪等性を分けて設計する。 共有エージェントでは複数人の文脈と権限を実行時に扱う。"
---

2026-10-20 12:00〜2026-10-21 12:00（日本時間）の公開資料から8件を整理する。初出日、発表・実測・見解を区別し、日付未確認の実装は現在の観察として扱う。

## 今日の重要な変化

- [評価モデルは閾値を調整し、確率も用途別に検証する。](#radar-decision-model-evals)
- [プロセスを越えた再開と副作用の冪等性を分けて設計する。](#radar-next-step-after)
- [共有エージェントでは複数人の文脈と権限を実行時に扱う。](#radar-replaced-personal-agents)

## 能力とエビデンス

### 判定モデルによる自動評価：閾値・コスト・較正はタスク別に検証

<a id="radar-decision-model-evals"></a>

- 出典：Hamel Husain
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-10-20
- リンク：https://hamel.dev/blog/posts/decision-model-evals/
- 要約：賃貸仲介エージェントの本番トレース98件を使い、実質的な失敗を見つける限定タスクで6種類の判定モデルを比較した。既定の0.50閾値は常に最適ではなく、同じ小規模データ上で調整するとOpenAI DecisionsはF1が最高だがコストも高く、Perplexityは安価だった。Platt較正も一部だけを改善しており、他タスクやスループット、裾の遅延には一般化できない。

### FairStressが示すLLM意思決定の隠れた非対称性

<a id="radar-allenai-fairstress"></a>

- 出典：Hugging Face / Ai2
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-10-20
- リンク：https://huggingface.co/blog/allenai/fairstress
- 要約：Ai2のFairStressは、29分野の二者選択300シナリオを、属性表現と対抗的な前置文によって1,300万件超へ拡張した。15モデルに共通する分野では、正しい選択を撤回する平均格差が、暗示された属性で6.9ポイント、明示ラベルで9.3ポイントだった。ただし基準は対称的平等という特定の公平観に基づき、内部活性化解析も2モデルに限られる。

<!-- radar-visual:fairstress -->
[![FairStressが15モデルの属性表現と圧力条件別の平均格差を比較](/images/radar/daily-ai-radar-2026-10-21-fairstress.webp)](/images/radar/daily-ai-radar-2026-10-21-fairstress.webp)

*横軸は匿名から明示的属性へ変わる。圧力下でより適格な候補を撤回する桃色の線は、圧力なしの選択を示す濃緑の線より格差が大きい。縦軸はポイントで、ゼロ線は著者の対称的公平の定義に対応し、すべての公平観を表すわけではない。 画像出典：[Ai2 / FairStress](https://huggingface.co/blog/allenai/fairstress)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:fairstress -->

## 構築と運用

### ALTK-Evolve、軌跡から学ぶ指針でτ²-benchエージェントを改善

<a id="radar-altk-evolve-bc"></a>

- 出典：Hugging Face / IBM Research
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-10-20
- リンク：https://huggingface.co/blog/ibm-research/altk-evolve-bc
- 要約：IBM ResearchのALTK-Evolveは、訓練タスクの軌跡から行動指針を抽出し、重みを更新せずシステムプロンプトへ追加する。τ²-bench小売の完全なbase splitを使ったランキングのスナップショットでは、GPT-4.1エージェントがPass^4 67.5%で首位となった。Pass^4は4回とも成功したタスクの割合であり、これは留保したテスト分割の成績でも実顧客対応全般の保証でもなく、航空では最適な指針量も異なり、主な追加負担は入力トークンだった。

<!-- radar-visual:altk-cost -->
[![ALTK-Evolveの小売・航空別、指針構成ごとの会話単価](/images/radar/daily-ai-radar-2026-10-21-altk-cost.webp)](/images/radar/daily-ai-radar-2026-10-21-altk-cost.webp)

*左が小売、右が航空で、灰色は指針なしの基準。青いLosslessは学習した全指針を残す構成を指し、長い入力で費用が増える。GPT-4.1、完全なbase split、4試行という著者の設定で、本番費用の保証や圧縮方式の「可逆性」を意味しない。 画像出典：[IBM Research / ALTK-Evolve](https://huggingface.co/blog/ibm-research/altk-evolve-bc)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:altk-cost -->

### 長い承認待ち後に同じ呼び出しを再開し、冪等記録で副作用の重複を抑える

<a id="radar-next-step-after"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の実測
- 初出日：2026-10-20
- リンク：https://blog.dailydoseofds.com/p/the-next-step-after-karpathys-agentic
- 要約：Daily DoseとGoogle Cloudの提携デモは、ADKで会話・呼び出し・検索根拠・承認要求を永続化し、別プロセスから同じ呼び出しを再開する。公開ツールは回答と引用から冪等キーを作り、重複承認には既存結果を返す。SQLiteからAgent Runtimeの会話サービスへ移した例だが、ローカルoutboxは模擬実装であり、本番ではDBまたは実際の副作用APIとの接続が必要。検索スコアの閾値も幻覚を保証して防ぐものではない。

## プロダクトと実際の導入

### 継続追跡｜Every、個人エージェントを全社共有型へ再構築

<a id="radar-replaced-personal-agents"></a>

- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：著者の実測
- 初出日：2026-10-20
- リンク：https://every.to/source-code/why-we-replaced-personal-agents-with-one-for-the-whole-company
- 要約：Everyは個人向けPlus Oneから全社共有のEvery Agentへ移行した工程を振り返る。Slackの変換層で複数人のスレッド文脈を保ち、交換可能な接続スロットで退職者の認証に依存する停止を防ぎ、所有権・権限・同意確認をサーバー側コードで強制した。一方、共有スキルを誤って非公開化した事例や自発発言の未解決課題もあり、開発チーム自身の経験であって組織横断の効果研究ではない。

<!-- radar-visual:every-slots -->
[![Everyの接続スロット図は定期タスク、安定スロット、交換可能なログインを分離](/images/radar/daily-ai-radar-2026-10-21-every-slots.webp)](/images/radar/daily-ai-radar-2026-10-21-every-slots.webp)

*定期タスクは安定した接続スロットを参照し、同じワークスペースとアクセス条件に合うログインだけが交換接続できる。右側の別ワークスペースは拒否される。原文の簡略図であり、ログイン交換は権限の無条件な継承を意味しない。 画像出典：[Every / connection-slot design](https://every.to/source-code/why-we-replaced-personal-agents-with-one-for-the-whole-company)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:every-slots -->

### Terminal X、評価エージェントが上級投資家判断と88.6%一致と発表

<a id="radar-terminal-x"></a>

- 出典：OpenAI / Terminal X
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-20
- リンク：https://openai.com/index/terminal-x
- 要約：OpenAIの事例によると、Terminal Xは機関投資の手順を監査可能なエージェントと版管理されたMemoryに落とし込み、54項目の基準で出力を評価する。採点済み500判断では、GPT-6.1 Solを使うEval Agentと上級人間レビュアーの一致率が88.6%だった。この値は当該品質審査での一致率に限られ、投資収益やリターン、顧客対応の成果を示さず、節約額や利用規模も事業者の申告である。

### 3店舗の加盟店がChatGPT Workでバックオフィス作業を短縮

<a id="radar-ted-taylor-restaurant"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-20
- リンク：https://openai.com/index/ted-taylor-restaurant
- 要約：OpenAIの事例は、共同ブランドの飲食店3店舗を営む加盟店主の利用例を紹介する。月次の現金照合は3時間から5〜10分へ短縮され約94%減、給与計算では別途、各サイクル4時間の手作業を削減した。価格設定、規程草案、修繕申請にも使う。一方、シフト改善で売上比1〜2ポイントの人件費を減らせるという見通しと資金効果は店主の推計で、実現済み・監査済みの成果ではない。

## 産業とガバナンス

### SF Computeが語るGPU計算市場の現物受渡しと異質性

<a id="radar-sfcompute2"></a>

- 出典：Latent.Space
- 情報経路：ポッドキャスト、Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-20
- リンク：https://www.latent.space/p/sfcompute2
- 要約：Latent SpaceのインタビューでSF ComputeのCEOは、停止耐性、ストレージ復旧、ネットワーク、GPU世代、製造ロットが価値を左右すため、GPU契約は利用可能な計算資源の現物受渡しを基礎にすべきで、単一の現金決済指数にはベーシスリスクがあると主張した。同社は総容量の約5%が板に載り、取引額は数億ドル、InfiniBandの動的分割も可能と説明するが、規模や中立性は本人の説明で独立監査されていない。
