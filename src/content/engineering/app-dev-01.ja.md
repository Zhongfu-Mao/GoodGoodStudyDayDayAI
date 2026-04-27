---
title: "App Dev メモ：Astro ページとコンテンツコレクション"
date: 2026-04-03
category: engineering
description: "Astro のコンテンツコレクションと動的ルーティングで多言語コンテンツサイトを構築する：スキーマ検証、slug 生成、ページレンダリング。"
difficulty: intermediate
plainSummary: "Astro のコンテンツコレクションは Markdown に型安全な frontmatter を与え、動的ルーティングは slug を自動的にページへマッピングします。"
tags:
  - "Astro"
  - "Web Dev"
lang: ja
draft: false
---

## なぜ Astro でコンテンツサイトを作るか

Astro はコンテンツ中心の静的サイトジェネレーターです。デフォルトで JS を送らず、コンテンツコレクションでスキーマ検証ができ、Markdown が第一級市民として扱われます。

## コンテンツコレクションの構造

```
src/content/
  config.ts          # スキーマ定義
  academy/           # コレクション＝ディレクトリ名
    article-01.md
    article-01.ja.md  # 多言語版
  radar/
    daily-2026-04-27.md
```

`config.ts` でスキーマを定義すると、ビルド時にすべての frontmatter が自動検証されます。

```ts
import { defineCollection, z } from 'astro:content';

const article = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(['academy', 'engineering', 'foundations', 'radar']),
    tags: z.array(z.string()),
    lang: z.enum(['zh', 'ja']),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { academy: article, radar: article };
```

この schema は、コンテンツを書く人にとっての契約です。タイトル、言語、カテゴリ、公開状態が揃っていない記事は、公開前に止められます。

## 動的ルーティング

```
src/pages/[category]/[...slug].astro
```

`getStaticPaths()` で全パスを返すと、各 Markdown が自動的にページになります。

```ts
export async function getStaticPaths() {
  const entries = await getCollection('academy');
  return entries.map((entry) => ({
    params: { category: 'academy', slug: entry.slug },
    props: { entry },
  }));
}
```

手で URL を増やすのではなく、ファイル構造からページを作るのが content site の基本です。記事が増えても route 定義は増えません。

## 多言語対応

ファイル名サフィックスで言語を分離します。`article.md` は中国語、`article.ja.md` は日本語。URL プレフィックスで区別します。

```ts
const zhEntries = entries.filter((entry) => entry.data.lang === 'zh');
const jaEntries = entries.filter((entry) => entry.data.lang === 'ja');
```

多言語サイトでは、slug と `lang` がずれると一覧や関連記事が崩れます。ファイル名、frontmatter、URL 生成の三つを同じルールに寄せると、後から記事を増やしても破綻しにくくなります。

## よくある落とし穴

| 問題 | 原因 | 対処 |
| --- | --- | --- |
| 一覧に出ない | `draft: true` のまま、または `lang` が違う | frontmatter を確認 |
| ビルドで落ちる | schema と frontmatter が不一致 | `npm run check` で早めに検出 |
| 画像が表示されない | 相対パスや存在しない asset | `/images/...` の絶対パスにする |
| 日文だけ 404 | `.ja.md` の slug と URL 生成が不一致 | locale suffix の処理を確認 |

## 実用アドバイス

1. 先にスキーマを定義してからコンテンツを書く。
2. 修正後は毎回 `astro check` を実行する。
3. 途中のコンテンツは `draft: true` で制御する。
4. 画像は `public/` に配置し、絶対パスで参照する。
5. 似た metadata は script で補っても、公開前に本文との意味ずれを確認する。

## サイト内で次に読むもの

- [Cloud & Infra：CI/CD とデプロイ](../cloud-infra-02/)
- [AI Coding Tools](../../academy/ai-basics-for-everyone/ai-coding-tools/)
