---
title: "AIレーダー日報：2026-11-10"
date: 2026-11-10
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-10.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-10.ja.mp3
audioDuration: 1403
audioSize: 11227617
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "モデル更新、研究処理の停止、レビューと実世界のフィードバックを検証する。"
plainSummary: "モデルの出力、採用された提案、実際の結果を別々に確かめる。"
---

対象期間は2026年11月9日12:00から11月10日12:00まで（日本時間）。新発表と新しい解説を分け、過去の導入日・予測・内部測定の条件を保つ。

## 今日の重要な変化

- [FableとMythos 5.2：同じ基盤モデルでも防護とアクセスは異なる](#radar-fable-mythos-52)
- [LinkedInのコードレビュー：採用率、PR数、欠陥の正しさを分ける](#radar-linkedin-review-evidence)
- [Control Room：推論層でjob_idごとに研究処理を止める](#radar-control-room)

## 能力とエビデンス

### FableとMythos 5.2：同じ基盤モデルでも防護とアクセスは異なる

<a id="radar-fable-mythos-52"></a>

- 出典：Anthropic、Simon Willison
- 情報経路：公式、ブログ
- エビデンス区分：公式発表
- 初出日：2026-11-09
- リンク：https://www.anthropic.com/claude-fable-and-mythos-5-2
- 要約：Anthropicは11月9日付の公式ページでFable 5.2とMythos 5.2を発表した。ページは時刻を示さず、本期の終了前にはWillisonの対応記事も確認できる。基盤モデルは同じだが、Fableにはサイバー・生物分野の悪用防止策を設け、Mythosは対応する確認プログラムを通った組織向けとする。コーディング、推論、視覚、ロボット評価の改善は提供元の報告で、RoboDojo Simは内部実行、サイバー評価の一部は研究所ごとに問題が異なる。表全体を統一条件の独立順位とは読めない。一方Willisonはllm-anthropic 0.31に対応を加え、SVGのペリカンを描く個人実験で、maxは128,000 tokenを思考に使って画像を返さず、xhighでは結果が得られたと報告した。一つのプロンプトの観察で能力全体の後退は示さないが、推論設定・予算・成果物の有無も確認が必要になる。

補助出典：[llm-anthropic 0.31](https://simonwillison.net/2026/Nov/9/llm-anthropic/)

### Handshakeの実演：規則を説明できても、作業中に適用できるとは限らない

<a id="radar-handshake-applied-rules"></a>

- 出典：Latent.Space / Handshake
- 情報経路：ブログ、ポッドキャスト
- エビデンス区分：見解・推論
- 初出日：2026-11-09
- リンク：https://latent.space/p/handshake/
- 要約：新しい対談では、模擬銀行のProject Falconを実演する。Agentはメールと資料を読み、Pythonで計算モデルを作りExcelを提出した。1時間25分から31分では、既存ののれんの扱いを直接問えば説明できるのに、計算の該当箇所で誤って差し引き、PythonとExcelの一致だけを確認して誤りを提出したと説明する。知識を適切な工程に当てはめたかは、二つの出力が一致するだけでは分からない。1時間46分から49分には、指定数値の存在だけを調べる採点を、別シートに大量の数値を並べて通過した過去の例も紹介する。採点には正しいシート・項目・依存関係の特定が必要になる。環境提供会社による実演と説明で、全モデルの失敗率や実取引の処理方法を示すものではない。

## 構築と運用

### LinkedInのコードレビュー：採用率、PR数、欠陥の正しさを分ける

<a id="radar-linkedin-review-evidence"></a>

- 出典：ByteByteGo、LinkedIn Engineering
- 情報経路：Newsletter、ブログ
- エビデンス区分：著者の実測
- 初出日：2026-11-09
- リンク：https://blog.bytebytego.com/p/how-linkedin-uses-ai-to-review-40000
- 要約：11月9日のByteByteGoはLinkedInの多Agentレビューを解説したが、技術原文の日付は8月13日で、新規稼働ではない。編成層は同じPRの文脈を、互いの出力を見ないモデルとHarnessの組み合わせへ渡し、重複除去・相互検証と、組織・リポジトリー・PRラベルの三層ルールを適用する。典型的な一週の40,000超のPRと79,000超のレビューは別の分母だ。63.9%の合算採用率は7日間の1,727 PR、5,230件の抽出コメントを対象に、LLMがマージ後のコードで採用を判定した値である。欠陥の再現率でも、採用された提案の正しさの保証でもない。全PRには人のレビューが残る。変更前のモデル・プロンプト・Harnessを本番版と対比較し、変更後は実コードを確かめるという二段階の仕組みに注目したい。

技術原文（2026-08-13）：[LinkedIn Engineering](https://www.linkedin.com/blog/engineering/ai/high-signal-ai-code-review-that-adapts-to-your-codebase-at-scale)

<!-- radar-visual:linkedin-review-orchestrator -->
[![PRイベントから差分と文脈を取得し並列レビュー・重複除去・相互検証を経て投稿する流れ](<https://media.licdn.com/dms/image/v2/D4D08AQGU3AoXdva2iA/croft-frontend-shrinkToFit767/B4DZ_3xjilJoAI-/0/1786568391069?e=2147483647&v=beta&t=7WKGQV7cphsL7DJPMunoKCqvmMbHu7qLIhOjkjVqkRI>)](<https://media.licdn.com/dms/image/v2/D4D08AQGU3AoXdva2iA/croft-frontend-shrinkToFit767/B4DZ_3xjilJoAI-/0/1786568391069?e=2147483647&v=beta&t=7WKGQV7cphsL7DJPMunoKCqvmMbHu7qLIhOjkjVqkRI>)

*上からPRイベント、編成、差分とコードベースの文脈へ進み、二つのモデルとHarness、およびルールの分岐を経て重複除去・相互検証へ戻る。並列実行を多数決による正しさの保証とは読めない。図の原文は8月13日公開。 画像出典：[ByteByteGo](https://blog.bytebytego.com/p/how-linkedin-uses-ai-to-review-40000)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:linkedin-review-orchestrator -->

### Beep Locator：コードAgentへ確認可能な環境のフィードバックを渡す

<a id="radar-beep-locator"></a>

- 出典：Simon Willison
- 情報経路：ブログ、GitHub
- エビデンス区分：著者の実測
- 初出日：2026-11-09
- リンク：https://simonwillison.net/2026/Nov/9/mysterious-beeps/
- 要約：WillisonはClaude CodeでPythonサービスを作り、電話・タブレット・PCの計五台をブラウザーのマイクとWebSocketで結び、部屋の断続的な電子音を探した。自動的な端末位置推定は最初うまく動かず、手動の粗い配置、拍手テスト、時刻表示、端末ごとの録音再生を追加。著者は最終的に約40cmの範囲まで絞れたと報告する。初期実装はOpus 5.5、後の調整はFable 5.2で、単一モデルの一発完成ではない。録音・較正音・現場の人の確認がフィードバックとなり、サーバーは短い音を使って録音片を揃える。画面に座標が出るだけでは精度を証明しない。環境から確認できる情報を戻す例であり、Claudeのネイティブ音声入力や、部屋と騒音条件を変えた独立精度評価ではない。

<!-- radar-visual:beep-locator-feedback -->
[![著者のBeep Locator画面：五つの端末、位置地図、音量、録音ログ](<https://static.simonwillison.net/static/2026/beep-locator-ui.webp>)](<https://static.simonwillison.net/static/2026/beep-locator-ui.webp>)

*地図の端末位置・音源マーク・誤差範囲を、下の端末別音量と録音ログで確認できる。ログには到達時刻が物理的に成立しない警告もある。約40cmは今回の配置と確認における著者の報告で、一般的な精度保証ではない。 画像出典：[Simon Willison](https://simonwillison.net/2026/Nov/9/mysterious-beeps/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:beep-locator-feedback -->

### PRの説明：人が冒頭を選び、Agentの詳細を折り畳んで残す

<a id="radar-human-pr-opener"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-09
- リンク：https://simonwillison.net/2026/Nov/9/details-summary/
- 要約：WillisonはGitHubの説明文を小さく変えた。人の判断を通した短い導入を先に置き、Agentの詳しい記録は`<details><summary>`内へ畳み、summaryにモデルと推論設定を示す。全てを手書きする必要はなく、Agentの文章から適切な段落を選んでもよい。読み手は変更と理由、必要な画面を先に把握し、検証の詳細は必要に応じて開ける。情報を残しながら長い自動説明の読書負担を減らす編集方法だが、速度改善の対照実験ではない。欠陥、未完了の確認、リスクを折り畳んで隠してよいという話でもない。

## プロダクトと実際の導入

### 日本の金融分野向け合成人物：100万レコードと900万の記述を分ける

<a id="radar-nemotron-japan-finance"></a>

- 出典：NVIDIA / Elith
- 情報経路：公式、ブログ
- エビデンス区分：公式発表
- 初出日：2026-11-09
- リンク：https://huggingface.co/blog/nvidia/nemotron-personas-finance-japan
- 要約：NVIDIAとElithはNemotron-Personas-Finance-Japanを公開した。日本の人口・労働・家計統計の分布を基に、日本語の人物情報を合成する。100万レコードの各々に九種類の人物記述があり計900万記述、各レコードの50項目は人物九項目・属性11項目・文脈30項目で構成する。CC BY 4.0で公開し、確率的グラフィカルモデルとNeMo Data Designer、言語モデルで文化・金融文脈を加える。分布から作った合成物で、顧客記録や900万人の実在者ではない。日本語の顧客シミュレーション、偏りの切り分け、Agent評価の種には使えるが、合成というだけで精度・公平性・全ての法令適合を証明しない。用途ごとの分布・相関・評価範囲の確認が必要で、提案された使い道を検証済みの効果と混同できない。

<!-- radar-visual:nvidia-persona-pipeline -->
[![統計属性を二段階の言語モデルへ渡し複数種の日本語人物記述を作る図](<https://cdn-uploads.huggingface.co/production/uploads/604ad59e2fad27aca4515dab/P649AGmEfc-8C0I5qjqv_.png>)](<https://cdn-uploads.huggingface.co/production/uploads/604ad59e2fad27aca4515dab/P649AGmEfc-8C0I5qjqv_.png>)

*PGMとOCEANの入力から、LLM Aが経済背景や金銭への態度などを加え、LLM Bが属性を合わせて複数の人物記述を作る。合成の構造を示す図で、実顧客の行動との完全な一致を証明しない。 画像出典：[NVIDIA / Elith](https://huggingface.co/blog/nvidia/nemotron-personas-finance-japan)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:nvidia-persona-pipeline -->

### 空研工業の図面検索：候補の仕様確認は技術者に残る

<a id="radar-kuken-drawing-search"></a>

- 出典：OpenAI / Kuken Industries
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-09
- リンク：https://openai.com/index/kuken/
- 要約：空研工業とRecursiveは70年分の冷却塔図面を現場アプリで検索できるようにした。部品番号を入力するほか、図面・PDF・部品表の画面画像から番号を読み取り、一致候補や類似設計を返す。技術者が設備仕様と交換履歴を確認して正しい図面を選ぶ。検索時間を年間で約90%減らせるという値は顧客の予測で、測定済みの年間実績ではない。開発中の別の図面確認ツールでは、指摘の約90%が実際の相違だったと顧客が報告する。これは指摘済み項目の的中割合で、全問題の90%を発見した意味ではない。本期の新しさは事例の公開であり、AIによる交換部品や図面の独立承認を示すものではない。

### Grok Bot Pagesの解説：同じアドレスで更新を受け止める

<a id="radar-durable-agent-pages"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の実測
- 初出日：2026-11-09
- リンク：https://blog.dailydoseofds.com/p/pages-in-grok-bot-clearly-explained
- 要約：新しい操作実演はGrok Bot Pagesを、後から開き直せる対話的ページとして説明する。文章・表・図・フィルターを載せ、Botが同じページを後で変更し、定期処理から更新することもできる。共有タスク表、X分析、学習ガイドの例は、結果を会話の奥に埋めず同じアドレスへ置くという使い方だ。既存機能の実演で、Pagesや以前の接続機能が当日初めて公開されたとは確認できない。冒頭のMongoDB一時クラスターは協賛表示のある宣伝であり、Pagesの実演や独立評価と分けて読む必要がある。継続更新するページにも出典・更新時刻・変更内容の確認は残る。同じアドレスだから内容が常に正しいわけではない。

## 産業とガバナンス

### Control Room：推論層でjob_idごとに研究処理を止める

<a id="radar-control-room"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-09
- リンク：https://openai.com/index/control-room/
- 要約：OpenAIは研究基盤のControl Roomを説明した。処理がjob_idを取得し、推論要求ごとにエンジンが中央サービスへ許可を問い合わせる。停止済みの仕事には出力を返さない。最大35秒は、停止指示をControl Roomが受けてから先へ進めなくなるまでの時間で、主に許可キャッシュによる。リスクの発生や最初の検知からの時間ではない。変化の多い研究側コードより、集約された推論層へ停止機構を置く。先端モデルの研究処理では、サービス停止時も要求を拒むfail-closedを導入済みだが、残る研究処理への展開は今後数日とされる。監視と連携する仕組みであり検知の代替ではなく、外部サービス全体の新規統合や遅延ゼロの停止を示さない。運営側の報告で、独立した停止実験ではない。
