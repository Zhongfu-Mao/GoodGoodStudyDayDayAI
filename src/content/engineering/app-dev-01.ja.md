---
title: "App Dev：Astro Content Collections でコンテンツ基盤を作る"
date: 2026-04-03
category: engineering
description: "コンテンツ集合、Schema、動的ルーティング、多言語ファイル、画像パス、ビルド検証から、長く保守できる技術コンテンツサイトを設計する。"
difficulty: intermediate
plainSummary: "Astro Content Collections は Markdown ディレクトリ管理ではなく、コンテンツサイトの型システムである。frontmatter、ルート、画像、多言語公開を検証可能なプロセスにする。"
coverImage: "/images/engineering/app-dev-01/astro-content-pipeline-cover.png"
tags:
  - "Astro"
  - "Web Dev"
lang: ja
draft: false
---

# App Dev：コンテンツサイトにもエンジニアリング基盤が必要

![Astro コンテンツパイプラインの概念図](/images/engineering/app-dev-01/astro-content-pipeline-cover.png)

コンテンツサイトは最初、とても軽く始められます。いくつかの Markdown ファイル、静的サイトジェネレーター、書いたら公開。それだけで十分に見えます。問題は、30 本目、100 本目、最初の多言語対応、大きな改修のタイミングで現れます。

次のような問題が出始めます。

- ある記事に `description` がなく、一覧ページが崩れる。
- カバー画像のパスが間違っていて、ページに空の画像が出る。
- 中国語版は更新したが、日本語版を忘れる。
- ファイル名、slug、URL 規則が揃わなくなる。
- GitHub Pages のサブパスにデプロイすると、ローカルでは見えた画像が 404 になる。
- カテゴリとタグを手作業で保守し、変更が怖くなる。

Astro Content Collections の価値は「Markdown を読める」ことだけではありません。コンテンツサイトの型システムとして、記事が満たすべき構造、フィールド、言語、公開状態、アセット参照をビルド時に確認できます。

この文章では、Astro のコンテンツサイトをエンジニアリングパイプラインとして分解します。コンテンツファイル、Schema、ルーティング、多言語、アセット、検証、デプロイです。API の紹介ではなく、長く保守するための設計モデルを作ることが目的です。

## Content Collections はディレクトリではなく契約を扱う

小さなサイトは約束事だけで保守できます。長く更新するサイトには契約が必要です。

Content Collections の契約には、次のようなものがあります。

- 必須フィールドは何か。
- 各フィールドの型は何か。
- 許可されるカテゴリと言語は何か。
- 下書きが公開ページに出るべきか。
- カバー画像、音声、スライドなどのアセットが存在するか。
- 複数言語版がペアになっているか。

契約がないと、エラーはブラウザ上で見つかります。ユーザーが空のタイトル、壊れた画像、リンク切れを見てから、Markdown の間違いに気づきます。

契約があると、エラーはビルド時に見つかります。`astro check` や CI の段階で止められます。

## 保守しやすいコンテンツ構成

典型的な構成は次の通りです。

```txt
src/content/
  config.ts
  academy/
    llm-apps-notes-01.md
    llm-apps-notes-01.ja.md
  engineering/
    app-dev-01.md
    app-dev-01.ja.md
  foundations/
    math-for-ai-01.md
    math-for-ai-01.ja.md

public/images/
  academy/
    llm-apps-notes-01/
      cover.png
      tool-calling-loop.png
```

この構成にはいくつかの判断があります。

第一に、collection はコンテンツ領域を表します。`academy`、`engineering`、`foundations` は URL プレフィックスであり、読者の期待でもあります。

第二に、多言語はファイル名の suffix で表します。`article.md` が中国語、`article.ja.md` が日本語です。同じ記事の sibling を機械的に探しやすくなります。

第三に、画像は記事 slug ごとにディレクトリを分けます。大量の `cover.png` が一つの場所に集まることを避け、古い記事を消すときもアセットを整理しやすくなります。

第四に、公開アセットは `/images/...` で始まる絶対パスを使います。Markdown、コンポーネント、ビルド成果物で一貫して検査しやすくなります。

## Schema はコンテンツの型システム

![コンテンツ Schema 検証ゲート](/images/engineering/app-dev-01/content-schema-validation-gate.png)

Astro の Content Collections では、`zod` で frontmatter schema を定義できます。

```ts
import { defineCollection, z } from 'astro:content';

const article = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(['academy', 'engineering', 'foundations', 'radar']),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    plainSummary: z.string().optional(),
    coverImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'ja']),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  academy: article,
  engineering: article,
  foundations: article,
};
```

このコードの価値は、型がきれいに見えることではありません。コンテンツエラーを早く失敗させることです。

よく防げる問題です。

- `date` が日付として読めない。
- `difficulty` が未定義の値になっている。
- `tags` が配列ではない。
- `lang` が間違っていて言語ルートが認識できない。
- 必須の `description` がない。

コンテンツサイトにとって、これは最初の単体テストです。

## 動的ルーティング：ファイルシステムを URL 生成器にする

Astro の動的ルーティングでは、`getStaticPaths()` でコンテンツをページへ写像します。

```ts
export async function getStaticPaths() {
  const entries = await getCollection('engineering', ({ data }) => !data.draft);

  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}
```

記事のパスを手作業でルート表へコピーすべきではありません。正しい collection にファイルが入れば、ビルドシステムが生成すべきページを知っている状態が理想です。

これにより、三つのエラーを減らせます。

- 新しい記事のルート登録忘れ。
- 削除した記事のルート残り。
- slug 変更後に旧パスと新パスが混在する。

多言語パスがある場合は、言語ルールもルート生成に入れるべきです。コンポーネントの中に散らすと保守が難しくなります。

## 多言語同期：記憶に頼らない

![中日ルーティングと base path のアセット解決](/images/engineering/app-dev-01/bilingual-routing-basepath.png)

多言語サイトで壊れやすいのは翻訳品質だけではありません。同期状態です。

よくあるリスクです。

- 中国語記事はあるが、日本語 sibling がない。
- 中国語本文の構造が変わったが、日本語は古いまま。
- 中国語のカバー画像は PNG になったが、日本語は旧 SVG を参照している。
- 日本語ページが中国語入り画像を使っている。
- 中国語の内部リンクは正しいが、日本語リンクが別言語へ飛ぶ。

これらは人間の review だけに頼るべきではありません。最低限の自動チェックが必要です。

- 公開記事には `zh` と `ja` の sibling がある。
- 同じ記事の `category`、`date`、`draft` が一致する。
- 日本語記事は中国語文字入り画像を使わない。
- body image は存在し、できるだけ文字なし画像にする。
- 内部リンクはビルド後 HTML で解決できる。

コンテンツが増えるほど、多言語にはエンジニアリング上の制約が必要になります。

## 画像パス：ローカル成功は本番成功ではない

静的サイトの画像問題は、パス戦略の不一致から起きることが多いです。

よくある書き方は三つあります。

```md
![相対パス](./cover.png)
![public ルートから](/images/engineering/app-dev-01/cover.png)
![リモート画像](https://example.com/cover.png)
```

長く保守するコンテンツサイトでは、サイト内の public アセットを優先し、固定ルールを作るのが安全です。

- 本文画像は `public/images/<collection>/<slug>/` に置く。
- Markdown では `/images/...` パスを使う。
- ビルド後にすべてのローカル画像参照を検査する。
- 一時生成画像、旧 SVG、設計途中の素材を本文に混ぜない。

GitHub Pages のサブパスへデプロイする場合は、フレームワークの `base` 処理も確認します。ローカルのルートパスで表示できることは、本番パスで正しいことを意味しません。

## コンテンツ QA をテストに入れる

コンテンツサイトのテストは、コンポーネント操作だけでは足りません。少なくともアセット QA が必要です。

確認できる項目です。

- 公開 Markdown に sibling があるか。
- frontmatter のローカルアセットが存在するか。
- 本文中のローカル画像が存在するか。
- 重点記事が body image として SVG を参照していないか。
- 本文に内部メモ、草稿痕跡、ローカル向け説明が残っていないか。
- ビルド後 HTML が存在しないローカルアセットを参照していないか。

この種のテストは複雑ではありませんが、効果は大きいです。コンテンツ品質問題を、繰り返し実行できる検証プロセスに変えられます。

## ケース：カバー画像の移行

初期の記事が多くの SVG カバーを使っていて、後から高品質な PNG カバーと本文画像へ移行するとします。

エンジニアリング基盤がない場合、移行は手作業のリストになります。

1. SVG を使う記事を探す。
2. 新しい画像を生成する。
3. frontmatter を手で差し替える。
4. 中国語と日本語の一致を手で確認する。
5. ページを開いて画像表示を確認する。

これは漏れやすいです。

より良い流れです。

1. スクリプトまたはテストで旧ベクター画像参照を見つける。
2. 各記事に固定画像ディレクトリを作る。
3. `coverImage` と本文画像を置き換える。
4. guardrail を追加し、重点記事の body image では SVG を禁止する。
5. `astro check`、build、コンテンツアセットテストを走らせる。

こうすれば、移行は記憶に頼る編集ではなく、検証可能な変更になります。

## よくあるアンチパターン

**アンチパターン 1：frontmatter フィールドを思いつきで増やす。**

フィールドは一覧、検索、RSS、OG 画像、推薦コンポーネントに使われます。思いつきの追加は後の保守を重くします。

**アンチパターン 2：下書きを本文で隠す。**

下書きは `draft: true` で制御すべきです。公開状態は機械が読める必要があります。

**アンチパターン 3：画像が複数の場所に散らばる。**

画像パスが自由すぎると、移行、圧縮、置換、削除がつらくなります。collection と slug でまとめるほうが安定します。

**アンチパターン 4：中国語ページが通ったら日本語も大丈夫と思う。**

日本語は長さ、改行、リンク接頭辞、画像内文字が違うことがあります。多言語ページは個別にビルドして確認します。

**アンチパターン 5：ローカルプレビューだけを信じる。**

ローカルルート、production サブパス、CDN キャッシュ、静的アセット base は異なります。デプロイ環境を模したビルドが必要です。

## テンプレート：Content Collection 設計メモ

```md
### Collection

名前：
読者：
URL プレフィックス：

### Frontmatter Contract

必須フィールド：
任意フィールド：
列挙フィールド：
デフォルト値：

### Language Policy

対応言語：
sibling ルール：
単一言語公開を許すか：

### Asset Policy

画像ディレクトリ：
カバー命名：
本文画像要件：
SVG を許すか：
リモート画像を許すか：

### Validation

ローカルチェックコマンド：
CI チェックコマンド：
ビルド後アセット検査：
人間 review 項目：

### Migration Notes

旧フィールド：
旧パス：
互換戦略：
削除時期：
```

> **記入例（Astro content migration）**
>
> 名前：engineering-practice
> 読者：AI engineering 記事を保守する開発者です
> URL プレフィックス：/engineering/practice/
> Frontmatter Contract：必須フィールド=title/date/category/description/lang；任意フィールド=coverImage/tags；列挙フィールド=difficulty；デフォルト値=draft=false
> Language Policy：対応言語=zh/ja；sibling ルール=同じ slug + .ja.md；単一言語公開を許すか=no
> Asset Policy：画像ディレクトリ=/public/images/engineering/practice；カバー命名=slug-cover.png；本文画像要件=local path と alt；SVG を許すか=no；リモート画像を許すか=no
> Validation：ローカルチェックコマンド=npm run check；CI チェックコマンド=npm run check + npm run test:ui；ビルド後アセット検査=dist の画像参照を scan します；人間 review 項=title、summary、ja parity です
> Migration Notes：旧フィールド=topic；旧パス=/posts/ai-dev/；互換戦略=redirect map；削除時期=2 回の release 後です

## チェックリスト

- collection は明確なコンテンツ領域を表しているか？
- frontmatter schema は一覧、詳細、SEO に必要な項目を含むか？
- draft、lang、category は機械可読か？
- 各公開記事に対応言語 sibling があるか？
- 画像は記事 slug ごとに整理されているか？
- ビルド後にすべてのローカルアセットを検査しているか？
- ローカルプレビューとデプロイ時サブパスの両方を確認しているか？

## さらに読む

- [Cloud & Infra：CI/CD と静的サイト自動デプロイ](../cloud-infra-02/)：内容チェックを公開パイプラインに入れる。
- [AI Coding Tools](../../start/ai-basics-for-everyone/ai-coding-tools/)：AI ツールがコンテンツ運用とコード保守にどう関わるかを理解する。
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)：公式の Content Collections ドキュメント。
