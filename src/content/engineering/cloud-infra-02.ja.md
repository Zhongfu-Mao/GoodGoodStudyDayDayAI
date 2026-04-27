---
title: "Cloud & Infra 観察：CI/CD と静的サイトデプロイ"
date: 2026-04-10
category: engineering
description: "GitHub Actions で Astro サイトの自動ビルド、検査、デプロイを行う：push からオンラインまでの完全パイプライン。"
difficulty: intermediate
plainSummary: "CI/CD はビルド・検査・デプロイを自動化する仕組みです。push するだけで検証とデプロイが完了し、手動操作が不要になります。"
tags:
  - "CI/CD"
  - "GitHub Actions"
  - "Deployment"
lang: ja
draft: false
---

## 静的サイトのデプロイフロー

静的サイトのデプロイは「ビルド → アップロード → 切り替え」です。CI/CD でこのフローを自動化します。

## GitHub Actions の基本構造

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx astro check
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/
```

## 3 つのチェックポイント

1. **コンテンツ検証**（`astro check`）：frontmatter がスキーマに適合するか確認。0 errors で次へ。
2. **ビルド**（`npm run build`）：Markdown と Astro コンポーネントを静的 HTML にコンパイル。
3. **デプロイ**：成果物をホスティング（GitHub Pages、Cloudflare Pages 等）にアップロード。

## マルチ環境戦略

| 環境 | トリガー | 用途 |
| --- | --- | --- |
| Preview | Pull Request | チームレビュー |
| Production | push to main | 公開 |

## よくある問題

| 問題 | 原因 | 対処 |
| --- | --- | --- |
| ビルド成功だが 404 | base path 設定ミス | `astro.config.mjs` の `base` を確認 |
| 画像が表示されない | 相対パスを使用 | `/images/...` の絶対パスに変更 |
| デプロイ後に更新されない | CDN キャッシュ | キャッシュクリアまたは Cache-Control 設定 |

## サイト内で次に読むもの

- [App Dev：Astro ページとコンテンツコレクション](../app-dev-01/)
- [AI Coding Tools](../../academy/ai-basics-for-everyone/ai-coding-tools/)
