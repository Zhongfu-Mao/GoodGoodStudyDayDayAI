---
title: "AIレーダー日報：2026-11-02"
date: 2026-11-02
category: radar
cadence: daily
radarFormat: 2
lang: ja
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-02.ja.mp3
audioDuration: 776
audioSize: 6208763
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
coverImage: /images/radar/daily-ai-radar-2026-11-02.ja-infographic.webp
draft: false
tags: []
---

対象期間：2026年11月1日12:00〜11月2日12:00（日本時間）。リポジトリ観察は確認日を併記し、深掘りは初出日を残す。

## 今日の重要な変化

- [ParticleDBの検証：修正済みの主張と受測版の結果を切り離す](#radar-jepsen)
- [推論effort：最大設定を買う前に、失敗を確かめる仕組みを考える](#radar-effort)

## 構築と運用

### Python更新後の依存関係エラー：ローカルの古い固定とアプリのロックを区別する

<a id="radar-uv-lock"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-11-01
- リンク：https://simonwillison.net/2026/Nov/1/delete-uv-lock-first/
- 要約：Simon WillisonはPython 3.15への更新後、ローカルのuv.lockがwatchfiles 1.1.1を固定したままで、3.15に未対応の古いPyO3によるビルド経路に入った例を記した。対象はロックをGit管理していないライブラリで、この古いローカル解決結果を除いて依存関係を解決し直すとテストを続行できた。学ぶべき点は、Pythonの版・固定依存・配布wheelの互換性を先に切り分けることだ。ライブラリでも開発テスト用のロックをコミットする運用はあり得る。この記事を「ライブラリは必ずロック不要」や本番アプリのロック削除へ一般化しない。開発環境の経験談であって、モデル能力の更新や万能な修復保証ではない。

### Handyの観察：ローカル音声認識から入力欄への貼り付けまでを確認する

<a id="radar-handy"></a>

- 出典：cjpais／Handy
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：未確認
- 確認日：2026-11-02
- リンク：https://github.com/cjpais/Handy
- 要約：Handyは録音ショートカット、Sileroの音声区間検出、ローカルWhisperまたはParakeet V3による認識、テキスト貼り付けをつなぐWindows・macOS・Linux向けアプリだ。認識音声をクラウドへ送らずに済むというプロジェクト説明だが、ローカル認識だけで操作全体のプライバシーは保証されない。READMEはデバッグログ提出前の転写内容の削除を求め、高負荷時にクリップボードを早く復元しすぎると以前のコピー内容を貼る競合も記す。Reliable Pasteは実験的で、Linuxには入力ツールやショートカット、フォーカスの制約もある。現行実装の観察で、言語横断の精度実測や本日公開の主張ではない。追加処理・連携を有効にする場合は、そのデータ経路を別途確かめたい。

### T3 Codeの観察：既存のコーディングAgentを束ねる操作面

<a id="radar-t3code"></a>

- 出典：pingdotgg／T3 Code
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：未確認
- 確認日：2026-11-02
- リンク：https://github.com/pingdotgg/t3code
- 要約：T3 CodeはAgent実行フレームワークの操作面として、モバイル・Web・Electronデスクトップから手元のコーディングAgentを制御する。READMEはClaude Code、Codex、Cursor、Grok Build、OpenCode、Antigravity、fxを挙げる。多くの接続は既存CLIと個別ログインが前提だが、Antigravityは設定画面のインストールとGoogleログインを使えるため、全接続に事前CLIが必須とはいえない。統一するのは操作入口で、新しい推論モデルでも上流の利用枠を増やす仕組みでもなく、実行権限のリスクも消えない。プロジェクトは初期段階で不具合や大型機能の貢献制限を明記する。遠隔操作・差分確認・作業再開の道具として捉え、認証・ネットワーク公開・権限モードは別途検証したい。初公開や安全性監査の主張ではない。

<!-- radar-visual:t3code-ui -->
[![T3 Code公式サイトの複数Agentセッションと作業ブランチ画面](<https://t3.codes/_astro/app-desktop.BHuzLVLF.webp>)](<https://t3.codes/_astro/app-desktop.BHuzLVLF.webp>)

*左はプロジェクトとセッション、中央は依頼と複数Agentの進捗、右は作業ブランチ・変更・子タスクを示す。操作面の整理方法を説明する公式デモ画面であり、今回の実測や実行器間の同一権限・隔離の証明ではない。 画像出典：[T3 Code](https://github.com/pingdotgg/t3code)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:t3code-ui -->

## 深掘り

### ParticleDBのJepsen報告：「修正済み」を版番号と再実行可能な証拠に結び付ける

<a id="radar-jepsen"></a>

- 出典：Jepsen／Kyle Kingsbury
- 情報経路：ブログ
- エビデンス区分：独立再現
- 初出日：2026-10-31
- テーマ：構築と運用
- リンク：https://jepsen.io/analyses/particledb-1.1.4
- 要約：Simonが11月1日に引用した報告は、開発元Orkesの資金提供を受け、Jepsenの公開倫理方針に沿ってParticleDB 1.1.4〜1.1.18.11.rc-22を調べたものだ。96件の問題を報告し、受測最終版では多くが解消したように見える一方、10件が残った。既定のoccでは通常運転でコミット済み書き込みが失われ、serializableでも内部異常とLost Updateが残る。Orkesは後の1.1.19-rc.13ですべて解消したと述べるが、この報告の独立再検証済み結果とは区別する。範囲は単一ノードSQLの一部で、複製クラスタやベクトル検索、全APIを検証していない。AI支援の修正が成功を主張しても検証を通らない協働上の問題も記すが、AIコード全般への因果実験ではない。版・失敗ケース・変更説明・再試験を結び付けるために読み直したい。

### 推論effortは常に最大がよいとは限らない：問題別の後退と実行全体の費用を見る

<a id="radar-effort"></a>

- 出典：Johns Hopkins University／Together AI／Cornell University
- 情報経路：論文、Newsletter
- エビデンス区分：著者の研究
- 初出日：2026-10-25
- テーマ：能力とエビデンス
- リンク：https://arxiv.org/abs/2610.34491
- 要約：Everyの11月1日週次まとめから再訪した10月25日のプレプリント。数学・科学・Agentを含む四ベンチマークで、課題・プロンプト・実行枠組み等をそろえてeffortを比較する。高設定は平均成績を上げる場合も、低設定で解けた課題を落とす。全設定で解ける課題集合では、最高受測設定の平均API料金が最低設定の最大42倍になったが、どの課題も42倍という意味ではない。待ち時間を仮定の賃金で換算する別の総費用指標は、API請求額と区別が必要だ。低設定から検証失敗後に昇格する戦略は信頼できる正誤判定に依存し、自由形式の仕事にはその判定器がないことも多い。商用モデルのmax設定は未評価で、Agent課題は予算上各設定1回の実行という限界もある。実務での一律降格や本レーダーの節約率を示す研究ではない。

<!-- radar-visual:effort-behavior -->
[![低・高effort間のモデル別行動比率変化を比較する論文図4](<https://arxiv.org/html/2610.34491v1/behavior_overview.png>)](<https://arxiv.org/html/2610.34491v1/behavior_overview.png>)

*横軸は評価・推論・計画などの行動で、色は最低から最高の注釈済み推論設定への比率変化（百分率ポイント）を示す。左右は修正版SWE-Bench ProとTerminal-Bench。橙色の増加は正解向上を意味せず、短剣印は未補正90%区間がゼロをまたがない印であり、42倍の費用グラフではない。 画像出典：[Kaiser Sun、Yongchan Kwon、Zain Hasan、Shang Zhu、Kaitlyn Zhou、Federico Bianchi](https://arxiv.org/abs/2610.34491)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:effort-behavior -->

### Felix Riesebergの採用観察：小課題の面接より動く試作で判断力を示す

<a id="radar-felix"></a>

- 出典：Felix Rieseberg
- 情報経路：ブログ、Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-10-27
- テーマ：プロダクトと実際の導入
- リンク：https://felixrieseberg.com/hunger-beats-tenure-advice-for-junior-engineers/
- 要約：Everyが11月1日に再訪した個人記事で、Anthropicの工程管理者Felix Riesebergは従来の小規模コーディング課題を候補者に課すのをやめたと述べる。Claudeがその種の課題をこなせる一方、成果を出す開発者が必ずしも面接課題を得意としないためだ。本人の採用実践と判断であって、Anthropic全社の公式な廃止制度ではない。助言の中心も単なる実装速度ではなく、事業目標を理解し、重要な問題を一つ選び、動く試作にまとめ、複数の壮大な案を詰め込まないことにある。新しいエンジニアが週末にGUIの試作を作った例を挙げ、作品の品味・共感・原則的思考を見るという。「実装を生成する力」と「何を作り、その価値をどう伝えるか」を切り分けるための再読であり、協働手順の無視や職業上の成功を保証する話ではない。
