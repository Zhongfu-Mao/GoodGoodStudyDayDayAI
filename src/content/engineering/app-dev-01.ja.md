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
```

`config.ts` でスキーマを定義すると、ビルド時にすべての frontmatter が自動検証されます。

## 動的ルーティング

```
src/pages/[category]/[...slug].astro
```

`getStaticPaths()` で全パスを返すと、各 Markdown が自動的にページになります。

## 多言語対応

ファイル名サフィックスで言語を分離します。`article.md` は中国語、`article.ja.md` は日本語。URL プレフィックスで区別します。

## 実用アドバイス

1. 先にスキーマを定義してからコンテンツを書く。
2. 修正後は毎回 `astro check` を実行する。
3. 途中のコンテンツは `draft: true` で制御する。
4. 画像は `public/` に配置し、絶対パスで参照する。

## サイト内で次に読むもの

- [Cloud & Infra：CI/CD とデプロイ](../cloud-infra-02/)
- [AI Coding Tools](../../academy/ai-basics-for-everyone/ai-coding-tools/)
