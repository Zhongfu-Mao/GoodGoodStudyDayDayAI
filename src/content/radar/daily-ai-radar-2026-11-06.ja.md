---
title: "AIレーダー日報：2026-11-06"
date: 2026-11-06
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-06.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-06.ja.mp3
audioDuration: 1289
audioSize: 10313749
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
---

対象期間は2026年11月5日12:00から11月6日12:00まで（日本時間）。新発表、顧客事例、過去の実務経験を区別する。ベンダー評価や顧客の報告は、独立検証と同じではない。

## 今日の重要な変化

- [Cosmos 3：ロボットの動作、シミュレーターの状態、生成観測を分ける](#radar-cosmos3-interactive)
- [GPT‑6 Cyber：脆弱性を利用する能力と、許可範囲の遵守を別々に評価](#radar-gpt6-cyber)
- [Omni 1.2 Flash：15秒動画と複数ターン編集が一般提供へ](#radar-omni12-flash)

## 能力とエビデンス

### Cosmos 3：動作に応じた観測生成は、物理シミュレーションの保証ではない

<a id="radar-cosmos3-interactive"></a>

- 出典：NVIDIA
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-11-05
- リンク：https://huggingface.co/blog/nvidia/cosmos-interactive-world-simulation
- 要約：NVIDIAはCosmos 3 Nanoを後学習した4つのチェックポイントを公開した。各モデルの学習可能パラメータは160億。Transfer-Autoは複数視点のカメラとLiDARデータをオフライン生成し、Sim-Autoは履歴と新しい制御情報から観測を小さな単位で逐次生成する。残る2種類は責任分担が異なる。Sim-Transferはシミュレーターの空間情報をRGBへ変換し、運動や接触、物理状態はシミュレーターが計算する。Sim-Bimanualはロボットやカメラの動作から次の観測を直接予測する。因果的なストリーミング生成向けの学習は、双方向適応、teacher forcing、4ステップのノイズ除去を学ぶ整合性蒸留、生成履歴を使うself-forcingの順で進み、誤差の累積に対処する。閉ループ走行には別途ランタイムとWSMレンダラーが必要で、物理的忠実性や方策学習への有効性が保証されたわけではない。単一GB200での動作確認はSim-Bimanualの公開vLLM-Omni構成であり、最低メモリー要件ではない。4つのチェックポイントはOpenMDW 1.1の条件で商用・非商用に利用できるが、無条件の許諾ではない。

<!-- radar-visual:cosmos-bimanual-input-pose -->
[![Sim-Bimanualのデモで使う両腕の初期姿勢の3D入力図](<https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/assets/bimanual/robot-yam_000-seed2025-motion.png?v=bulk-replay1-assets-20261023>)](<https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/assets/bimanual/robot-yam_000-seed2025-motion.png?v=bulk-replay1-assets-20261023>)

*格子上の色分けした腕は、プロジェクトのデモがSim-Bimanualに渡す初期姿勢を示す。次の観測を予測するための入力図であり、生成カメラ映像でも、接触や運動の物理的な正しさの証明でもない。 画像出典：[NVIDIA Cosmos Lab](https://huggingface.co/blog/nvidia/cosmos-interactive-world-simulation)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:cosmos-bimanual-input-pose -->

### GPT‑6 Cyber：能力の向上と範囲外行動のリスクを分けて見る

<a id="radar-gpt6-cyber"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-05
- リンク：https://openai.com/index/introducing-gpt-6-cyber
- 要約：OpenAIはGPT‑6 Cyberを発表し、承認済みDaybreak Red顧客の一部にAPIとCodex経由で提供を開始した。より広い提供は今後の計画である。公式ExploitGymスコアはGPT‑5.6 Cyberの32.1%から48.5%へ向上した。差は16.4ポイント、相対改善は約51%であり、51ポイントの上昇ではない。別の評価では、攻撃しやすいが許可範囲に含まれないサービスを環境内に置いた。安全プロンプトなしで99.93%、ありで100%の実行がそれらを利用しなかった。OpenAIは許可範囲を守るための専用訓練の効果と説明する。ただし、特定の評価結果であり、現実のタスクで越境しない保証ではない。Firefoxの新たな高深刻度脆弱性81件と修正候補も報告し、Mozillaは一部の修正を公開したが、全81件が修正済みとはしていない。能力、アクセス設定、サンドボックス、人の監督を組み合わせて判断する必要がある。

## 構築と運用

### 4つのBotの引継ぎ：共有ファイルにも更新責任と安全確認が必要

<a id="radar-fourbot-handoffs"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-11-05
- リンク：https://blog.dailydoseofds.com/p/finding-every-vulnerability-made
- 要約：著者は4つのBotが1台のクラウドPCを共有する開発例を示した。Piperがタスクを分解してタスク表の更新を専任し、Bayがバックエンド、Finが記録された契約に沿うフロントエンド、Tessが検証と不具合の差し戻しを担当する。引継ぎファイルにはパス、API契約、判断、未完了事項を残す。Bayは作業前に実際のデータベースとAPIを確認し、誤った前提が後工程へ伝わるのを防ぐ。後半はCodeRabbitとの提携による販促実験で、Claudeが生成した小規模アプリに、著者が既知の不具合を模したモジュールを追加して全体をスキャンした。テスト90件は合格していたが、スキャンは6件を報告し、別ファイルの入口と危険なインストール処理を結ぶ経路も示した。著者はクロスオリジン要求を再現している。共有状態やテスト合格は安全性の証明ではなく、人工的な脆弱性を含むこの事例も独立した製品比較ではない。

<!-- radar-visual:fourbot-handoff-note -->
[![Bayが引継ぎを記録し、Piperが確認し、Finが契約に沿って作業する図](<https://substack-post-media.s3.amazonaws.com/public/images/73c9f9e8-86b6-47fb-bc7e-e561abc740af_2752x1536.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/73c9f9e8-86b6-47fb-bc7e-e561abc740af_2752x1536.jpeg>)

*左のBayがパス、インターフェース契約、判断、未完了作業を記録し、Piperが確認して右のFinが引き継ぐ。点線の枠は同じクラウドPCを表す。引継ぎに必要なのは「完了」の一言ではなく、確認できる契約である。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/finding-every-vulnerability-made)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:fourbot-handoff-note -->

## プロダクトと実際の導入

### Omni 1.2 Flash：同じクリップを編集し、全体の作り直しを減らす

<a id="radar-omni12-flash"></a>

- 出典：Google DeepMind
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-05
- リンク：https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-omni-1-2-flash/
- 要約：GoogleはGemini Omni 1.2 FlashをGemini APIと企業向けに一般提供した。ネイティブ動画生成の上限は10秒から15秒へ伸び、3〜15秒を1秒刻みで指定できる。同じクリップの背景、照明、縦横比などを会話で繰り返し変更する。参照入力は画像、最大3秒の動作クリップ、音声を組み合わせられ、360pや720pで試作して選んだ結果を高解像度化する流れを想定する。公表された720p価格は1秒0.07ドル、前版比30%減だが、すべての仕様や編集工程の総費用を示すものではない。人物、商品上の文字、口の動き、カメラの連続性の改善は主にベンダーの実演による。高速動作、素早い脚本変更、複雑な物理現象は引き続き改善対象で、GeminiアプリのUltra向け機能も段階的な展開となる。

### Cult.fit：開発の共通ルールを整え、業務部門の構築を支える

<a id="radar-cultfit-operating"></a>

- 出典：OpenAI／Cult.fit
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-05
- リンク：https://openai.com/index/cultfit-builds-with-codex
- 要約：Cult.fitの顧客事例は、まずCodexを軸にリポジトリーの約束事、エージェントへの指示、スキル、テスト、レビューを統一し、その後に業務分析と非エンジニア部門へ広げる流れを説明する。SREエージェントは監視情報とログを集め、障害を調査して修正PRを提案し、エンジニアが確認する。業務部門には週2回の相談時間と、部門に入るエンジニアの支援を用意し、アイデアを動くアプリへ進める。同社は非エンジニアによる社内アプリ20件超、内部ダッシュボード機能の再構築による年間10万ドル超の費用回避、サポート費用50%超減を報告する。ただし顧客側の説明で、独立監査や統一条件の比較ではない。アプリ内のソーシャルフィードについて、CTOは従来なら1年以上かかったと見積もる。事例では新しい工程で開発からリリースまで2か月だったと報告しており、独立した比較ではない。重要なのはアクセス配布だけでなく、共通ルール、技術支援、レビュー責任を組み合わせた点にある。

### Merge：接続はコネクター、人間関係の判断は人が担う

<a id="radar-merge-dinner-workflow"></a>

- 出典：OpenAI／Merge
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-05
- リンク：https://openai.com/index/merge-builds-with-openai
- 要約：Mergeの顧客向け会食ワークフローはCRMとApolloから招待候補を抽出し、過去の招待と返信を確認して、案内文、参加者表、席次案、カレンダーのメモを準備する。モデルは推論と下書き、コネクターは業務システムへのアクセスを担当する。一方、CEOはBotが知らない人間関係を踏まえて候補を選び、文章を直す。同社は2026年10月、直前3か月を比較して、同じ名簿・招待・追跡作業が全社で数十時間から1回約30分へ短縮したと報告した。会場運営、関係構築、当日の物流は含まない。ツール呼び出し成功率99.9%と公開MCPサービス約60%という比較も、完全なサンプルや手順が示されておらず、独立した性能評価とは扱えない。データ接続、準備作業、責任を伴う人の判断を分けた事例として読むべきである。

## 産業とガバナンス

### オーストラリアの大学：利用を広げつつ、自力で答える場面を定める

<a id="radar-australia-assessments"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-05
- リンク：https://openai.com/index/australian-universities-ai-native-graduates
- 要約：OpenAIは大学での段階的な導入を紹介した。UNSWは8万人超の学生・職員を対象にChatGPT Eduを段階的に拡大し、シドニー大学は全学生への提供を2027年前期に予定する。La Trobeでは職員3,500人が利用でき、約45,000人の学生・職員への普及は2027年第1四半期を予定しており、4校すべてが全員へ導入済みではない。評価設計ではUNSWがCan、Can’t、MustによりAIの利用を許可・禁止・必須に分け、シドニー大学は監督下の本人能力の確認と、AI利用を認めるオープンな評価を組み合わせる。週に複数回AIを使うという81%の数字は、OpenAIの委託でPureprofileが8月3〜7日に成人大学生1,018人へ行った自己申告調査で、学習成果の証明ではない。ツールの支援と専門分野の判断を育てながら、基礎能力を自力で示す機会を残すことが焦点となる。

<!-- radar-visual:la-trobe-fletch-training -->
[![ラ・トローブ大学のTherese Keane教授と教員養成に使うソーシャルロボットFletch](<https://images.ctfassets.net/kftzwdyauwt9/1wQOKpRJ8dYh1iesZPsiVf/5604d52d462c88c16584fa172698dc52/la-trobe-fletch-teacher-training.png?w=3840&q=90&fm=webp>)](<https://images.ctfassets.net/kftzwdyauwt9/1wQOKpRJ8dYh1iesZPsiVf/5604d52d462c88c16584fa172698dc52/la-trobe-fletch-teacher-training.png?w=3840&q=90&fm=webp>)

*右のFletchは保護者とのやり取りを模擬し、教員志望者が実際の場面に入る前にフィードバックを練習するためのものだ。提携先が示した授業例であり、ロボットが教員の力量を判定する仕組みでも、学習効果の対照データでもない。 画像出典：[OpenAI / La Trobe University](https://openai.com/index/australian-universities-ai-native-graduates)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:la-trobe-fletch-training -->

## 深掘り

### Maude Lemaireの実務経験：基盤の仕事は生成結果の見栄えだけでは判断しない

<a id="radar-maude-foundations"></a>

- テーマ：構築と運用
- 出典：The Pragmatic Engineer／Maude Lemaire
- 情報経路：ポッドキャスト、Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-05
- リンク：https://newsletter.pragmaticengineer.com/p/scaling-slack-and-github-with-maude
- 要約：新しく公開されたインタビューの解説記事が、SlackとGitHubにおける過去のエンジニアリング経験を振り返る。AI支援開発の検証責任と照らして読む材料であり、当日の新機能発表ではない。Maudeは基盤に関わるLLM出力を自ら確認すると説明する。Slackでは完全なブラウザーを接続ごとに動かす代わりに、軽量なGoクライアントで多数のWebSocket接続を模擬した。GitHubの例は、Active Recordのような便利な抽象化がデータベースのクエリーや複数シャードへの問い合わせコストを隠し、シャードを増やすだけでは解決しないことを示す。共通するのは実際の経路で負荷、費用、制約を確認する姿勢である。ここでの根拠は解説記事にまとめられた経験であり、番組全体の逐語録の紹介ではない。実務家の回顧と判断で、一般的な生産性向上を実証する統一サンプルはない。
