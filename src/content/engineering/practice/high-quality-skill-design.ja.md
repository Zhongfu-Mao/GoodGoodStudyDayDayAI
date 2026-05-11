---
title: "高品質な Skill の作り方：トリガー、手順、境界、検証"
date: 2026-05-11
category: engineering
description: "Skill を保守できるワークフロー資産として設計する。description はトリガー、手順は実行、script は決定性、reference は深さ、検証は完了判定を担う。"
difficulty: intermediate
plainSummary: "Skill の品質は prompt の長さでは決まらない。正しく発火し、境界を制限し、機械的処理を script に任せ、資料を必要時に読み、最後に検証できることが重要。"
tags:
  - "AI Engineering"
  - "AI Developer Core"
lang: ja
coverImage: "/images/engineering/practice/high-quality-skill-design-cover.png"
draft: false
---

# 高品質な Skill の作り方：トリガー、手順、境界、検証

> 時点メモ：この記事は 2026-05-11 に確認した情報を前提にしています。OpenAI Codex Agent Skills の公式文書では、Skill は通常 `SKILL.md` と任意の `scripts/`、`references/`、`assets/` から構成され、progressive disclosure によって必要な時だけ詳細を読み込むと説明されています。実装の細部はクライアントごとに変わる可能性があります。

初めて Skill を書くと、長い prompt にしてしまいがちです。短期的には効きますが、長期的にはトリガーが曖昧になり、手順と例外が混ざり、検証が抜けた技術的負債になります。

高品質な Skill は、長文 prompt ではなく実行可能な手順書です。モデルの判断を置き換えるのではなく、繰り返し発生する作業、境界、参考資料、完了条件を固定し、モデルが現在の判断に集中できるようにします。

![高品質な Skill の五つのチェックポイント](/images/engineering/practice/skill-quality-checklist.svg)

## description は短く正確に

Skill の `description` は宣伝文ではなくルーティング規則です。Codex の文書では、Skill は明示的に呼び出すことも、description に基づいて暗黙的に選ばれることもあると説明されています。

悪い例は「コンテンツ作業を助ける」です。広すぎます。良い例は「公式文書を確認しながら、中日対応の長文記事、出典リスト、画像資産、ビルド検証まで作る時に使う」です。

良い description には、適用する仕事、適用しない境界、主な成果物が入っています。

## 手順は理念ではなく動作にする

「正確性を保つ」「ユーザー体験に注意する」「高品質にする」は大切ですが、そのままでは実行できません。

実行可能な手順は、例えばこうなります。

1. repo-local instructions を読む。
2. `rg --files` で近い内容と既存パターンを確認する。
3. 時間に敏感な事実は公式情報で確認する。
4. 中日ファイルの frontmatter を揃える。
5. 記事ごとに生成カバーと読みやすい図を用意する。
6. `npm run check` と GitHub Pages base path 付き build を走らせる。

手順が具体的なほど、Agent は余計な推測をしなくなります。

## 機械的な処理は scripts に逃がす

Skill はすべてを自然言語で説明する場所ではありません。frontmatter の検査、目次生成、画像圧縮、リンク検査、文字数集計、中日タイトル比較のような決定的処理は、`scripts/` に置いた方が安定します。

progressive disclosure はこの設計と相性がよいです。最初は Skill の名前と説明だけが見え、選ばれた時に `SKILL.md` を読み、必要な時だけ script や reference を使います。複雑な能力を、最初から文脈に詰め込まずに済みます。

## references は倉庫ではなく補助資料

`references/` には、安定していて実行に役立つ資料を置きます。用語集、形式例、よくある失敗、ローカルな文体規則などです。価格、API パラメータ、モデル一覧のような変化が速い情報は、Skill に固定せず、その場で公式情報を確認させる方が安全です。

| 種類 | 置き場所 | 理由 |
| --- | --- | --- |
| 安定した手順 | `SKILL.md` | 毎回守るため |
| 大きい例 | `references/` | 必要時だけ読むため |
| 変化する事実 | 公式文書や source inventory | 当日に再確認するため |

この分離をしないと、Skill は分厚くなり、古い情報を抱えたままになります。

## 検証と停止条件を書く

Skill の最後には、どうなれば完了か、いつ止まるべきかを書きます。

完了証拠は、テスト、ビルド、スクリーンショット、diff 範囲、公開前 QA です。停止条件は、権限不足、情報未確認、破壊的操作、無関係な dirty file、ユーザー指示の衝突、原因不明のビルド失敗です。

停止条件がない Skill は、Agent に無限の試行を促します。完了証拠がない Skill は、「よさそう」を納品基準にしてしまいます。

## 簡易テンプレート

```md
---
name: publishable-engineering-article
description: Use when creating or updating long-form engineering articles with source verification, bilingual parity, visual assets, and build checks. Do not use for one-line copy edits.
---

1. Read repo instructions and nearby content.
2. Identify freshness requirements.
3. Draft Chinese content, then Japanese parity.
4. Generate or update visual assets.
5. Run validation and build checks.
6. Report changed files, verification, and risks.
```

本物の Skill はもっと具体的になりますが、骨格はこれで十分です。

## よくある反パターン

万能 Skill は避けるべきです。すべてを扱おうとすると、どれも安定しません。大量の資料を詰め込むのも危険です。大きな資料は references に、重要な手順は本文に分けます。理念だけで動作がない Skill、検証がない Skill も、長期運用では失敗しやすくなります。

## レイヤーで見る：トリガー、実行、証拠、保守

高品質な Skill は四つの層に分けられます。

トリガー層は「いつ使うか」を決めます。`name` と `description` が中心です。description は短く、かつ具体的である必要があります。Codex の文書では、初期 skill list には context budget があり、description が短縮される場合もあります。重要なキーワードは前に置きます。

実行層は「どう進めるか」を決めます。手順、順序、入力、出力、禁止範囲、分岐を書きます。「品質を上げる」は動作ではありません。「`npm run check` を実行し、結果を読む」は動作です。

証拠層は「完了をどう証明するか」を決めます。command output、screenshot、diff、source inventory、生成 asset、review conclusion がここに入ります。Agent の最終報告は、意図ではなく証拠に基づくべきです。

保守層は「どう古くならないようにするか」を決めます。製品仕様、command、path、tool name は変わります。いつ公式文書を見直すか、いつ script を更新するか、いつ Skill を廃止するかを書いておきます。

この四層があると、Skill は一回限りの prompt ではなく、保守できる資産になります。

## 実践パス：記事品質補強 Skill を設計する

たとえば、この工程実践シリーズを Quality Standard へ引き上げる Skill は、次のような description になります。

```md
Use when upgrading existing bilingual engineering articles to a publishable quality standard with official source verification, target length, visual assets, Japanese localization, and Astro build checks. Do not use for short copy edits or unrelated blog drafts.
```

手順は、まず repo instructions と対象記事を読みます。次に中日ファイルの長さを測り、基準未満を列挙します。製品能力、価格、制限、API、CLI 行動に関わる箇所は公式情報を再確認します。中文母稿では、問題背景、分层模型、実践路径、反例、checklist、related reading を補います。日本語版は拡張後の内容を現地化して書き直します。最後に画像、図、`npm run check`、build、必要な screenshot QA を確認します。

停止条件も必要です。公式情報が確認できない、価格ページにアクセスできない、無関係な dirty file が巻き込まれそう、build 失敗の原因が不明、ユーザーが範囲を変えた。このような時は進めずに報告します。

この Skill の価値は、「文章をうまく書く」ことではありません。品質基準を Agent が実行できる手順に変えることです。

## 現在観測できる状態と確認方法

2026-05-11 時点の Codex Agent Skills 文書では、Skill は directory で、`SKILL.md` には name と description が必要です。任意で `scripts/`、`references/`、`assets/`、`agents/openai.yaml` を置けます。Skill は明示的にも暗黙的にも呼び出され、description が暗黙的選択に効きます。Codex は progressive disclosure によって、選ばれた時だけ full instructions を読みます。

確認する時は、まず公式文書で directory structure と field を確認します。次に Codex CLI、IDE、app で Skill が見えるかを確認します。三つの prompt を使います。一つは必ず発火すべきもの、一つは発火すべきでないもの、一つは境界が曖昧なものです。script がある場合は、成功例だけでなく失敗例も試します。

## 反例：長いほど信頼できるわけではない

すべての細部を `SKILL.md` に入れると、読みにくく、更新しにくくなります。安定した手順は本文、大きい例は references、機械的検査は scripts に分けます。

description が広すぎると誤発火します。狭すぎると必要な時に選ばれません。対象 task、成果物、不適用場面を書きます。

入力と出力がない Skill も不安定です。何を読み、何を作り、最後に何を報告するかが必要です。

高リスク操作を普通の手順に混ぜるのも危険です。削除、送信、push、有料 API、本番データ変更は承認点として書きます。

最後に、trigger test をしない Skill は実務で信頼できません。書いたら必ず使ってみます。

## 品質レビュー：Skill を公開する前に見ること

Skill を使い始める前に、少なくとも三種類のレビューを行います。

一つ目は trigger review です。必ず発火すべき prompt、発火すべきでない prompt、境界が曖昧な prompt を用意します。Agent が選び間違えるなら、description を調整します。

二つ目は execution review です。小さな実タスクで Skill を使い、Agent が手順を守るか、検証を飛ばさないか、禁止範囲に触れないか、失敗時に止まるかを見ます。文書が美しいことより、実際の行動が重要です。

三つ目は maintenance review です。model price、API parameter、directory、外部 service limit のような変化しやすい情報を Skill に固定していないかを確認します。固定している場合は、「実行時に公式文書を見る」または reference に分離します。

この三つを通して初めて、Skill は team や project で使う価値を持ちます。

## チェックリスト

- `description` はいつ使うかを正しく示しているか。
- 使わない場面が明確か。
- 手順は動作として書かれているか。
- 決定的な検査は script にできるか。
- reference は必要時だけ読む設計か。
- 時間に敏感な事実は再確認する設計か。
- 完了証拠と停止条件があるか。

## 関連記事

- [Skills はプロンプトではなく、再利用できるワークフロー資産](./skills-as-workflow-assets/)
- [MCP が必要な時、スクリプトで十分な時](./when-to-use-mcp-vs-scripts/)
- [Codex、Claude Code、Gemini CLI：賢さではなくワークフローで比べる](./agent-cli-workflow-comparison/)
