---
title: "AIレーダー日報：2026-11-03"
date: 2026-11-03
category: radar
cadence: daily
radarFormat: 2
lang: ja
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-03.ja.mp3
audioDuration: 949
audioSize: 7589909
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
coverImage: /images/radar/daily-ai-radar-2026-11-03.ja-infographic.webp
draft: false
tags: []
description: "Gitの同時利用、法律Agentの評価、日常タスクの採点から、導入統計と常駐Agentの設計まで。"
plainSummary: "速さは操作別に、正しさはタスク別に測る。高得点・普及率・将来の設備計画には、それぞれ異なる条件がある。"
---

対象期間は2026年11月2日12:00から11月3日12:00（日本時間）。新しい発表・解説と、当時の実装の観察を扱い、旧稿と初出時刻が不明な論考は最後の深掘りに分ける。

## 今日の重要な変化

- [Pando：Gitの参照とオブジェクト保存を分け、多数Agentの同時利用へ対応](#radar-pando-git)
- [Legoraの継続追跡：顧客の作業履歴を読めない環境で法律Agentを評価する](#radar-legora-evaluation)
- [企業のAI導入曲線：割合の比較前に質問文の定義を確認する](#radar-census-question-wording)

## 能力とエビデンス

### LifeVal：日常の用事を進める能力を測る。例示の高得点は現実の保証ではない

<a id="radar-lifeval"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-02
- リンク：https://openai.com/index/lifeval/
- 要約：OpenAIは個人アシスタントの評価を知識問題の回答から、保育施設の比較、家族のケア、行政手続き、買い物などの作業へ広げた。米国と国際的な時間利用研究を参照し、3,995人の代表性のある調査から支援ニーズを選び、過去一年の改善追跡に使ったという。ページの一部タスクは高得点だが、独立再現に十分な全標本・反復回数・採点手順は示されていない。実際の不動産取引、医療ケア、申請の確実な完了を保証する数値ではない。評価の終点を制約と成果物に置き、人の選択と確認を残す考え方が参考になる。

### Nemotronの仕組み：有界状態、疎な活性化、重みのメモリは別の話

<a id="radar-nemotron-mechanisms"></a>

- 出典：ByteByteGo
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-11-02
- リンク：https://blog.bytebytego.com/p/how-nvidias-new-nemotron-model-works
- 要約：新しい解説記事であり、Nemotronがこの日に公開されたという意味ではない。Mambaの固定サイズ状態、残る注意層のKVキャッシュ、tokenごとに専門家を選ぶMoE、KVを共有する複数query head、先読み候補を主モデルで検証する生成を区別して説明する。有界状態への圧縮は正確な過去参照を損なう場合がある。MoEはtokenごとの計算を減らすが、非活性の専門家の重みも後で利用できる必要があり、活性パラメータ数だけではモデル全体の常駐メモリを見積もれない。NVFP4と量子化を考慮した蒸留も紹介する。導入時は文脈・重み・ルーティング・検証の費用を分けて測る必要があり、記事自体は同条件の性能再現ではない。

<!-- radar-visual:nemotron-moe -->
[![MoEの模式図：routerがtokenごとに少数の専門家を選ぶ](<https://substack-post-media.s3.amazonaws.com/public/images/b6e0c15e-4f36-4c20-9f68-3531856785e8_3882x2280.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/b6e0c15e-4f36-4c20-9f68-3531856785e8_3882x2280.png>)

*図のRouterは「6から2を選ぶ」という例で、選択・非選択の経路を描く。Nemotronの実際の専門家数ではない。使わない経路もモデル内に存在するため、活性パラメータが少ないことと重み全体のメモリ削減は同じではない。 画像出典：[ByteByteGo](https://blog.bytebytego.com/p/how-nvidias-new-nemotron-model-works)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:nemotron-moe -->

### 12種の最適化手法：勾配履歴、状態メモリ、総学習時間を比べる

<a id="radar-optimizer-state-cost"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-11-02
- リンク：https://blog.dailydoseofds.com/p/12-optimizers-for-training-neural
- 要約：新しい教材はSGD、モメンタム、適応的更新、行列の前処理などを、履歴をどう次の一歩へ反映し、何を保存し、追加計算に見合うかという共通の問いで比較する。Adamは各パラメータに一次・二次モーメントを保存する。10億パラメータと二つのFP32状態なら約8GBという例は、その二状態だけであり、重み・勾配・活性などを含まない。反復が20%減っても一歩が30%遅ければ、総時間は0.8×1.3=1.04倍になる。目標品質、ピークメモリ、実時間を一緒に測る必要があり、滑らかな模式図や反復数だけで最良の手法は決まらない。

<!-- radar-visual:optimizer-path -->
[![細長い谷底で往復するSGDの更新経路の模式図](<https://substack-post-media.s3.amazonaws.com/public/images/c4815a9f-5317-4047-b3dd-0f5a1b9c0c70_2752x1536.jpeg>)](<https://substack-post-media.s3.amazonaws.com/public/images/c4815a9f-5317-4047-b3dd-0f5a1b9c0c70_2752x1536.jpeg>)

*左のSGDは谷底に沿ってジグザグに進み、右は往復成分の相殺でモメンタムの考え方を説明する。更新方向の概念図であり、同条件の収束速度実験でも、状態メモリの費用を示す図でもない。 画像出典：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/12-optimizers-for-training-neural)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:optimizer-path -->

## 構築と運用

### Pando：Gitの参照とオブジェクト保存を分け、多数Agentの同時利用へ対応

<a id="radar-pando-git"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-02
- リンク：https://openai.com/index/scaling-git-at-openai/
- 要約：OpenAIが4月から運用するGitサービスPandoの設計を公開した。Gitのプロトコルとオブジェクトモデルを保ちつつ、参照・オブジェクト・提供層を分離し、pack再利用、packfile-uri、地域キャッシュで重複転送を減らし、裏側で整理する。単一refの更新は直列化できるが、複数refを同じ時点のスナップショットとして読める保証ではない。運用上のpush中央値は約80%短縮、当該指標で約5倍と報告する。全Git操作や開発生産性が5倍になる意味ではない。Pando自体のオープンソース化の告知でもなく、データ配置・キャッシュ・整合性を分けて設計する点が学びになる。

<!-- radar-visual:pando-branches -->
[![Pandoのtrunkとtopicで共有コミットとオブジェクト群を再利用する構造図](<https://images.ctfassets.net/kftzwdyauwt9/5wDkqDPp9fjzOjtAQRDRzw/117b2f107fd11818f7e9154c958b0878/representing-branches-in-pando-diagram-desktop-light.svg?w=3840&q=90>)](<https://images.ctfassets.net/kftzwdyauwt9/5wDkqDPp9fjzOjtAQRDRzw/117b2f107fd11818f7e9154c958b0878/representing-branches-in-pando-diagram-desktop-light.svg?w=3840&q=90>)

*左右はTRUNKとTOPICで、A～Fがコミット、TOPIC側にはGもある。枠はオブジェクトのまとまりを示し、既存履歴を共有する構造を説明する。複数refの同時点整合性を保証する図や、加速倍率の測定結果ではない。 画像出典：[OpenAI](https://openai.com/index/scaling-git-at-openai/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:pando-branches -->

### LLM 0.37：互換エンドポイント設定と混合メディアのembedding型を拡張

<a id="radar-llm-037"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-02
- リンク：https://simonwillison.net/2026/Nov/2/llm/
- 要約：Simon Willisonが約二か月分の機能と修正をまとめたLLM 0.37を公開。gpt-6.1-sol、gpt-6.1-terraとOpenAI互換モデルを設定するendpoint addを追加し、embedding入力では異なるバイナリにそれぞれのcontent-typeを保持して、音声・画像・動画などの混在へ対応する。既定モデルの変更は自分で既定値を設定していない場合に限る。AI支援PRを例付きの不具合報告として分類し、採用または自分で修正するという保守経験も紹介するが、全プロジェクトで審査費用が下がる証拠ではない。更新時はエンドポイント、プラグイン互換性、既定値の変更を確認したい。

### agent-desktopの観察：スナップショットに属する参照で操作し、動作後に観察し直す

<a id="radar-agent-desktop-observation"></a>

- 出典：Vercel Labs / agent-desktop
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：未確認
- 確認日：2026-11-03
- リンク：https://github.com/vercel-labs/agent-desktop
- 要約：11月3日の締切前の公開READMEでは、このクロスプラットフォームCLIはOSのアクセシビリティツリーで画面を読み書きし、スナップショットID付き参照を返す。参照が古い、または対象が曖昧なら動作を拒み、観察し直す。headlessでも前面化と合成入力は禁止される。初出日は未確認で、当日の新公開ではなく当時の実装の観察である。スナップショット、クリップボード、画像、デバッグ出力には私的情報が入り得る。任意のJEV補助は画面説明を設定先モデルへ送るため、ネイティブAPIやローカルCLIというだけでプライバシー・隔離は保証されない。

## プロダクトと実際の導入

### Legoraの継続追跡：顧客の作業履歴を読めない環境で法律Agentを評価する

<a id="radar-legora-evaluation"></a>

- 出典：Latent.Space / Jacob Lauritzen
- 情報経路：Newsletter、ポッドキャスト
- エビデンス区分：著者の説明
- 初出日：2026-11-02
- リンク：https://latent.space/p/building-ai-for-lawyers-jacob-lauritzen-cto-of-legora/
- 要約：新しい対談の中心は資金調達や売上の再掲ではなく評価と業務設計にある。CTOによれば顧客の法律データは機密性が高く、エンジニアと弁護士が約一万ファイルの模擬資料室を作り、業務分野・タスク・失敗型ごとにモデル更新の後退を見る。本番では約10～20種類の失敗を軽く検査する。表形式の審査はまず10行を試し、質問を直してから多数セルへ広げ、悪い質問の大量反復を避ける。受訪者が説明する内部手法であり、独立した安全性・精度・収益監査ではない。対談で話題になっても採用を明確に否定した検索方式や、agent-as-APIの構想を導入済み機能として扱うべきではない。

## 産業とガバナンス

### Grid Protectors：計算拠点の需要削減能力を電力契約へ組み込む

<a id="radar-grid-protectors"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-02
- リンク：https://openai.com/index/grid-protectors-program/
- 要約：OpenAIは将来の計算拠点について、電力会社や規制当局と、逼迫時に需要をどれだけ・どの速さで・どの長さ減らせるかを取り決め、拠点が生む供給・設備費用を負担する計画を発表した。Georgiaの計画拠点の契約には最大1,000MWの柔軟な需要応答が含まれるが、拠点は開発中であり、稼働済み能力ではない。記事の2029年以降の節約予測は電力会社の大口負荷契約全体に関するもので、OpenAI単独へ帰属させられない。ピークを抑えて固定費を分担する設計だが、他の利用者への利益は地域条件、履行、新たな電源・送電投資に依存し、柔軟性だけで設備投資は代替できない。

### 企業のAI導入曲線：割合の比較前に質問文の定義を確認する

<a id="radar-census-question-wording"></a>

- 出典：Simon Willison / U.S. Census Bureau
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-02
- リンク：https://simonwillison.net/2026/Nov/2/census-bureau-super-intelligence/
- 要約：Simonは米国国勢調査局の企業調査を再作図し、「商品やサービスの生産でAIを使うか」が「何らかの業務機能で使うか」へ変わったことを確認した。大企業の約12%から約30%への変化はこの定義変更をまたぐため、同一指標の普及増加とは直接比較できない。使った最新データの公表日は10月22日であり、11月2日の新標本ではない。10月19日からはAIをSuper Intelligenceと呼ぶ質問文へ変わったが、記事時点で対応する最初の結果は木曜日待ちだった。言い換えが回答率へどう作用するかは未確認。傾向を見る際は定義、標本の交代、データ公表日、作図日を併せて残したい。

### DeepSeekの「大きな魚」をめぐる論考：親しみやすさと誤りへの期待

<a id="radar-deepseek-personification"></a>

- 出典：老范讲故事
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-03
- リンク：https://lukefan.com/2026/11/03/deepseek-big-fat-fish-ai-personification/
- 要約：著者はDeepSeekをめぐる民間のキャラクター像を、AIの擬人化、利用者の期待、製品設計から論じる。親しみや失敗する性格は心理的距離を縮める一方、システムの誤りまで性格として許容させる可能性がある。ただしこれは著者の解釈であり、公式の意図を立証したものではない。権限、費用、出力責任の説明を免除もしない。再生数、価格、返金、実験効果の転述から収益や利用行動を断定せず、親しみやすい表現の横に、能力の限界、実行状態、人の確認が必要な操作を明示できるかが実務的な問いになる。

## 深掘り

### 常駐Agentの文脈設計：通知、記憶、非同期処理、目標の調整

<a id="radar-proactive-context-challenges"></a>

- 出典：Harrison Chase / LangChain
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-02
- リンク：https://www.langchain.com/blog/context-engineering-challenges-late-2026
- テーマ：構築と運用
- 要約：ページは11月2日付だが初出時刻は未確認のため、見解の深読として扱う。Harrison Chaseは、モデルがループでツールとサンドボックスを使う構成へ収束しても、文脈設計が完成したわけではないと論じる。常駐Agentには通知の頻度、記憶の粒度、長い処理の完了通知、主Agentが稼働中または承認待ちの際の引き継ぎ、長期目標の抜け道対策が必要になる。ブラウザーの大きなDOMや画像も課題である。汎用解決策を提供済みという宣言ではなく、通知と目標の扱いも業務設計に含めるための問題整理だ。

### dsh-superagentを読む：単一リポジトリの研究試作と人の注意資源

<a id="radar-dsh-superagent-prototype"></a>

- 出典：DeepSeek team / dsh-superagent
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：2026-10-31
- リンク：https://github.com/deepseek-ai/dsh-superagent-prototype
- テーマ：構築と運用
- 要約：公開導入のコミットは10月31日で、本期の新製品発表ではない。締切前READMEは、DeepSeek Harnessを使い単一GitHubリポジトリで動く能動的なコーディングAgentと説明する。GitHubと任意のFeishuを監視し、許可された依頼を作業項目にし、個別セッションとディレクトリで実行して元の会話へ成果を返す。人の作業はWebパネルで示す。依頼やチーム規則が許すときだけ動き、注意が必要または結果が役立つときだけ通知する方針が特徴だ。参考用の研究コードであり公式製品や本番準備済みソフトではなく、公開版は内部実装と異なり、論考の一部は将来構想である。

### 管理論の再読：暗黙知を依頼の境界、例、評価へ変える

<a id="radar-management-rerun"></a>

- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：未確認
- 確認日：2026-11-03
- リンク：https://every.to/also-true-for-humans/what-ai-is-teaching-us-about-management-rerun
- テーマ：プロダクトと実際の導入
- 要約：11月2日に再掲された1月の旧稿で、初出の正確な日は未確認。11月時点のモデル能力の新測定ではない。成果、具体例、品質基準を明示し、実行と戦略を分け、分業後も調整を残すという管理論をAgentの依頼へ重ねる。人が暗黙に補う背景や基準をAgentが推測できるとは限らず、明示化は人の協働にも役立ち得る。旧ゲーム・ツールの体験を現在の性能の証拠にせず、人の組織との類比を因果効果と取り違えないことが必要だ。

### Phonic-1の旧稿を読む：聞く・話す・ツール利用をつなぐ全二重音声

<a id="radar-phonic-full-duplex"></a>

- 出典：Phonic
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-29
- リンク：https://phonic.ai/blog/phonic-1
- テーマ：能力とエビデンス
- 要約：原公告は10月29日で、後のまとめ記事で初出日は変わらない。チームは、利用者が話す間も聞き、割り込みに応じ、会話中にツールを呼ぶエンドツーエンドの全二重音声モデルを紹介する。音声認識、テキストモデル、音声合成を分けた構成の引き継ぎを減らす狙いだ。公告は外部ベンチマークと第三者による人の盲検評価を引用するが、その手順は本稿で独立検証していない。自然さの比較では人間に優位が残る。順位だけで全面的超越とは言えない。製品では初動速度に加え、割り込みからの復帰、ツール処理の前後状態、雑音、言語別の対話全体を測りたい。

### Suncatcherの旧稿を読む：軌道上の初応答と商用宇宙計算の隔たり

<a id="radar-suncatcher-orbit-response"></a>

- 出典：Google Research
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-30
- リンク：https://blog.google/innovation-and-ai/models-and-research/google-research/project-suncatcher-satellite-response/
- テーマ：産業とガバナンス
- 要約：10月30日の発表では、Project Suncatcherの試作衛星上のTPUでGemma 4を動かし、最初の応答を受信したという。軌道環境での計算可能性を示す一段階であり、商用規模の費用、継続的な信頼性、衛星群間通信を解決した証明ではない。熱・放射線環境でのハードウェア挙動は引き続き調べ、2027年の二衛星接続試験も将来計画だ。一度の応答、長期安定稼働、産業基盤への拡張を分けて評価する必要がある。
