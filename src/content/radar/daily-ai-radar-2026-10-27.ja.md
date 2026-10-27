---
title: "AIレーダー日報：2026-10-27"
date: 2026-10-27
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-27.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-27.ja.mp3
audioDuration: 988
audioSize: 7903797
draft: false
tags: []
---

2026-10-26 12:00から2026-10-27 12:00（日本時間）までの公開資料を整理した7件。初出日と確認日を区別し、発表者の主張・実測・見解の範囲を明記する。

## 今日の重要な変化

- [決定的な推論にはバッチと浮動小数点計算への対処が必要。](#radar-temperature-zero)
- [企業エージェントは規則・文脈・権限を実行可能な層に分ける。](#radar-salesforce-harness)
- [コードレビューに実際の表示幅と利用者操作を組み込み、事例の限界も保つ。](#radar-greptile-ui-review)

## 構築と運用

### LLM推論においてTemperature 0が決定論的でない理由

<a id="radar-temperature-zero"></a>

- 出典：Daily Dose of Data Science
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-10-26
- リンク：https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic
- 要約：Daily Doseは、Temperature 0でも出力が揺れるシステム上の理由を解説した。GPUの浮動小数点加算は結合法則を満たさず、動的バッチで集約・加算順序が変わると、近いトークンのスコアが逆転し得る。Thinking MachinesによるQwen3-235Bの同一プロンプト反復実験を紹介し、vLLMとSGLangのバッチ不変カーネルも整理する。決定性には速度との交換条件があり、掲載された実行時間は指定モデルと負荷の値で、全環境共通の負担ではない。

<!-- radar-visual:temperature-zero -->
[![FP16で加算順序を変えると丸め結果が変わる模式図](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)

*上段は1024へ0.4ずつ加えて毎回丸め、下段は小数を先に足してから加えるため、この例では結果が変わる。有限精度の加算が結合法則を満たさない説明で、全入力・全機器で同じ差が出るという意味ではない。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:temperature-zero -->

### Salesforceのエージェント技術スタック詳解：単一プロンプトから決定論的コード協調へ

<a id="radar-salesforce-harness"></a>

- 出典：ByteByteGo
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-10-26
- リンク：https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent
- 要約：ByteByteGoはSalesforceチームの説明を基に、Agentforceが単一の大きなプロンプトから階層型システムへ移行した設計を整理した。Agent Scriptは推論の前後に決定論的コードで業務規則を適用し、文脈エンジンは必要なデータを選び、Agent Identityは利用者とエージェント双方の権限を検査する。保険照会の例では文脈が12.4万から9000トークンへ減った。ツールの発見・記述・実行も段階化するが、これはチームの説明と特定の事例であり、一般的な性能保証ではない。

<!-- radar-visual:salesforce-harness -->
[![Salesforceのデータ、業務処理、実行、利用画面の層](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)

*下からデータ、業務の動作、エージェント実行、利用者の入口を示す。規則とID権限は実行層にあり、会話の指示だけで置き換えない。チームが説明した構成で、すべての接続の安定稼働を独立認証した図ではない。 画像出典：[ByteByteGo / Salesforce engineering](https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:salesforce-harness -->

### Simon Willisonによるwebframe評価：スクレイピングとサンドボックス向け軽量ツール

<a id="radar-webframe"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-10-26
- リンク：https://simonwillison.net/2026/Oct/26/webframe-evaluation/
- 要約：Simon WillisonはClaude Opus 5.5を用い、Jeff Lindsay作のwebframeを評価した。Go言語とglazeライブラリで構築され、OS標準ブラウザ（macOSのWKWebView、LinuxのWebKitGTK、WindowsのWebView2）を利用してブラウザエンジンを同梱せずにWebページを実行できる。shot-scraperに匹敵する軽量高速なスクレイピング性能を示す一方、CSP障害、0×0ビューポート、読み込み停止、HTTPメタデータ欠落、ブラウザ制御の制限などの未成熟な課題が確認された。

### Hallmark、設計チェックを必須の基準と説明可能な例外に分離

<a id="radar-hallmark-observation"></a>

- 出典：GitHub / Nutlope
- 情報経路：GitHub
- エビデンス区分：公式発表
- 初出日：未確認
- 確認日：2026-10-27
- リンク：https://github.com/Nutlope/hallmark
- 要約：今回GitHub Trendingで確認したHallmarkは、Claude Code、Codex、Cursorなどに対応するデザインSkillだ。READMEはコントラスト、フォーカス、動きの低減、架空の事実、スマートフォン表示を必須の基準とし、理由を説明すれば変更できる既定のデザイン規則、仕上げの細部を分離する。実ブラウザー検査と独立した文脈でのレビューも要求する。現在の公開実装を観察したもので、本日公開されたとの主張や、全検査の信頼性を独立検証したとの主張ではない。

## プロダクトと実際の導入

### GreptileがGPT-6 AstraとCodexを導入し、コードレビューを超えた自動振る舞いテストを実現

<a id="radar-greptile-ui-review"></a>

- 出典：OpenAI
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://openai.com/index/greptile-code-review-codex-astra
- 要約：OpenAIはGreptileの事例を公開し、コードレビューを実行・画面テストへ広げる方法を紹介した。GPT-6 AstraがPR用の開発サーバーを起動し、ブラウザーをスマートフォンの表示幅に縮め、利用者の操作を模擬することで、コードを読むだけでは見つけにくいボタンの非表示を検知するという。GreptileはMCPでCodexにコードベースの文脈も渡す。供給側と顧客による事例であり、全プロジェクトへ一般化できる検出率や差し戻し削減率は示されていない。

## 産業とガバナンス

### OpenAIがSignalsデータを公開：約100カ国・165の業務活動におけるChatGPT利用実態を分析

<a id="radar-signals-work"></a>

- 出典：OpenAI
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://openai.com/index/chatgpt-expanding-world-of-work
- 要約：OpenAI Signalsに、O*NETで分類した165種類の業務活動データが追加された。約100カ国を対象に2025年第1四半期から2026年第3四半期をカバーする。全四半期で観測した74カ国では、上位10活動が分類済み業務メッセージに占める平均割合は56.0%から51.1%へ下がった。これは標本内の用途構成の変化で、雇用代替率ではない。対象は個人向けChatGPTプランの業務メッセージで、企業メッセージとCodexは含まず、集計・少数標本の非公表・統計ノイズでプライバシーを保護する。

### Evan ArmstrongがAnthropicのS-1申請書を分析：2兆ドル評価報道の裏にある事業構造と計算資源リスク

<a id="radar-anthropic-compute-economics"></a>

- 出典：Every
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-10-26
- リンク：https://every.to/napkin-math/is-anthropic-worth-2-trillion
- 要約：Evan ArmstrongはEveryでAnthropicの上場申請資料を論評し、急成長の裏にある計算資源契約とモデル更新の圧力を検討した。利用量に応じて変わり顧客が解約できる収入と、より長期のインフラ契約を対比し、モデル提供の粗利と継続的な研究・訓練費用を分けて考える。一方、計算資源の段階的な確保や供給を超える需要にも触れる。著者による事業モデルと評価仮説の分析であり、独立監査、確定した上場評価額や投資判断ではない。

<!-- radar-visual:anthropic-compute-economics -->
[![Anthropicへの年間支出が10万ドル以上の企業顧客数を著者が整理した図](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)

*棒は直近12カ月にAnthropicへ少なくとも10万ドルの収入をもたらした企業の数で、顧客企業自身の売上高ではない。申請資料を基にした著者の概数で、最後は2026年9月時点。等間隔の棒幅をそのまま成長や評価額の予測へ使えない。 画像出典：[The Leverage / Every](https://every.to/napkin-math/is-anthropic-worth-2-trillion)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:anthropic-compute-economics -->
