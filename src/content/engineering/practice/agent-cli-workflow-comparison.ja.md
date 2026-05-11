---
title: "Codex、Claude Code、Gemini CLI：賢さではなくワークフローで比べる"
date: 2026-05-11
category: engineering
description: "AI Coding Agent をモデル性能だけでなく、コード理解、変更、長時間作業、外部副作用、検証、回復の観点で比較する。"
difficulty: intermediate
plainSummary: "AI Coding CLI の選択では、モデルの賢さだけでなく、コンテキスト、計画、ファイル変更、承認、検証、外部副作用、長時間作業の回復を比較する必要がある。"
tags:
  - "AI Engineering"
  - "Agent"
lang: ja
coverImage: "/images/engineering/practice/agent-cli-workflow-comparison-cover.png"
draft: false
---

# Codex、Claude Code、Gemini CLI：賢さではなくワークフローで比べる

> 時点メモ：この記事は 2026-05-11 に確認しました。各 CLI のモデル、権限、MCP、価格、制限は変わりやすいため、この記事は固定ランキングではなく比較フレームとして読んでください。

AI Coding Agent の話は、すぐ「どれが一番賢いか」になりがちです。しかし実務では、Agent は答えるだけではありません。リポジトリを読み、ファイルを変更し、コマンドを実行し、Git を扱い、外部サービスに触れることもあります。

そのため重要なのは、単純な賢さではなくワークフローです。

![Agent CLI ワークフローマトリクス](/images/engineering/practice/agent-cli-workflow-matrix.svg)

## 四種類の作業を分ける

一つ目はコードを読む作業です。構造、依存、リスクを理解することが目的で、むやみにファイルを変更しない方がよい場面です。

二つ目はコードを変更する作業です。patch 範囲、テスト、diff、ユーザーの未コミット変更を尊重する必要があります。

三つ目は長時間作業です。大量移行、コンテンツ生成、素材作成、横断リファクタなどでは、計画、状態管理、分割検証、中断後の再開が重要です。

四つ目は外部副作用です。push、メール送信、カレンダー変更、有料 API、削除、本番デプロイなどは、承認と監査を前提にします。

## Codex の見方

Codex は、ファイル、shell、patch、ブラウザ、Git、画像生成、MCP、Skills、Automations を一つの作業台として扱いやすい点が強みです。読んで、作って、検証して、資産を生成して、最終報告まで行う作業に向いています。

一方で、能力が広いほど境界が重要になります。AGENTS.md、sandbox、承認、許可コマンド、検証手順が品質を大きく左右します。

## Claude Code の見方

Claude Code は、複雑なコード理解、設計相談、重めのリファクタ検討に向きやすい道具です。直接実行だけでなく、先に読み解いてリスクと方針を出す役割として使う価値があります。

評価するときは、プロジェクト指示、権限、コマンド実行、MCP、slash commands、計画、review の扱いを確認します。

## Gemini CLI の見方

Gemini CLI は、Google エコシステム、Gemini モデル、ADK、Google Cloud、Workspace との接続を考えると重要です。Google 関連の Agent 実験やクラウド作業では、比較対象に入れる価値があります。

ここでも、見るべきは回答の印象だけではありません。権限、ツール設定、MCP、ログ、検証の流れを確認します。

## 比較表

| 観点 | 問うべきこと |
| --- | --- |
| コンテキスト | どうリポジトリを読み、無関係な情報を避けるか |
| 計画 | 分割実行や停止判断ができるか |
| 変更 | diff をどう示し、ユーザー変更を避けるか |
| ツール | shell、ブラウザ、MCP、Skills をどう扱うか |
| 承認 | 削除、push、有料 API に確認があるか |
| 検証 | テストと build の結果を読んでいるか |
| 回復 | 長時間作業を再開できるか |
| 運用 | ルールや Skill に沈殿できるか |

## 公式資料の読み方

Codex、Claude Code、Gemini CLI を比べる時は、製品ページや SNS の demo だけで判断しない方が安全です。見るべき公式情報は四種類あります。

一つ目は設定と権限の文書です。ファイル、command、network、MCP、plugin、hooks、project-level config、user-level config をどう制限できるかを見ます。Codex なら `config.toml`、sandbox、approval policy、MCP server、skills、agents、web search などの設定面があります。Claude Code も settings、permissions、sandboxing、hooks、plugin まわりを確認します。Gemini CLI は GitHub docs から command、拡張、Google ecosystem との接続を追います。

二つ目は tool calling の文書です。shell、ブラウザ、MCP、ファイル、検索、IDE、GitHub、cloud service にどう触れるか。そして、それらに確認、ログ、無効化の仕組みがあるかを確認します。

三つ目は自動化と長時間作業の文書です。非対話実行、timeout、再開、skill、slash command、hook、automation にできるかを見ます。一回の会話でよい結果が出ることと、一晩安全に走ることは別です。

四つ目は価格、rate limit、account policy です。モデル、quota、plan、地域、組織方針は変わりやすいので、記事では固定結論にせず、「この日付時点で観測できる設定面」と「確認方法」を書きます。

## レイヤーで比較する

AI Coding CLI は四層で見ると分かりやすくなります。

モデル層は理解と生成の力を決めます。コード推論、長文理解、言語品質、複雑な分解に効きます。ただし、実務ではモデルだけで納品品質は決まりません。

Harness 層は tool の使い方を決めます。file edit は patch 化されているか、shell は sandbox されるか、危険 command は承認されるか、ブラウザ screenshot は取れるか、MCP allowlist はあるか、長時間作業の状態は残るか。同じモデルでも Harness が違えば結果は変わります。

Project rule 層は、Agent がローカル制約を理解するかを決めます。`AGENTS.md`、test command、branch rule、publish rule、tag rule、content style、secret boundary がここに入ります。

Team process 層は、結果がどう production に入るかを決めます。PR review、push 承認、CI、失敗から guardrail を作る仕組み、繰り返し作業の Skill 化がここです。

この四層のどこが弱いかを見れば、道具選びを誤りにくくなります。弱いのが project rule なら、モデルを変えても解決しません。弱いのが検証なら、CLI を変えても同じ失敗をします。

## 実践パス：一つのタスクから選ぶ

たとえば「工程実践シリーズ 18 本を中日で拡張し、公式資料、画像、build、目視 QA まで行う」というタスクを考えます。これは content production、fact check、file edit、image asset、build、browser QA を含みます。

まずローカル repository を安全に読んで書ける必要があります。次に OpenAI、Anthropic、Google、MCP、Playwright の公式情報を確認できる必要があります。さらに画像生成と SVG 編集が必要です。最後に `npm run check`、base path 付き build、必要なら screenshot QA を行います。

この構造では Codex が主実行に向きます。Claude Code は深い code review や設計相談に向きます。Gemini CLI は Google ecosystem や ADK / Gemini 関連の確認に向きます。これは永続ランキングではなく、タスク構造からの判断です。

## 反例：一回の demo で決める

小さな repository で bug をすぐ直せた demo は参考になりますが、dirty worktree、長時間作業、多言語 content、publish rule、失敗復旧を代表しません。

「説明が上手い」ことと「安全に変更できる」ことも別です。変更には diff、test、format、未提交変更、CI が関わります。

外部副作用も見落としやすい点です。メール送信、push、deploy、削除、有料 API が自動化できることは強みですが、承認とログがなければ production には入れにくくなります。

最後に、速度、費用、context、model quality、tool ability、permission、auditability は互いに trade-off です。学習では速度を重視してよく、チーム運用では制御と回放を優先します。

## チーム導入：比較をルールに変える

比較結果は、好みで終わらせず、三種類の材料に落とします。

一つ目は project instructions です。publish rule、test command、branch policy、secret boundary、content style を `AGENTS.md` などに書きます。

二つ目は task Skill です。content expansion、pre-publish check、image asset generation、PR review、CI fix のような繰り返し作業を Skill にします。

三つ目は verification gate です。`npm run check`、build、screenshot、link check、source inventory、diff scope を gate にします。tool は変わっても gate は安定させます。

チームに必要なのは、永遠に最強の CLI ではなく、tool の変化を吸収できる workflow です。

## 現在観測できる状態と確認方法

2026-05-11 時点で観測できる大きな流れは、AI Coding CLI が「対話型コード補助」から「tool、permission、project rule、自動化を持つ Agent Harness」へ移っていることです。ただし、model、price、rate limit、plugin、MCP support、permission default は変わりやすいため、固定結論にしません。

確認する時は、各 tool の公式 settings / permissions 文書を読み、MCP、hooks、plugins、skills、slash commands、extensions の現在範囲を見ます。その後、実 repository で同じタスクを行い、未提交変更を尊重するか、承認が出るか、diff を説明できるか、中断後に復旧できるかを記録します。

この確認は一度で終わりません。CLI の更新、model の変更、plugin の追加、組織ポリシーの変更があるたびに、同じ小さなタスクで再確認します。比較表を保守するよりも、比較に使うタスクと観察項目を保守する方が長持ちします。

また、比較結果はチームの言葉に翻訳する必要があります。「この CLI は賢い」では運用ルールになりません。「この CLI は長時間の patch 作業に向くが、公開操作は明示承認に置く」「この CLI は調査が速いので、最初の repository reading に使う」のように、仕事の入口、権限、検証方法へ落とすと使いやすくなります。

## 選び方

個人学習では、主ツール一つと review 用ツール一つで十分です。チームでは、プロジェクトルールを安定して守れることを優先します。自動化では、ログ、失敗通知、再実行性が重要です。コンテンツ作業では、画像、音声、ブラウザ、出典確認も評価軸になります。

結論は、特定ツールへの信仰ではありません。ワークフローを明確にすれば道具は替えられます。ワークフローが曖昧なら、道具を替えても失敗の形が変わるだけです。

## チェックリスト

- 読む、変更する、長時間作業、外部副作用を分けているか。
- 各作業にデフォルト権限があるか。
- 変更前に範囲を確認するか。
- 実際のテストを走らせるか。
- 長時間作業の状態を残すか。
- 経験を Skill や AGENTS.md に残すか。
- 一回の demo で固定ランキングを作っていないか。

## 関連記事

- [AIエンジニアリング実践マップ](./ai-engineering-practice-map/)
- [Skills はプロンプトではなく、再利用できるワークフロー資産](./skills-as-workflow-assets/)
- [Agent とは](../../../start/ai-basics-for-everyone/what-is-agent/)
