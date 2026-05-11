---
title: "App Dev メモ：Astro のページ構成とコンテンツコレクション"
date: 2026-04-03
category: engineering
description: "Astro のコンテンツコレクション（Content Collections）と動的ルーティングを活用し、多言語対応の技術ブログ・ドキュメントサイトを構築する手法を解説します。"
difficulty: intermediate
plainSummary: "コンテンツコレクション機能により Markdown に型安全な Frontmatter を定義し、動的ルーティングで各記事（Slug）を自動的にページへマッピングする効率的なワークフローを紹介します。"
coverImage: "/images/engineering/app-dev-content-collections-cover.svg"
tags:
  - "Astro"
  - "Web Dev"
lang: ja
draft: false
---

## なぜ Astro でコンテンツサイトを作るのか

Astro は「コンテンツ中心」の設計思想を持つ静的サイトジェネレーター（SSG）です。主な利点は以下の通りです。

- **デフォルトでの JavaScript ゼロ配信**：インタラクティブな要素が必要な箇所（アイランド）を除き、クライアントへ JS を送信しません。
- **コンテンツコレクション（Content Collections）**：Schema を用いて Frontmatter の構造を定義し、ビルド時に厳密な検証を行えます。
- **マルチフレームワーク対応**：React、Vue、Svelte などのコンポーネントを自由に混在させることができます。
- **Markdown ネイティブ**：Markdown や MDX を第一級市民として扱い、外部 CMS なしで高度な管理が可能です。

## コンテンツコレクションの基本構造

```
src/content/
  config.ts           # スキーマ（Schema）定義
  academy/            # コレクション名 ＝ ディレクトリ名
    article-01.md     # 中国語版
    article-01.ja.md  # 日本語版
  radar/
    daily-2026-04-27.md
```

`config.ts` で Schema を定義します。

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

ビルド時に、Schema に適合しない Frontmatter を持つファイルがあればエラーとなります。これは「運用開始後に記事のタイトルが欠落していることに気づく」といったトラブルを未然に防ぐ強力な仕組みです。

## 動的ルーティング（Dynamic Routing）

Astro では、ファイル名にブラケット（`[]`）を使用することで動的ルーティングを実現します。

```
src/pages/[category]/[...slug].astro
```

`getStaticPaths()` 関数を使用して、存在するすべてのパスを生成します。

```ts
export async function getStaticPaths() {
  const entries = await getCollection('academy');
  return entries.map((entry) => ({
    params: { category: 'academy', slug: entry.slug },
    props: { entry },
  }));
}
```

これにより、新しい Markdown ファイルを追加するだけで自動的にページが生成され、手動でルートを登録する手間が省けます。

## 多言語対応の戦略

当サイトでは、ファイル名のサフィックスで言語を判別しています。

- `article.md` → 中国語（デフォルト）
- `article.ja.md` → 日本語

コード内では `lang` フィールドを使用してコンテンツをフィルタリングします。

```ts
const zhEntries = entries.filter((entry) => entry.data.lang === 'zh');
const jaEntries = entries.filter((entry) => entry.data.lang === 'ja');
```

URL 設計としては、`/academy/...` を中国語、`/ja/academy/...` を日本語としてプレフィックスで切り分けています。

## よくある落とし穴と対策

| 事象 | 主な原因 | 対策 |
| --- | --- | --- |
| 記事が一覧に表示されない | `draft: true` になっている、または `lang` 指定の不備 | Frontmatter の設定を再確認 |
| ビルドエラーが発生する | Schema の定義と Frontmatter の不一致 | `npm run check`（astro check）で早期に検出 |
| 画像が表示されない | 相対パスの指定ミスやアセットの欠落 | `public/images/` 等に配置し、絶対パス（`/`）で参照 |
| 日本語版だけ 404 になる | `.ja.md` の Slug と URL 生成ロジックの不一致 | `getStaticPaths` でのロケール処理を確認 |

## 実践的なアドバイス

1. **Schema を最優先で定義する**：Schema はコンテンツの「契約」です。執筆前に構造を固めることで、手戻りを最小限に抑えられます。
2. **`astro check` を習慣化する**：変更後は必ずチェックを実行し、型安全性を維持します。
3. **`draft: true` を活用する**：書きかけのコンテンツは draft 指定により公開を制御します。
4. **画像管理のルール化**：画像は `public/` フォルダに配置し、パスの混乱を防ぐために絶対パスで参照することを推奨します。

## 次に読むべきコンテンツ

- 本サイトのデプロイフローの詳細：[Cloud & Infra：CI/CD とデプロイ](../cloud-infra-02/)
- AI を活用したコンテンツ制作：[AI Coding Tools](../../start/ai-basics-for-everyone/ai-coding-tools/)
