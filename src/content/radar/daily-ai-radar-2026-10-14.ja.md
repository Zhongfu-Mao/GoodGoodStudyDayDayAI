---
title: "AIレーダー日報：2026-10-14"
date: 2026-10-14
category: radar
cadence: daily
coverImage: /images/radar/daily-ai-radar-2026-10-14.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-14.ja.mp3
audioDuration: 1062
audioSize: 8494582
draft: false
plainSummary: "代理の記録・文脈・判断を分離し、端末と設備の性能条件を読み解く。"
difficulty: intermediate
tags: [AI Engineering, Agents]
lang: ja
---

> 2026年10月13日12:00〜10月14日12:00（日本時間）の技術記事・ニュースレター紹介・トレンドを対象とします。原典公開日と紹介・観測日を区別し、全てが期間内の初発表という意味ではありません。

## 1. AI Engineering & アーキテクチャ

### Anthropic：Scionでエージェント規模のソース管理を分離

- 出典：Simon Willison / Anthropic
- 日付：2026-10-13（技術記事）
- リンク：https://www.anthropic.com/engineering/redesigning-source-control
- 要約：Anthropicのモノレポでは日次マージが5月の約2500件から9月の3万件超へ増え、CIチェックアウトは日次約2500万回に達しました。ScionはGitミラー全体の継続同期を避け、changesetに親との差分、Spannerにメタデータ、Cloud Storageに内容アドレス型ファイルを保存し、階層キャッシュから必要分だけ取得します。同社によると旧Gitミラー比でCPU・メモリ規模は200分の1、チェックアウトは分から秒へ、CI CPU容量は25%削減しました。特殊な社内規模の結果であり、一般的なGit代替や全社費用200分の1を意味しません。

<!-- radar-visual:source-control -->
[![Scion原図のchangeset・親関係・内容アドレス型ファイル](/images/radar/daily-ai-radar-2026-10-14-source-control.webp)](/images/radar/daily-ai-radar-2026-10-14-source-control.webp)

*左のchangesetは作者・親・ファイル変更を保持し、ハッシュが右のCloud Storageオブジェクトへつながります。破線は導出可能な木・パス情報で、全てをchangesetへ保存する必要はありません。保存役割の図で速度測定ではありません。 画像出典：[Anthropic / Scion](https://www.anthropic.com/engineering/redesigning-source-control)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:source-control -->

### LangSmith AI Search：行動で軌跡を検索、8K予算に見落としの余地

- 出典：LangChain
- 日付：2026-10-13（製品記事）
- リンク：https://www.langchain.com/blog/agent-traces-ai-search-langsmith
- 要約：AI Searchは「完了を主張したが実行していない」などの行動記述で軌跡を探します。SmithDBが各SDKの発言・ツール結果を共通trajectoryへ整形し、構造化条件で絞った候補を判定モデルが読み、一致を逐次返します。各軌跡は8Kトークンに制限され、ユーザー発言と対外応答を優先するため、長いツール出力にしかない障害は切り捨てられ得ます。LangSmith CloudのGCP米国・欧州・APAC向け公開ベータで、組織管理者の有効化後は追加料金なし。全軌跡の完全監査を保証するものではありません。

## 2. モデル最前線 & アルゴリズム探索

### 継続追跡｜Dyna対談：世界行動モデルと時間単位のロボット工程

- 出典：Latent.Space / Dyna Robotics
- 日付：2026-10-13（対談）。Dyna-2／2.1は9月の既発表内容
- リンク：https://www.latent.space/p/dyna
- 要約：対談では、100万時間超の人間動画で事前学習した世界行動モデルを実機デモで適応し、上位の構成で低レベル技能を約1時間の洗濯工程へまとめる方法を紹介します。新タスクのデモは数十分から数時間、切断例は約45分で、24時間のナプキン折り成功率99.4%も同社申告です。Dyna-2／2.1は本日の新発表ではありません。手の発熱、触覚・音声信号の不足、実機評価、供給網の課題もあり、限定デモの成功率を汎用安全性や一般化の保証にはできません。

### LFM2.5-24B-A2B：総24B・活性化2B・131K文脈

- 出典：HF project-team / Liquid AI
- 日付：2026-10-13（オープンウェイト公開）
- リンク：https://huggingface.co/blog/LiquidAI/lfm25-24b-a2b
- 要約：Liquid AIは総24B・1トークン当たり活性化2BのMoE推論モデルを公開し、文脈を32Kから131Kへ拡大、基礎・後学習ウェイトを提供しました。公式値はM5 Maxで184 tok/s、Ryzen AI Max+ 395で114 tok/sのデコード。単一B300の21K出力tok/s超は高並列時の総吞吐で、単一要求の速度ではありません。ローカルエージェントとツール利用を狙いますが、知識・コードの一部では大きな競合に劣ります。活性化2Bは保存重量2Bを意味せず、外部ツールの通信まで自動的に私有化するわけでもありません。

<!-- radar-visual:lfm -->
[![Liquid AI原図の3機種でのプリフィル・デコード・メモリ比較](/images/radar/daily-ai-radar-2026-10-14-lfm.webp)](/images/radar/daily-ai-radar-2026-10-14-lfm.webp)

*各組はプリフィル・デコード・メモリを示し、紫がLFM2.5-24B-A2Bです。M5 Maxの184 tok/sはデコードで、プリフィルではありません。メモリは短い棒ほど少なく、機種が異なる各組を任意端末への性能保証にできません。 画像出典：[Liquid AI](https://huggingface.co/blog/LiquidAI/lfm25-24b-a2b)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:lfm -->

## 3. 実践コード & ツールライブラリ

### 継続追跡｜Uzu：ベースM5とQwen3.5-9Bの投機デコード測定

- 出典：Daily Dose of Data Science / Mirai
- 日付：2026-10-13（Daily Doseの測定紹介）。プロジェクト観測2026-10-14
- リンク：https://github.com/trymirai/uzu
- 要約：Daily DoseはベースM5 MacBook ProでQwen3.5-9Bを個別に実行し、llama.cpp 22.0、MLX 25.1、Uzu 92.1 tok/sと報告しました。Uzuは複数位置を草案化し、Weaverで系列に組み、木構造で検証します。この測定では9Bモデルの1パス当たり平均7.5出力トークンを受理し、重みの繰り返し読み込みを減らしました。既存Rust推論エンジンの新しい測定紹介で、本日の初公開ではありません。利得は受理率、モデル・量子化、Metal実装、M5に依存し、全モデル・全環境で4倍とはいえません。

### ScaleDownミドルウェア：履歴要約・ツール圧縮・抽出を分離

- 出典：LangChain / ScaleDown
- 日付：2026-10-13（LangChain統合記事）
- リンク：https://www.langchain.com/blog/building-long-running-agents-with-scaledown-and-deep-agents
- 要約：LangChainはDeep Agentsとcreate_agentへScaleDownを統合しました。古い履歴の要約では最近の発言を残し、ツール結果を現在の質問に沿って圧縮し、ユーザー発言から値・位置・信頼度を抽出します。要約失敗時は元の履歴を維持し、圧縮後も元のツール内容を完全取得できる経路が必要です。専用モデルは分類も担いますが、自由な計画を行う汎用モデルの代替ではありません。費用・遅延の優位は公開の限定タスクでのベンダー比較で、エージェント全体へそのまま適用できず、外部送信の許可と境界も確認が必要です。

## 4. 業界 & ビジネス速報

### Muse Wonder：記憶・長期集中と段階的な提供範囲

- 出典：The Rundown AI
- 日付：2026-10-12（Meta原典）。2026-10-13（ニュースレター紹介）
- リンク：https://research.meta.ai/blog/muse-wonder
- 要約：MetaはMuse WonderとWonder Fullを紹介し、Active Memoryで会話間の関連情報を保存・取得、Active Focusで長い課題に継続対応し新情報へ適応、重要操作前に確認すると説明します。WonderはMeta Model APIとMuse Codeで提供され、FullはMuse Code購読者向け、Muse内蔵体験も購読者から段階展開です。12日公開・13日紹介の内容で、本日初発表ではありません。性能・安全性の優位はベンダーの説明で、追加安全報告は未公開。全員が即時利用できることや未知課題の独立した安全保証は意味しません。

### Maia 300：2027年配備計画、40%はトークン／MWの予測

- 出典：AI Valley
- 日付：2026-10-12（Microsoft発表）。2026-10-13（ニュースレター紹介）
- リンク：https://blogs.microsoft.com/blog/2026/10/12/microsoft-to-expand-azure-maia-system-to-multi-gigawatt-deployments/
- 要約：Microsoftは2027年からAzure MaiaをマルチGW規模の推論配備へ拡大する計画です。Maia 200は本番稼働中ですが、Maia 300の本番配備は2027年開始予定で、今日の稼働完了ではありません。同社の予測は主要GPUシステム比でトークン／MWを40%増、96アクセラレータラックの吞吐をMaia 200比最大7倍とするものです。前者は電力正規化、後者は異なるラック構成の比較で、どちらも将来予測。単一チップ速度や独立実測を示さず、GPUの全面置換を意味しません。

## 5. GitHub 人気 repo & トレンド追跡

### SGLang-Omni：音声・オムニ配信を段階ごとに構成

- 出典：GitHub Trending / SGLang
- 日付：2026-10-14（Pythonランキング観測、当日29スター増）
- リンク：https://github.com/sgl-project/sglang-omni
- 要約：前処理、エンコーダ、自己回帰生成、talker、デコーダ、ボコーダ、集約を分け、各段階を負荷に合うスケジューラで処理します。制御面が要求を調整し、共有メモリ、NCCL、NIXL、Mooncakeでテンソルを搬送、OpenAI互換のチャット・音声生成・転写入口を提供します。CUDAの対応が最も広く、Apple SiliconとIntel XPUは一部モデルの実験的対応で同等ではありません。当日29スター増は注目度の観測で、本日の公開、運用SLA、声の利用許諾の証拠ではありません。

### video-use：転写と必要時の画像で編集、方針確認後にレンダリング

- 出典：GitHub Trending / Browser Use
- 日付：2026-10-14（Pythonランキング観測、当日95スター増）
- リンク：https://github.com/browser-use/video-use
- 要約：video-useはElevenLabs Scribeで単語時刻・話者・音声イベントを転写し、複数素材を小さなテキストへ整理します。間やカットの判断時にフィルムストリップ・波形・単語ラベルを取得し、全映像をモデルに逐フレーム送る方式ではありません。方針を提案して人の確認を待ち、EDL作成・レンダリング後、カットを最大3回自己確認します。既存方向の継続で、当日95スター増を初公開とは扱いません。外部転写と、モデルが全編を見ない制約があり、プライバシー・素材権利・完成品質の別確認が必要です。

## 📬 Newsletter 精選

### Daily Dose：信頼度は選択行動に結び付ける、合格テストにも契約漏れ

- 出典：Daily Dose of Data Science
- 日付：2026-10-13（ニュースレターのスポンサー実例）
- リンク：https://blog.dailydoseofds.com/p/a-model-decision-is-only-as-safe
- 要約：30ファイル・3383行、46テスト合格の実例でも、選択したpage_teamが確率表にないと、別行動inspect_logsの0.90を流用し方針ゲートを越える不具合が見つかりました。対応は欠けた関連付けを拒否、安全な既定値、または人への移管であり、無関係な高得点との結合ではありません。0.80で実行、0.55～0.79で追加証拠、顧客影響確認はこの実例の業務方針で普遍的閾値ではありません。CodeRabbitスポンサーのローカルJSON fixture事例で、本番事故や全リスク検出の証明ではありません。

### ByteByteGo：フーリエ周波数から位置表現とRoPEへ

- 出典：ByteByteGo
- 日付：2026-10-13（技術解説）
- リンク：https://blog.bytebytego.com/p/how-the-math-used-in-19th-century
- 要約：正弦・余弦で曲線を分解する数学からTransformerの位置表現へつなぐ解説です。埋め込みは内容を表し、配列添字が計算に入らなければ位置情報にはなりません。位置機構のない基礎的な非因果self-attentionは置換に同変で、入力の並べ替えに出力も対応して並び替わり、出力不変ではありません。多周波の正弦・余弦が位置を規則的なベクトルへ変換し、RoPEはqueryとkeyを回転して相対距離を反映します。因果maskも構造信号を与えますが、遠い位置を計算できることは学習範囲外の長文理解を保証しません。

<!-- radar-visual:positions -->
[![ByteByteGoの複数周波数による曲線分解図](/images/radar/daily-ai-radar-2026-10-14-positions.webp)](/images/radar/daily-ai-radar-2026-10-14-positions.webp)

*左から元の曲線を異なる周波数成分へ分解し、足し合わせて再構成します。多周波の位置表現を理解する数学的導入で、熱分布は言語モデル実験ではなく、RoPEのquery/key回転を直接示す図でもありません。 画像出典：[ByteByteGo](https://blog.bytebytego.com/p/how-the-math-used-in-19th-century)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:positions -->
