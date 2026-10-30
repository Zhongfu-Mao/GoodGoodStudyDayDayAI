---
title: "AIレーダー日報：2026-10-27"
date: 2026-10-27
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-27.ja-infographic-imagegen-20261030.webp
audioUrl: /__radar-preview/audio/daily-ai-radar-2026-10-27.ja.mp3
audioDuration: 1207
audioSize: 9657135
audioNotice: "出典・文脈と書き起こしによる内容確認済み。原音の聴取確認は未実施です。"
draft: true
tags: []
plainSummary: "モデルの再現性、企業Agentの権限、実際のUIテスト、科学・利用データの検証を別々に見る。"
---

*図注：科学の三項目はいずれも発表者の主張で、理解と独立検証が必要。財務の三項は算定範囲と性質が異なり、数量の比較ではない。Signalsは個人ChatGPTプランの仕事メッセージを対象とし、企業とCodexは含まない。*

今日は「結果をどう信頼するか」を軸に見る。推論の再現性には実際の計算条件、企業Agentには推論の外の規則、UIレビューには実行中の画面が必要だ。科学の主張や経済データにも、それぞれ別の検証条件がある。

## 今日の重要な変化

- [Temperature 0はサンプリングを止めるが、バッチの影響は残る。](#radar-temperature-zero)
- [Salesforceは規則・ID・文脈を一つの巨大プロンプトから分離する。](#radar-salesforce-harness)
- [OpenAIの科学的主張は公開・検討方法が異なり、学界の合意と同一ではない。](#radar-science-community-verification)


## 能力とエビデンス

### Terraの続報：描画1件の費用と待ち時間

<a id="radar-terra-visual-computer"></a>

- 出典：Simon Willison / OpenAI
- 情報経路：ブログ、公式
- エビデンス区分：著者の実測
- 初出日：2026-10-27
- 時刻：Simonの記録は27日08:53（日本時間）。公式発表は26日の日報に掲載。
- リンク：https://simonwillison.net/2026/Oct/26/gpt-61-terra/
- 要約：Simonは「自転車に乗るペリカン」の同一SVG課題をGPT-6.1 Terraの推論設定ごとに試し、出力、使用量、所要時間を残した。maxの一例は約11.3セント、4分11秒だった。確認できる一回の描画記録であり、公式の専門的PC作業ランキングの独立再現ではない。

背景は[26日に公表された公式の能力と価格](/ja/radar/daily-ai-radar-2026-10-26/#radar-terra-visual-computer)だ。標準APIは100万Token当たり入力1ドル、キャッシュ入力0.05ドル、出力5ドル。低い単価と少ないToken消費は重なる場合もあるが、追加の推論、再試行、ツール待ち、人の確認で相殺されることもある。Simonの例は具体的な仕事の費用を示すが、一回の描画から全業務の価格や完了率は推定できない。

同じ課題と検収基準を固定し、成功までの総費用、時間、再試行、手戻りを記録してから推論設定を選ぶとよい。視覚能力が上がっても行動の認可とは別で、実行システムのツールと権限が必要になる。

### 三つの科学的主張：形式化資料の公開後にも理解と独立検証が要る

<a id="radar-science-community-verification"></a>

- 出典：The Rundown AI / OpenAI
- 情報経路：Newsletter、公式
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://openai.com/index/building-scientific-understanding-with-academic-communities/
- 要約：OpenAIは全次元の局所平滑化予想（Kakeya・制限予想にも帰結）、指数時間仮説（ETH）の反証、4次元でゲージ場とフェルミオンを含む相互作用する量子場理論の存在証明を主張した。出力を研究の生データと位置づける。数学は資料を公開、ETHは外部チームと説明を進め自然言語・Lean資料を公開、物理は外部チームが記述をまとめる。

ETHの主張はP=NPという結論ではなく、Yang–Millsの存在に関する主張もミレニアム問題全体の解決ではない。本誌は証明を独立検証していない。形式化資料の公開と学界の合意は区別して追いたい。

## 構築と運用

### Temperature 0はサンプリングを止めるが、バッチの影響は残る

<a id="radar-temperature-zero"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-26
- リンク：https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic
- 要約：Temperature 0では通常、最大logitのTokenを選び、ランダムな抽出をしない。それでもlogitの計算はサーバー上のバッチ形状で変わりうる。集約の分割や浮動小数点加算の順序が変わると、近接する二候補の順位が逆転し、後続の生成も異なる接頭辞から続く。

FP16では1024付近の表現可能値の間隔が1になる。1024に0.4を一つずつ足すと、毎回1024へ丸められる一方、先に0.4と0.4を足してから加えると1025へ丸まる。すべてのGPUスレッドがランダムという説明ではなく、**同じ要求でもバッチに応じて計算の分割が変わる**ことが焦点だ。

記事が紹介する[Thinking Machinesの2025年9月10日公開の実験報告](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)では、Qwen3-235Bのnon-thinkingモードで同じ質問を1000回送り、それぞれ1000Tokenを生成し、80種類の補完を得た。最初の102Tokenは一致し、103番目の僅差で分岐したという。バッチ不変カーネルでは、この試験の1000回が一致した。別のQwen3-8B・1000要求の試験では、標準vLLMの26秒が初期の決定的実装で55秒、注意カーネル改善後に42秒となった。異なるモデルや負荷に共通の速度低下率ではない。

再現可能な評価、障害のリプレイ、RLのサンプラーと学習側の確率整合に関わる。vLLMとSGLangに対応する実装経路はあるが、自分のモデル・カーネル・負荷で確認すべきで、一つの試験結果を全配信環境への保証にできない。

<!-- radar-visual:temperature-zero -->
[![FP16で加算順序を変えると丸め結果が変わる模式図](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)

*上段は1024へ0.4ずつ加えて毎回丸め、下段は小数を先に足してから加えるため、この例では結果が変わる。有限精度の加算が結合法則を満たさない説明で、全入力・全機器で同じ差が出るという意味ではない。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:temperature-zero -->

### Salesforceは規則・ID・文脈を一つの巨大プロンプトから分離する

<a id="radar-salesforce-harness"></a>

- 出典：ByteByteGo / Salesforce engineering
- 情報経路：Newsletter
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent
- 要約：Salesforceへの取材を基に、ByteByteGoはAgentforceが規則をすべてプロンプトへ置く方式から多層化した設計へ移った過程を説明する。モデルは推論し、規則、顧客の同定、文脈、実行権限はそれぞれ外側の仕組みが担う。

Agent Scriptは決定的なコードと推論部分を分け、Agent Graphへコンパイルして実行する。予約の質問なら、`before_reasoning`が先に予約情報を取得し、その資料をモデルへ渡し、回答後に`after_reasoning`を動かす。「必ず先に予約を調べる」という指示を毎回モデルが守るかに依存しにくい。ただし、コードやルーティングのテストは必要で、無誤りにはならない。

| プロンプトへ詰めていた役割 | 分離した仕組み | 残すべき境界 |
| --- | --- | --- |
| 異なるシステムの同じ顧客を特定 | 共通モデルと照合ルールによる統一プロフィール | 元記録へのリンクを保ち、全記録を書き換えない |
| 必要な文脈を選ぶ | 対象特定、計画、順位付け、ガバナンス、構成、記憶 | 関連性だけでは閲覧権限にならない |
| Agentが動作できるか | ユーザーとAgentの権限、データポリシーを照合 | 一つでも拒否なら実行しない |
| 大量のツールを扱う | discover、describe、dispatchで必要な契約だけ取得 | 定義を毎回全部ロードしない |

保険照会の文脈が124,000から9,000Tokenになったのは**同じ質問を比較したチームの実演**だ。その後の比較は片側が2問、他方が3ステップなので、同じ長さの会話の一律削減率にはできない。また「フロリダへ移るかもしれない」は記憶であり、登録の完了後に初めて承認された長期的事実へ昇格する。意向を発生済みの事実へ黙って変えてはいけない。

初期設計で8指示を超えると無視が始まったというのもチームの観察で、全モデル共通の上限ではない。価値は責任を分離することであり、単に指示や機械的な規則を増やすことではない。

<!-- radar-visual:salesforce-harness -->
[![Salesforceのデータ、業務処理、実行、利用画面の層](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)

*下からデータ、業務の動作、エージェント実行、利用者の入口を示す。規則とID権限は実行層にあり、会話の指示だけで置き換えない。チームが説明した構成で、すべての接続の安定稼働を独立認証した図ではない。 画像出典：[ByteByteGo / Salesforce engineering](https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:salesforce-harness -->

### webframe：軽いウェブ実行器が、そのまま安全なサンドボックスとは限らない

<a id="radar-webframe"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-10-26
- リンク：https://simonwillison.net/2026/Oct/26/webframe-evaluation/
- 要約：Jeff LindsayのwebframeはGoとglazeを使い、macOSのWKWebView、LinuxのWebKitGTK、WindowsのWebView2を利用する。URLやファイルを隠れたWebViewで動かし、console.logを標準出力、例外を標準エラーへ出すため、独立したブラウザーエンジンの同梱が不要だ。

SimonはClaude Opus 5.5に試作と調査を任せた。紹介ページはshot-scraperに近い速度とする一方、CSPエラー、0×0ビューポート、読み込み停止、HTTPメタデータ不足、ブラウザー制御の制約も挙げる。速度の説明は、モデルを使ったSimonの調査記録に基づく。

パッケージや起動の軽さは利点になりうるが、信用できないページの実行には権限と隔離の確認が別に要る。紹介ページだけでは安全なサンドボックスを代替できると証明されず、Playwright不要というだけで操作APIが十分とも言えない。

## プロダクトと実際の導入

### Greptile：コードだけでなく、実際の利用者の画面サイズで動かす

<a id="radar-greptile-ui-review"></a>

- 出典：OpenAI / Greptile
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://openai.com/index/greptile-code-review-codex-astra
- 要約：Greptileの事例はPRレビューを実際の挙動へ広げる。開発サーバーを起動し、ブラウザーをiPhone相当へ縮め、利用者の操作をたどって小画面で消えるボタンを調べる。論理的に正しいコードでも、ユーザーが操作できるとは限らない。

文脈も別の柱だ。Greptileはコードベースを索引化し、既存の動作を説明する知識ベースをMCP経由でCodexへ渡す。チームはAIコードの取り消し頻度を追い、文脈が手戻りを減らすというが、再計算できる比較データや一律の削減率は示していない。

コードの文脈は「どう実装すべきか」、実行中の画面は「今回は本当にできたか」を確かめる。終了コードだけでも、一度画面を見ただけでも、全状態、サイズ、権限の検証にはならない。

## 産業とガバナンス

### Signals：用途の分散は、そのまま雇用の代替率ではない

<a id="radar-signals-work"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://openai.com/index/chatgpt-expanding-world-of-work
- 要約：Signalsは個人向けChatGPTプランの仕事関連メッセージをO*NETの165活動へ分類し、約100か国、2025年Q1から2026年Q3を扱う。企業メッセージやCodexを含まず、企業の全AI利用を測るデータではない。

全四半期で観測された74か国では、各国の上位10活動が分類済み仕事メッセージに占める比率の平均が56.0%から51.1%へ下がった。**分母は分類されたメッセージ**で、人、労働時間、職数ではない。用途が分散したことから、雇用の置換率を直接求められない。

米国の雇用構成と比べる際も網羅範囲が重要だ。対応職業の仕事を雇用で重み付けしたタスク構成の約43%は個別報告外のOther IWAsに入り、運搬、運転、一部の記録管理などを含む。分布差には利用の違いだけでなく、分類・標本の基準も影響する。自動分類、集計、少数群の非公表、統計ノイズを使うため、個人追跡ではなく傾向の研究に向く。

### Anthropicの評価額論：実現収益、サービス粗利、計算資源の契約を分ける

<a id="radar-anthropic-compute-economics"></a>

- 出典：Every / The Leverage
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-26
- リンク：https://every.to/napkin-math/is-anthropic-worth-2-trillion
- 要約：Evan Armstrongは目論見書を基に、利用量で変わり解約もできる収益と、数年先の支出を約束する計算資源・設備費の期間のずれを論じる。2兆ドルは記事が扱う評価額の報道・想定で、上場価格の確定値ではない。

驚く数字より定義が重要だ。記事が転記するQ2収益は116億ドルだが、Q3約168億ドルは報道値で、目論見書の同四半期欄は監査待ちと区別する。約900%の純収益維持率も「適格顧客」だけで、Pro/Maxを除外しており、一般のSaaSとそのまま順位を付けられない。

粗利にも二つの見方がある。85%は顧客へのサービス提供費で計算し、著者は学習・設備費も含めると45%という分析を提案する。後者は継続研究費を捉え直す視点で、別の監査済み標準粗利ではない。古いモデルの売上が少ないことだけで、すべてのモデルに固定した6か月の寿命があるとも言えない。

反対材料として、会社は長納期のデータセンター契約と、需要が見えやすい時期に決める加速器契約を分け、需要が供給を上回ってきたとする。早期固定の一部リスクを和らげても、競争、将来需要、次のモデルの質は未確定だ。数字が実績、現在速度の年率換算、将来の義務のどれなのかを先に確認したい。

<!-- radar-visual:anthropic-compute-economics -->
[![Anthropicへの年間支出が10万ドル以上の企業顧客数を著者が整理した図](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)

*棒は直近12カ月にAnthropicへ少なくとも10万ドルの収入をもたらした企業の数で、顧客企業自身の売上高ではない。申請資料を基にした著者の概数で、最後は2026年9月時点。等間隔の棒幅をそのまま成長や評価額の予測へ使えない。 画像出典：[The Leverage / Every](https://every.to/napkin-math/is-anthropic-worth-2-trillion)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:anthropic-compute-economics -->

## 深掘り

### Hallmark：最低条件、好み、仕上げを分ける

<a id="radar-hallmark-observation"></a>

- テーマ：構築と運用
- 出典：GitHub / Nutlope
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：未確認
- 確認日：2026-10-27
- リンク：https://github.com/Nutlope/hallmark
- 要約：HallmarkのプロジェクトREADMEは、このコーディングAgent向けデザインSkillで、コントラスト不足、フォーカス表示の欠落、動きを減らす設定への未対応、架空の事実、モバイルでのレイアウト崩れを公開を止める問題とし、よくある定型デザインは理由付きの例外を認め、細かな仕上げでは出荷を止めない。

実物の資料を読み、最初の画面を描画して独立の目で見てから全ページを作り、複数幅と新しい文脈でのレビューを行う設計だ。既存サイトの再設計ではリンク、入力、処理を比較し、見た目と引き換えに機能を落とさないようにする。参考になるのは問題の重大度を分ける点で、48テーマやチェックリスト自体が利用者体験の証明になるわけではない。

*対象期間は10月26日12:00〜27日12:00（日本時間）。科学の話は26日の公表で、発見自体は以前。Hallmarkは以前の観測を深掘りにした。技術の詳細の一部は、後日更新された原文で補っている。*
