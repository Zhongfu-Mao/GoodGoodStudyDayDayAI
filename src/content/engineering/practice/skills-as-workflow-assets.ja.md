---
title: "Skills はプロンプトではなく、再利用できるワークフロー資産"
date: 2026-05-11
category: engineering
description: "Skill を長い prompt ではなく、トリガー、手順、境界、資料、スクリプト、検証の組み合わせとして扱う。"
difficulty: intermediate
plainSummary: "良い Skill は、繰り返し作業を一回限りの会話から切り出し、必要なときだけ手順、参考資料、検証スクリプトを Agent に渡すための仕組みである。"
tags:
  - "AI Engineering"
  - "Agent"
lang: ja
coverImage: "/images/engineering/practice/skills-workflow-assets-cover.png"
draft: false
---

# Skills はプロンプトではなく、再利用できるワークフロー資産

> 時点メモ：この記事は 2026-05-11 に確認しました。Codex Skills、Claude Skills、Gemini CLI の具体機能は変化するため、ここでは移植しやすい設計原則を中心にします。

Skills を初めて見ると、「長い prompt」と思いがちです。しかし実務上の価値はそこではありません。Prompt は一回の会話の指示です。Skill は、繰り返し使う作業をトリガー、手順、境界、資料、スクリプト、検証として残すワークフロー資産です。

![Skill ワークフローのライフサイクル](/images/engineering/practice/skills-workflow-lifecycle.svg)

## Skill は繰り返しを扱う

一度だけの作業なら普通の指示で足ります。何度も起き、毎回同じような抜け漏れが出るなら Skill 化する価値があります。

例としては、公開前チェック、コンテンツ移行、AI レーダー生成、メール整理、画像生成ワークフローなどがあります。共通点は、モデルができないのではなく、人間が毎回境界を説明したくない作業であることです。

## Skill の六つの部品

一つ目はトリガーです。説明文が曖昧だと Agent は選べません。どんな場面で使うかを具体的に書きます。

二つ目は手順です。哲学ではなく、実行順序を書きます。先に何を確認し、何を作り、何で検証するか。

三つ目は境界です。触ってはいけないファイル、承認が必要な操作、停止すべき失敗条件を書きます。

四つ目は参考資料です。長い資料は本体に入れず、必要になったら読む `references/` に置きます。

五つ目はスクリプトです。機械的に確認できることはモデルの記憶ではなくスクリプトに任せます。

六つ目は検収です。どうなれば終わりかを明示します。

## Progressive Disclosure が効く

Codex Skills の考え方では、まず metadata だけを見せ、必要なときに `SKILL.md` を読み、さらに必要なら references や scripts を使います。これにより、複雑な作業を常にコンテキストに入れずに済みます。

そのため、Skill 本体は短く安定させ、長い説明や例は references に逃がします。スクリプトは具体的で構いません。

## 失敗から Skill を作る

最も良い Skill は失敗から生まれます。GitHub Pages の base path を忘れて UI テストが落ちたなら、それを一回の修正で終わらせず、今後の検証ルールにします。公開 Markdown に Gmail の内部 URL が混ざったなら、それを公開前チェックに入れます。

失敗を次回の守りに変えることが Skill の実務価値です。

## Skill、AGENTS.md、MCP の分担

AGENTS.md はプロジェクトの長期ルールに向きます。未確認 push 禁止、タグ方針、公開手順などです。Skill は特定の作業フローに向きます。MCP は外部システムやデータソースをつなぐ層です。

成熟したワークフローでは、三つを同時に使います。AGENTS.md が赤線を決め、Skill が手順を決め、MCP が能力を提供します。

## レイヤーで見る Skill の成熟度

Skill は最初から複雑である必要はありません。成熟度で四つに分けられます。

一つ目は instruction-only Skill です。`SKILL.md` だけを持ち、安定した手順と境界を書きます。まだ script 化するほど固まっていないが、毎回同じ注意点を説明したくない作業に向きます。

二つ目は reference-backed Skill です。`references/` に例、用語集、文体ルール、frontmatter 例、翻訳方針を置きます。本文に全部入れず、必要時だけ読ませることができます。

三つ目は script-backed Skill です。`scripts/` で決定的な検査を自動化します。Markdown の長さ、frontmatter、禁止語、画像サイズ、リンクなどは、モデルの記憶ではなく script の方が安定します。

四つ目は integration-backed Skill です。MCP、plugin、外部 API を使います。GitHub、Gmail、設計ツール、NotebookLM などに触れる場合です。この段階では、権限、承認、失敗復旧を必ず設計します。

この四つは優劣ではありません。簡単な instruction で十分なら、それが最もよい設計です。Skill の目的は複雑さではなく、繰り返しの失敗を減らすことです。

## 実践パス：失敗を Skill に変える

失敗を Skill に変えるには、まず事実を記録します。どのタスク、どのファイル、どの command、どのページ、どこで失敗し、どう見つかったのか。

次に失敗の種類を分けます。タスクが曖昧だったのか、source が古かったのか、tool の権限が広すぎたのか、test がなかったのか、approval が抜けたのか。

その後、失敗を実行可能な手順に変えます。「base path に注意」では弱いです。「UI、link、image、audio を変更した時は `GITHUB_REPOSITORY=... npm run build` で GitHub Pages base path を検証する」と書きます。

機械的に検証できるものは script にします。記事に確認日があるか、チェックリストがあるか、中文長さが基準を満たすか、日本語版が存在するかは script にできます。

最後に停止条件を書きます。公式情報が確認できない、無関係な dirty file がある、build 失敗の原因が分からない、push に許可がない。このような場合は止めて報告します。

## 現在観測できる状態と確認方法

2026-05-11 時点の Codex Agent Skills 公式文書では、Skill は reusable workflow の authoring format と説明されています。plugin は配布単位です。Skill には `SKILL.md`、任意の `scripts/`、`references/`、`assets/` を置けます。Codex は progressive disclosure を使い、最初は name、description、path を見せ、選ばれた時に full instructions を読みます。description は implicit invocation に効きます。

確認する時は、Codex Agent Skills 文書で directory structure、trigger、progressive disclosure を確認します。次に実際の task で description が正しく発火するかを試します。さらに、発火してほしくない task で誤発火しないかも見ます。script がある場合は、成功例だけでなく失敗例も実行します。

## 反例：Skill が負債になる時

万能 Skill は負債になりやすいです。すべての content、code、release、research、image task を扱おうとすると、trigger は広く、制約は弱くなります。

description が抽象的すぎるのも問題です。`Make content better` より、対象 task、成果物、使わない場面を書いた方が安定します。

script の早すぎる導入も危険です。workflow が固まる前に script 化すると、間違った流れを固定してしまいます。まず instruction で数回走らせ、繰り返しが見えてから script にします。

references を資料置き場にするのも避けます。どの資料をいつ読むかを `SKILL.md` で案内しないと、Agent は迷います。

最後に、Skill 自体の寿命を忘れないことです。製品、command、directory、price が変われば、Skill も更新が必要です。

## 例：工程実践シリーズを Skill 化する

今回の工程実践シリーズの品質補強を Skill にするなら、trigger は「記事を書く」ではありません。「既存の bilingual engineering article を quality standard まで引き上げ、公式情報、画像、build、QA まで確認する」作業です。

手順は、対象 directory を読み、中文と日本語の長さを測り、基準未満を列挙するところから始めます。各記事に problem background、layered model、practice path、anti-pattern、checklist、related reading があるかを確認します。製品能力や価格に触れる部分は公式情報を再確認します。その後、中文母稿を拡張し、日本語版を現地化して同期します。最後に check、build、必要な screenshot QA を行います。

references には品質基準、frontmatter 例、日文術語、よくある反例を置けます。scripts には文字数、章の存在、画像参照の確認を入れられます。assets には cover prompt や SVG template を置けます。

停止条件も必要です。公式情報が取れない、長さと情報密度が衝突する、日本語同期ができない、build 失敗の原因が分からない、無関係な dirty file が巻き込まれそう。このような時は止まります。

## 保守戦略：いつ Skill を更新するか

Skill は書いたら終わりではありません。同じ作業で新しい失敗が出た時、公式文書が command や parameter を変えた時、project directory が変わった時、新しい script で人工確認を置き換えられる時、ユーザーが品質基準を変えた時、誤発火や漏れが起きた時に更新します。

更新時には、その変更が作業を安定させるのか、一回の好みを永久ルール化しているだけなのかを確認します。前者は Skill に入れる価値があります。後者は Skill を重くします。

## Automation との関係

Skill は「どうやるか」を書き、automation は「いつ自動でやるか」を決めます。日報生成には Skill も cron automation もありえます。Skill は手順と境界、automation は実行タイミングと環境を担当します。

Skill がない automation は、曖昧な prompt を定期実行するだけになりがちです。automation がなくても Skill は手動で使えます。両方を組み合わせる時は、失敗報告と停止条件が特に重要です。

言い換えると、Skill は workflow 資産であり、automation は scheduling 資産です。二つを分けておくと、実行頻度を変えずに手順を改善できますし、手順を変えずに実行タイミングだけを調整できます。チーム運用ではこの分離が大切です。失敗した時に、prompt が悪いのか、手順が悪いのか、時刻や環境が悪いのかを切り分けられるからです。

Skill は小さく始める方が長続きします。最初から全作業を覆うより、毎回抜ける一手だけを確実に守る Skill の方が効果があります。たとえば「記事を深くする」ではなく、「公開前に長さ、出典、日文同期、画像参照、build を確認する」と書くと、使う場面も失敗時の修正も明確になります。

小さな Skill はレビューもしやすくなります。不要になったら削除でき、範囲が広がったら references や scripts を後から追加できます。

## チェックリスト

- その作業は繰り返し発生するか。
- 毎回同じ抜け漏れがあるか。
- トリガー条件は明確か。
- 停止すべき失敗状態を書いているか。
- 機械的確認をスクリプトにできるか。
- 長い資料を本体から分離しているか。
- プロジェクトの赤線を AGENTS.md に残しているか。

## 関連記事

- [AIエンジニアリング実践マップ](./ai-engineering-practice-map/)
- [AI Developer Core：Agent Harness のログ、承認、回放](../ai-developer-core/agent-harness-logging-approval-replay/)
- [Codex for Work：Automations、Plugins、Settings](../../academy/openai-academy/06-codex-for-work/automations-plugins-settings/)
