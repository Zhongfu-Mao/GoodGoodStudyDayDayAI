---
title: "AIレーダー日報：2026-10-25"
date: 2026-10-25
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-25.ja-infographic-imagegen-20261030.webp
audioUrl: /__radar-preview/audio/daily-ai-radar-2026-10-25.ja.mp3
audioDuration: 1272
audioSize: 10177286
audioNotice: 試聴候補。内容の確認は未完了です。
draft: true
tags: []
plainSummary: "評価から強化学習・蒸留へ、推論講座は実装で学ぶ道筋を示す。CUDA Graph、RAGの制御ループ、会社向けHarnessは、計算効率・証拠・権限を別々に扱う。"
---

*図注：下部のID分岐はOpenSWEのユーザー要求とバックグラウンドレビューの例。各ツール・場面ごとにIDと権限を確認する。CUDA Graphは新入力を同じバッファーへ入れ、捕獲した計算を再実行し、過去の出力を返すものではない。*

今日は「モデルに考えさせること」「GPUの待ち時間を減らすこと」「システムが何をすべきかを決めること」を分けて見る。推論講座は実装で学ぶ道筋を、CUDA Graphは計算の起動方法を、RAGの制御ループと会社向けHarnessは証拠の集め方と行動する主体を扱う。

## 今日の重要な変化

- [同じ検証器で基準を作り、推論時の計算とRL・蒸留を分けて改善の由来を調べる。](#radar-reasoning-course)
- [CUDA Graphは起動計画を再利用し、新入力は再計算する。形状・アドレス・制御の適合が要る。](#radar-cuda-graph-replay)
- [深掘り：会社のAgentは道具ごとにIDを選び、個人メールはDMに限定する。接続と利用権限は別だ。](#radar-company-harness-reading)


## 能力とエビデンス

### 推論講座で評価・RL・蒸留をどうつなぐか

<a id="radar-reasoning-course"></a>

- 出典：Ahead of AI
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-10-24
- リンク：https://magazine.sebastianraschka.com/p/building-reasoning-models
- 要約：Sebastian Raschkaが紹介する全8回、計約11時間の講座は、**Qwen3 0.6Bの学習済み重み**から始め、評価と事後学習の仕組みを実装する。「From Scratch」は主要な仕組みを自分で書くという意味で、大規模な事前学習をやり直す講座ではない。前半の生成・評価はCPUでも試せるが、後半の学習にはGPUが現実的。PythonとPyTorchの基礎が必要で、前のLLM講座は必須ではない。

重要なのは、**同じ解答検証器を評価にも学習報酬にも使う**つながりだ。数学の最終解答を取り出し、表記を正規化し、同値性を調べてMATH-500で基準となる性能を測る。その判定を後でRLVRに使うため、モデルの改善と採点方法の変化、形式だけを狙った攻略を区別しやすい。

| 段階 | 実装するもの | 自分で確かめたい変数 |
| --- | --- | --- |
| 基準と評価 | ストリーミング生成、KV cache、数学の検証器 | 同じモデル・採点規則での速度と正答率 |
| 推論時の計算拡張（重みは固定） | 温度、top-p、複数サンプルの多数決、回答の採点と自己修正 | 候補を増やした計算費用に見合う改善があるか |
| 強化学習 | 応答のグループ生成、相対報酬、簡略GRPO、クリッピング・KL項・形式報酬 | エントロピー、advantage、学習の安定性と報酬の抜け道 |
| 蒸留 | 強い教師の解答を整理し、データを分けて教師あり学習 | 学習損失の低下が独立テストでも役立つか |

単に推論を長くすればよいわけではない。多数決には多様な候補と正確な答えの抽出が必要で、自己修正は正解を悪くする場合もある。評価によってその選択を比較できる点が学習価値だ。小型モデルで再現できる仕組みの教材であり、商用の最先端モデルと同等の能力を約束するものではない。

<!-- radar-visual:reasoning-course -->
[![推論モデル講義の既存モデル、評価、推論、訓練の構成](/images/radar/daily-ai-radar-2026-10-25-reasoning-course.webp)](/images/radar/daily-ai-radar-2026-10-25-reasoning-course.webp)

*事前学習済みモデルから評価、推論技術、強化学習や蒸留へ進む。四つの枠は内容構成で、講義が四本だけという意味でも、事前学習全体をやり直す意味でもない。 画像出典：[Sebastian Raschka / Ahead of AI](https://magazine.sebastianraschka.com/p/building-reasoning-models)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:reasoning-course -->

## 構築と運用

### CUDA Graphが再実行するのは処理手順であり、過去の答えではない

<a id="radar-cuda-graph-replay"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-24
- リンク：https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference
- 要約：LLMのデコード1ステップには、注意、行列積、正規化、サンプリングなど多くのGPUカーネルがある。各処理が短いと、CPUがフレームワーク、CUDA runtime、ドライバーを通じて次を投入する間、GPUが待つ。減らす対象は**起動の隙間**で、モデルの演算そのものではない。

まずウォームアップで初期化、カーネル選択、安定したバッファーの準備を行う。次に一度の実行から操作・引数・依存関係をキャプチャする。その後は同じバッファーへ新しい入力を書き、一回のグラフ起動で一連の計算を再実行する。**保存するのは手順であり、出力ではない**。新しい答えの計算は毎回行われる。

サーバーでは形状、アドレス、制御フローの互換性が制約になる。バッチサイズごとに複数のグラフを用意する、既存の形状へパディングする、通常実行に戻すといった設計が必要だ。グラフを増やすと適用範囲は広がるが、GPUメモリーと準備時間も増える。まずprofilerで起動の隙間を確認すべきで、すべての要求に一定倍率の高速化を保証する技術ではない。

<!-- radar-visual:cuda-graph-replay -->
[![CUDA Graphの準備、記録、再生とGPU実行の流れ](/images/radar/daily-ai-radar-2026-10-25-cuda-graph-replay.webp)](/images/radar/daily-ai-radar-2026-10-25-cuda-graph-replay.webp)

*左から形状とバッファーを準備し、カーネルの起動順を記録し、一度のCPUグラフ起動で計算を再実行する。右で減るのは起動の隙間で、新入力の演算は必要だ。効果は形状、アドレス、実行経路の安定性に依存する。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:cuda-graph-replay -->

### RAGの次の一手が、無限に検索を回すこととは限らない

<a id="radar-rag-agentic-loop"></a>

- 出典：ByteByteGo / Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-24
- リンク：https://blog.bytebytego.com/p/ep230-rag-vs-agentic-rag
- 要約：固定型RAGは通常、検索してから回答する。Agentic RAGは「どこを調べるか、根拠は足りるか、もう一度調べるか」を実行中の制御ループに任せる。文書、データベース、API、ウェブなどを選べる。違いは**証拠に応じて検索の判断を変えられること**で、Agentという名前だけで正確になるわけではない。

[Daily Doseの同号のGraph RAG補足](https://blog.dailydoseofds.com/p/how-cuda-graph-replay-cuts-inference)は別の軸も示す。「金曜の保守は決済サービスに影響するか」という問いに対し、文書が「決済サービスはpayments APIを使う」「payments APIはcluster-3で動く」「cluster-3は金曜に保守」と分かれていれば、中間の関係が鍵になる。Graph RAGは索引作成時に実体と関係を抽出し、検索時に関係をたどる。Agentic RAGは質問時に道具を選んで組み合わせる。異なる問題を扱い、併用もできるが、抽出や検索の誤りは残る。

単一の事実、多段の関係、動的な複数情報源の作業のどれかを先に見極め、確認できる終了条件と予算を決めたい。似た文章を見つけたことも、繰り返しの上限に達したことも、根拠が十分である証明にはならない。記事はAgentic RAGが一律に優れるという比較結果を示していない。

<!-- radar-visual:rag-agentic-loop -->
[![固定RAGと、ツール選択・証拠評価を繰り返すAgentic RAG](/images/radar/daily-ai-radar-2026-10-25-rag-agentic-loop.webp)](/images/radar/daily-ai-radar-2026-10-25-rag-agentic-loop.webp)

*左は既定の検索から回答へ進み、右は証拠不足時に質問や情報源を変えて再検索する。図の最大5回はこの例の停止設計で、全Agentic RAGに共通の規格ではない。反復を増やしても正しさが自動保証されるわけではない。 画像出典：[ByteByteGo](https://blog.bytebytego.com/p/ep230-rag-vs-agentic-rag)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:rag-agentic-loop -->

### Battle Drones v14：4人対応では地図以外も変わる

<a id="radar-battledrones-four-player"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-10-24
- リンク：https://simonwillison.net/2026/Oct/24/battledrones/
- 要約：従来の2人用に加え、Claude Opus 5.5で4方向対称のCompass RoseとWebSocketコードを変更し、最大4人に対応した。空席はAIが埋める。音声通信を使わない経路で、以前の音響マルチプレイとは別。本誌では独立に試遊しておらず、具体的な更新例として扱う。

## 深掘り

### 会社向けHarnessには、ツールだけでなくIDと記憶の境界が要る

<a id="radar-company-harness-reading"></a>

- テーマ：構築と運用
- 出典：LangChain engineering
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-24
- リンク：https://www.langchain.com/blog/components-building-company-harness
- 要約：LangChainは社内の開発・営業・マーケティングAgentに共通する課題を、仕事の入口、ID、記憶、コード実行、バックグラウンド起動の五つに整理した。Slackが普段の入口でも、大量の確認待ちメールには専用UIを用意する。すべてをチャットに詰め込むという話ではない。

具体的なのは行動の主体だ。OpenSWEはユーザーからの依頼ではその人を代表し、バックグラウンドのレビューではGitHub App自身のIDで動く。GTM Agentの一部業務ツールは固定サービスIDだが、個人のメールは**DMだけで利用でき、共有チャンネルでは使えない**。Content Studioが会社のSNSへ接続できても、投稿を起動できるのは許可されたユーザーに限る。接続能力と、誰がそれを行使できるかは別問題だ。

記憶は全社と個人の二層だが、原文はまだ探索が少ない分野だと認める。コードはサンドボックスで動き、secret proxy経由で許可されたサービスに接続する。定時やイベントの起動で、人が毎回呼ばなくても仕事が始まる。長期運用には長いコンテキストだけでなく、状態、主体、起動の設計が要る。

**今号をつなぐと：** 講座の「モデルというエンジン」、RAGの「証拠収集ループ」、会社Harnessの「組織の権限」は異なる層にある。強いモデルは根拠収集を、情報の多さは権限確認を代替しない。計算の起動を速くしても、答えの正しさは別に確かめる必要がある。

*対象期間は10月24日12:00〜25日12:00（日本時間）。LangChain記事は初出時刻未確認のため発展的な読み物とする。*
