---
title: "AIレーダー日報：2026-10-22"
date: 2026-10-22
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-22.ja-infographic.webp
draft: true
tags: []
plainSummary: "推論コアの公開から完全なオンラインサービスまでには別の構築が必要。 領域語彙はコストを変えるが、効果は負荷条件に依存する。 監督用のインターフェースにも追加費用とコード権限の境界がある。"
---

2026-10-21 12:00〜2026-10-22 12:00（日本時間）の公開資料から12件を整理する。初出日、発表・実測・見解を区別し、日付未確認の実装は現在の観察として扱う。

## 今日の重要な変化

- [推論コアの公開から完全なオンラインサービスまでには別の構築が必要。](#radar-deepinfer)
- [領域語彙はコストを変えるが、効果は負荷条件に依存する。](#radar-vocabx-vocabulary)
- [監督用のインターフェースにも追加費用とコード権限の境界がある。](#radar-claude-mods)

## 能力とエビデンス

### IBM、Granite Speechの3モデルを更新

<a id="radar-granite-speech-5"></a>

- 出典：Hugging Face / IBM Granite
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-21
- リンク：https://huggingface.co/blog/ibm-granite/granite-speech-5
- 要約：IBMは多言語対応の2B音声言語モデルを公開し、470M Turbo CTCと4.1 2B Plusも更新した。公式発表では、新2BモデルはOpen ASRの公開英語短尺セットで平均WER 5.06%、オープンウェイト中2位。Turboは高スループット、複数話者向けモデルは長尺音声、時刻、話者帰属を改善したという。数値はIBMと指定ベンチマークに基づき、全言語・騒音環境・実運用録音へそのまま一般化できない。

<!-- radar-visual:granite-speech -->
[![Granite Speech 5.0 2Bと公開ウェイトモデルの英語短尺WER比較](/images/radar/daily-ai-radar-2026-10-22-granite-speech.webp)](/images/radar/daily-ai-radar-2026-10-22-granite-speech.webp)

*青がGranite 2Bで、5.06はこの公開英語短尺セットの単語誤り率を表し、低いほどよい。横軸には切断があり、棒の長さをゼロ起点として比較できない。全言語、長時間録音、本番環境の評価ではない。 画像出典：[IBM Granite / Open ASR Leaderboard](https://huggingface.co/blog/ibm-granite/granite-speech-5)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:granite-speech -->

## 構築と運用

### VocabX、特定の作文採点ワークロードで推論コストを削減

<a id="radar-vocabx-vocabulary"></a>

- 出典：Hugging Face / Dharma AI
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-10-21
- リンク：https://huggingface.co/blog/Dharma-AI/vocabx-vocabulary-specialization
- 要約：Dharma AIはVocabXでQwen3-4Bのポルトガル語作文採点器向け語彙を再構築し、入力と生成の実測コストに応じてサブワードとマクロトークンを選んだ。同一RTX 5090で500要求を実行したところ、平均出力は350から101トークンへ減り、測定コストは77%低下し、採点ベンチも改善したという。ただし単一言語・固定JSON形式の特定ワークロードで、論文は査読中のため数値は変更され得る。

<!-- radar-visual:vocabx -->
[![同じ英文を既存トークナイザーは14、VocabXの例は4トークンに分割](/images/radar/daily-ai-radar-2026-10-22-vocabx.webp)](/images/radar/daily-ai-radar-2026-10-22-vocabx.webp)

*上段は同じ英文を細かく分け、下段は頻出句をまとめて語彙特化の仕組みを示す。右上の77%は本文にあるポルトガル語作文採点の指定負荷での値であり、この英文や全タスクに共通する効果ではない。 画像出典：[Dharma AI / VocabX](https://huggingface.co/blog/Dharma-AI/vocabx-vocabulary-specialization)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:vocabx -->

### Claude Mods、エージェント外殻を人間の注意インターフェースへ

<a id="radar-claude-mods"></a>

- 出典：Latent.Space
- 情報経路：Newsletter
- エビデンス区分：著者の実測
- 初出日：2026-10-21
- リンク：https://www.latent.space/p/claude-mods
- 要約：著者はClaude Modsを試し、JS/TSプラグインがプロンプト、ツール呼び出し、画面描画へ介入し、主処理が見落としたリスクを別エージェントで示せると報告した。自作監督Modは111ターン中99回発火し、1回あたり約5〜6千入力相当トークンとの見積もりで、ノイズも多い。さらにModは利用者権限で動き、プロンプトやファイルを読めるうえサンドボックスがなく、内蔵Modはsafe modeでも動作する。

### プロンプトキャッシュとセマンティックキャッシュは別の重複計算を減らす

<a id="radar-llm-prompt-caching"></a>

- 出典：ByteByteGo
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-21
- リンク：https://blog.bytebytego.com/p/llm-prompt-caching-versus-semantic
- 要約：このシステム設計解説は2種類を分ける。プロンプトキャッシュは完全一致する入力接頭辞とKV状態を再利用し、prefillを減らすがdecodeは必要。セマンティックキャッシュは埋め込みで過去の完成回答を再利用できる一方、否定、数値、版、権限、鮮度の違いで誤ヒットし、ミス時には埋め込み・検索分も余計にかかる。併用は可能だが、閾値、メタデータ、TTL、版による失効は用途別に評価が必要である。

### Beacon、コーディングエージェント間の共有トレースと記憶を実演

<a id="radar-give-claude-code"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の実測
- 初出日：2026-10-21
- リンク：https://blog.dailydoseofds.com/p/give-claude-code-codex-and-cursor
- 要約：Daily Dose of Data ScienceとAsymptote Labsの提携デモは、オープンソースのBeaconを紹介する。OpenTelemetry、フック、ローカル会話ファイルから20超のコーディングエージェントのプロンプト、ツール呼び出し、コマンド、変更、回答を共通トレースにし、検索、作業再開、スキル抽出に使う。履歴から資格情報の外部送信も見つけたが、これはトレース自体が機密を集め得ることも示し、自動的なプライバシー保証や大規模独立評価は示されていない。

### DeepInferのオフライン推論コア、完全なサービスには別途キャッシュと負荷分散が必要

<a id="radar-deepinfer"></a>

- 出典：Latent.Space / DeepSeek
- 情報経路：Newsletter、GitHub
- エビデンス区分：公式発表
- 初出日：未確認
- 確認日：2026-10-22
- リンク：https://github.com/deepseek-ai/DeepInfer
- 要約：DeepSeekの現行リポジトリはV4.1-Flashのオフライン推論向けに最適化カーネル、MoE並列化、草稿検証、非同期スケジューリング、構造化出力を公開し、SM100とAscend 950に対応する。バッチ不変推論と決定的サンプリングはNVIDIA限定で明示的な設定が必要。完全なサービスに要るKVキャッシュ、prefill/decode分離、複製間の負荷分散は含まれず、ベンチにもGPU数と接続条件がある。現行実装の確認として扱い、集約記事の売上・利益率は検証済みとしない。

## プロダクトと実際の導入

### AT&TとOpenAI、法務知識・案件受付システムを計画

<a id="radar-att-legal"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-21
- リンク：https://openai.com/index/att-legal
- 要約：OpenAIの事例によると、AT&Tは法務知識レイヤーを共同構築し、LegalEdgeチームを基盤に自然言語の案件受付窓口を計画している。全社の法務依頼を分類・優先順位付けし、先例、調査、過去成果と結び付け、担当弁護士へ背景と初動案を示す構想だ。原文は建設中の計画を述べるだけで、稼働指標、効率、法的品質の評価はなく、最終判断は常に弁護士が担うとしている。

### Claude Duet研究プレビュー：著者による常駐エージェントの初期体験

<a id="radar-vibe-check-duet"></a>

- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：著者の実測
- 初出日：2026-10-21
- リンク：https://every.to/vibe-check/vibe-check-duet-anthropic-s-always-on-agent
- 要約：有料記事の公開部分は、Anthropicから事前提供された研究プレビュー版Claude Duetを著者が試した記録である。iOS、Android、Webの独立アプリでOpus 5.5を使い、話題別チャンネル、作業追跡、文書やダッシュボード編集が可能と評価する一方、メール草案はDotより弱く、定期実行は独自コネクタへ届かず、音声は文字起こしのみと指摘する。残りはペイウォール内で、単一著者の初期体験に限られる。

### Tenex、計画・意思決定・受入根拠を共有の開発記録へ

<a id="radar-tenex"></a>

- 出典：Latent.Space
- 情報経路：ポッドキャスト、Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-21
- リンク：https://www.latent.space/p/tenex
- 要約：TenexはLatent.Spaceの対談で、共通スキル、プロジェクト文書、CLIをまとめ、計画と意思決定をコードと同じGitに保存するMetaHarnessを説明した。後続エージェントが実装の理由も読める構成で、成果連動報酬が顧客理解や設計をどう扱うかも論じる。番組では人間審査の優勝チームがAI順位では19位だった例も紹介し、シナリオ試験と利用価値の判断を分ける。チームの経験談であり、小規模な単一案件には構造が過剰になり得る。

<!-- radar-visual:tenex -->
[![Tenex MetaHarnessが現状、将来意図、履歴と根拠をプロジェクト記録へ集約](/images/radar/daily-ai-radar-2026-10-22-tenex.webp)](/images/radar/daily-ai-radar-2026-10-22-tenex.webp)

*中央の記録は現状、将来意図、履歴と根拠に分かれ、右のLinear、GitHub、顧客更新はその投影となる。上層は記録を読んで横断的な表示を作る。チームの運用構造を示す図で、全接続や状態が自動で常に正しく動く証明ではない。 画像出典：[Tenex / Latent.Space](https://www.latent.space/p/tenex)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:tenex -->

## 産業とガバナンス

### OpenAI、AI時代の重大脆弱性に向け5段階の協調開示案

<a id="radar-coordinated-disclosure"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-21
- リンク：https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities
- 要約：OpenAIは、CalifがGPT-5.6 SolでPHPの重大欠陥を見つけ、Wizも2件の脆弱性を独立発見・報告し、PHP保守者が修正公開を主導したと説明する。これを基に、上流での検証・修正、関係組織の準備期間、政府連携、下流製品更新、公開後の導入支援からなる5段階案と、10億ドル分のDaybreak補助アクセスを掲げた。ただし公式の提案段階で、悪用防止分類器が正当な研究を妨げ得る課題も認める。

### OpenAIモデルとCodexワークフロー、Google Cloud提供を計画

<a id="radar-openai-models-google-cloud"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-21
- リンク：https://openai.com/index/openai-models-google-cloud
- 要約：OpenAIとGoogle Cloudは、OpenAIのフロンティアモデルとCodexのエージェント型ワークフローをModel Gardenへ導入する計画を発表した。将来はMarketplace経由で購入し、既存のGCP利用コミットメントへ充当でき、Google AntigravityとGemini Agentにも提供予定という。一般提供は発表時点ではなく数週間後の計画であり、MicrosoftがOpenAIの主要クラウドパートナーである点も維持される。

### 東南アジアのデジタル経済報告、AI導入と基盤条件を併せて検討

<a id="radar-economy-sea"></a>

- 出典：Google / Temasek / Bain
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-21
- リンク：https://blog.google/company-news/inside-google/around-the-globe/google-asia/e-conomy-sea-report-2026/
- 要約：Google・Temasek・Bainの年次報告は、2026年の東南アジアのデジタル経済GMVを3,680億ドルと推計し、AI導入には持続可能な費用、データセンター増設、エネルギー効率、域内ガバナンスが必要と論じる。5年間でAI利用60倍、データセンター容量約3倍という値は予測であり、実現した伸びではない。エージェント取引への意向も実際の許可や取引量とは異なり、GMV・売上・金融取引総額を足したりAIの追加収入とみなしたりできない。
